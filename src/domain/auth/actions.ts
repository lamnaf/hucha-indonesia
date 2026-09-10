"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { APIError } from "better-auth";
import { auth } from "@/lib/auth";
import { UserRepository } from "@/domain/users/user.repository";
import { logAudit } from "@/domain/audit/log-audit";
import { requireAuth } from "@/domain/auth/guards";
import { ConflictError } from "@/domain/errors";
import {
  getClientIp,
  isLoginRateLimited,
  recordLoginAttempt,
} from "@/domain/auth/rate-limit";
import { loginSchema } from "@/shared/validation/auth";
import {
  changePasswordSchema,
  updateProfileSchema,
} from "@/shared/validation/admin";
import { type AdminFormState } from "@/domain/action-state";

export interface AuthActionState {
  error?: string;
}

const RATE_LIMIT_MESSAGE =
  "Terlalu banyak percobaan login. Coba lagi beberapa saat.";

/**
 * Better Auth rate limiting (blueprint §32) surfaces a 429 either as an
 * `APIError` throw or — for calls dispatched without a request — as a plain
 * response body without a session. Treat both as rate-limited.
 */
function isRateLimited(error: unknown): boolean {
  if (error instanceof APIError) {
    return error.statusCode === 429 || error.status === "TOO_MANY_REQUESTS";
  }
  return false;
}

function isSessionResult(value: unknown): value is { user: { id: string } } {
  return (
    typeof value === "object" &&
    value !== null &&
    "user" in value &&
    typeof (value as { user?: { id?: unknown } }).user?.id === "string"
  );
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data login tidak valid",
    };
  }

  const requestHeaders = await headers();
  const clientIp = getClientIp(requestHeaders);
  if (isLoginRateLimited(clientIp)) {
    return { error: RATE_LIMIT_MESSAGE };
  }
  recordLoginAttempt(clientIp);

  let userId: number;
  try {
    const result = await auth.api.signInEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
      },
      headers: requestHeaders,
    });
    if (!isSessionResult(result)) {
      console.error("[auth] signInEmail did not return a session");
      return { error: RATE_LIMIT_MESSAGE };
    }
    userId = Number(result.user.id);
  } catch (error) {
    if (isRateLimited(error)) {
      return { error: RATE_LIMIT_MESSAGE };
    }
    console.error("[auth] login failed:", error);
    return { error: "Email atau kata sandi salah" };
  }

  try {
    await new UserRepository().touchLastLogin(userId);
  } catch (error) {
    console.error("[auth] failed to record last_login_at:", error);
  }

  await logAudit({
    userId,
    action: "login",
    entityType: "user",
    entityId: String(userId),
    meta: { method: "email" },
  });

  redirect("/admin");
}

const SESSION_COOKIE_NAMES = [
  "__Secure-better-auth.session_token",
  "better-auth.session_token",
] as const;

/**
 * Defense-in-depth: explicitly expire the Better Auth session cookie on
 * logout. The sign-out route already returns the `Set-Cookie` expiry via the
 * `nextCookies` plugin, but clearing it here guarantees a stale session
 * cookie can never survive logout and bounce the admin between `/admin` and
 * `/admin/login`. Both name variants cover https (secure) and http (dev).
 */
async function clearSessionCookie() {
  try {
    const store = await cookies();
    for (const name of SESSION_COOKIE_NAMES) {
      if (store.has(name)) {
        store.delete(name);
      }
    }
  } catch (error) {
    console.error("[auth] failed to clear session cookie:", error);
  }
}

export async function logoutAction() {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (error) {
    console.error("[auth] logout failed:", error);
  }
  await clearSessionCookie();
  redirect("/admin/login");
}

/** Updates the signed-in admin's own name/email (profile page). */
export async function updateProfileAction(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAuth();
  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data profil tidak valid",
    };
  }

  try {
    await new UserRepository().update(user.id, {
      name: parsed.data.name,
      email: parsed.data.email,
    });
  } catch (error) {
    if (error instanceof ConflictError) {
      return { error: error.message };
    }
    throw error;
  }

  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "user",
    entityId: String(user.id),
    meta: { profile: true },
  });

  revalidatePath("/admin/profil");
  return { success: "Profil berhasil diperbarui" };
}

/**
 * Better Auth surfaces a wrong current password as an `APIError` carrying
 * `body.code === "INVALID_PASSWORD"`. Other codes (e.g. rate limiting) must
 * not be reported as "wrong password".
 */
function isInvalidPassword(error: unknown): boolean {
  if (!(error instanceof APIError)) {
    return false;
  }
  const code = (error as { body?: { code?: unknown } }).body?.code;
  return code === "INVALID_PASSWORD";
}

/** Changes the signed-in admin's password (verifies the current one). */
export async function changePasswordAction(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAuth();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data kata sandi tidak valid",
    };
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });
  } catch (error) {
    if (isInvalidPassword(error)) {
      return { error: "Kata sandi saat ini salah" };
    }
    if (error instanceof APIError && error.statusCode === 429) {
      return { error: RATE_LIMIT_MESSAGE };
    }
    console.error("[auth] change password failed:", error);
    return { error: "Gagal mengubah kata sandi" };
  }

  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "user",
    entityId: String(user.id),
    meta: { passwordChanged: true },
  });

  revalidatePath("/admin/profil");
  return { success: "Kata sandi berhasil diubah" };
}

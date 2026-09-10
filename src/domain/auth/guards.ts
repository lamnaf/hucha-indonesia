import { redirect } from "next/navigation";
import { ForbiddenError, UnauthorizedError } from "@/domain/errors";
import { getCurrentUser } from "@/domain/auth/session";

/**
 * Authorization guards for server code (server components, route handlers,
 * server actions) — blueprint §32 ("role check on every mutating request",
 * not just UI hiding).
 *
 * The admin panel has a single role (Super Admin). An administrator is
 * identified by `users.is_admin`, and every admin module is gated by
 * `requireAdmin`.
 */

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError("Silakan masuk terlebih dahulu");
  }
  if (!user.isActive) {
    throw new ForbiddenError("Akun Anda telah dinonaktifkan");
  }
  return user;
}

/**
 * Requires an authenticated administrator account (full access to every
 * admin module). Returns the signed-in user.
 */
export async function requireAdmin() {
  const user = await requireAuth();
  if (!user.isAdmin) {
    throw new ForbiddenError("Akun ini bukan administrator");
  }
  return user;
}

/**
 * Page-level guard: redirects signed-out or deactivated visitors to the
 * login page instead of surfacing an error boundary (used by protected
 * server components).
 */
export async function requirePageAuth() {
  try {
    return await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      redirect("/admin/login");
    }
    throw error;
  }
}

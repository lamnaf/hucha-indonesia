import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { UserRepository } from "@/domain/users/user.repository";

/**
 * Server-only session helpers (blueprint §32 / §36).
 * `auth.api.getSession` validates the request cookie and refreshes the
 * session expiry while the user is active.
 */
export async function getSession() {
  return auth.api.getSession({ headers: await getRequestHeaders() });
}

/**
 * Returns the currently signed-in user joined with their role/permissions,
 * or `null` when there is no valid session.
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user) {
    return null;
  }
  // Better Auth models `id` as a string regardless of the serial Int column.
  const repository = new UserRepository();
  return repository.findById(Number(session.user.id));
}

// `headers()` is async in Next.js 15 and returns a ReadonlyHeaders proxy that
// is not `HeadersInit`-assignable, so normalize it for better-auth's API.
async function getRequestHeaders(): Promise<Headers> {
  const store = await headers();
  return store as unknown as Headers;
}

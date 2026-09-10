/**
 * In-memory sliding-window rate limiter for the login server action.
 *
 * Better Auth's built-in `rateLimit` only guards HTTP requests through
 * `auth.handler` (`/api/auth/*`); programmatic `auth.api.signInEmail` calls
 * (server actions) bypass the router's `onRequest` hook. This limiter closes
 * that gap for the actual login entry point (blueprint §32).
 *
 * Per-instance memory storage — documented limitation for multi-instance
 * deployments; swap for a shared store (Redis/DB) if the app is scaled out.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

const attemptsByIp = new Map<string, number[]>();
let lastPruneAt = Date.now();

function pruneStale(now: number) {
  if (now - lastPruneAt < WINDOW_MS) {
    return;
  }
  const cutoff = now - WINDOW_MS;
  for (const [ip, timestamps] of attemptsByIp) {
    if (!timestamps.length || timestamps[timestamps.length - 1] <= cutoff) {
      attemptsByIp.delete(ip);
    }
  }
  lastPruneAt = now;
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || "unknown";
}

export function isLoginRateLimited(ip: string): boolean {
  const now = Date.now();
  pruneStale(now);
  const cutoff = now - WINDOW_MS;
  const recent = attemptsByIp.get(ip)?.filter((t) => t > cutoff) ?? [];
  return recent.length >= MAX_ATTEMPTS;
}

export function recordLoginAttempt(ip: string) {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const recent = (attemptsByIp.get(ip) ?? []).filter((t) => t > cutoff);
  recent.push(now);
  attemptsByIp.set(ip, recent);
}

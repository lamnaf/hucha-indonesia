import { getClientIp } from "@/domain/auth/rate-limit";

/**
 * Sliding-window rate limiter for public (unauthenticated) form submissions
 * (leads, job applications) to bound spam (§32 / §31).
 *
 * Like the login limiter, this is per-instance in-memory storage — a shared
 * store (Redis/DB) is required once the app is scaled to multiple instances.
 */

const WINDOW_MS = 60 * 60 * 1000;
const MAX_SUBMISSIONS = 10;

const submissionsByKey = new Map<string, number[]>();
let lastPruneAt = Date.now();

function pruneStale(now: number) {
  if (now - lastPruneAt < WINDOW_MS) {
    return;
  }
  const cutoff = now - WINDOW_MS;
  for (const [key, timestamps] of submissionsByKey) {
    if (!timestamps.length || timestamps[timestamps.length - 1] <= cutoff) {
      submissionsByKey.delete(key);
    }
  }
  lastPruneAt = now;
}

function buildKey(headers: Headers, kind: string): string {
  return `${kind}:${getClientIp(headers)}`;
}

export function isPublicSubmitRateLimited(
  headers: Headers,
  kind: string
): boolean {
  const now = Date.now();
  pruneStale(now);
  const cutoff = now - WINDOW_MS;
  const recent = submissionsByKey.get(buildKey(headers, kind)) ?? [];
  return recent.filter((t) => t > cutoff).length >= MAX_SUBMISSIONS;
}

export function recordPublicSubmit(headers: Headers, kind: string) {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const key = buildKey(headers, kind);
  const recent = (submissionsByKey.get(key) ?? []).filter((t) => t > cutoff);
  recent.push(now);
  submissionsByKey.set(key, recent);
}

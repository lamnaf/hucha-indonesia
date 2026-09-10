import { NextResponse } from "next/server";
import { PageViewRepository } from "@/domain/analytics/page-view.repository";
import { isBotUserAgent } from "@/lib/bot-detection";

const MAX_PATH_LENGTH = 255;
const MAX_VISITOR_LENGTH = 100;

/**
 * Lightweight page-view beacon (blueprint §28). Fired by the public site via
 * `navigator.sendBeacon`. The client manages a persistent visitor cookie and
 * sends it in the body so unique-visitor counts are stable across a day without
 * the server touching response cookies. Bot user-agents are flagged and
 * excluded from every metric downstream.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    path?: unknown;
    visitorId?: unknown;
  } | null;

  const rawPath = body?.path;
  const path =
    typeof rawPath === "string" ? rawPath.slice(0, MAX_PATH_LENGTH) : null;

  if (!path || !path.startsWith("/") || path.startsWith("/admin")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const visitorId =
    typeof body?.visitorId === "string"
      ? body.visitorId.slice(0, MAX_VISITOR_LENGTH)
      : null;

  const forwardedFor = request.headers.get("x-forwarded-for");
  const firstIp = forwardedFor?.split(",")[0]?.trim() || null;
  const isBot = isBotUserAgent(request.headers.get("user-agent"));

  await new PageViewRepository().record({
    path,
    visitorId,
    ipAddress: firstIp,
    isBot,
  });

  return new Response(null, { status: 204 });
}
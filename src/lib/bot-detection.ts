/**
 * Basic bot/crawler user-agent filtering (blueprint §28 edge case). Used by the
 * analytics tracking layer so crawler traffic never inflates visitor counts.
 * Intentionally conservative — only well-known crawler/bot user-agents match.
 */

const BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /duckduckbot/i,
  /baidubot/i,
  /yandexbot/i,
  /facebookexternalhit/i,
  /facebookcatalog/i,
  /pinterest/i,
  /slackbot/i,
  /twitterbot/i,
  /discordbot/i,
  /telegrambot/i,
  /whatsapp/i,
  /applebot/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /mj12bot/i,
  /dotbot/i,
  /petalbot/i,
  /exabot/i,
  /uptimerobot/i,
  /pingdom/i,
  /archive\.org/i,
  /wayback/i,
  /headlesschrome/i,
  /phantomjs/i,
  /python-requests/i,
  /curl/i,
  /wget/i,
  /httpie/i,
] as const;

/** Returns true when the user agent looks like a bot/crawler. */
export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) {
    return false;
  }
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}
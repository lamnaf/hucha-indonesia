import { siteConfig } from "@/lib/mock/site";

/**
 * Build a `wa.me` deep-link with an optional pre-filled message, using the
 * company WhatsApp number from site config.
 */
export function whatsappChatLink(message?: string, number?: string): string {
  const target = number ?? siteConfig.whatsappDisplay;
  const base = `https://wa.me/${target}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

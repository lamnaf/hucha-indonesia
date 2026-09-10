/**
 * Allow-list HTML sanitizer for article bodies (blueprint §27/§34).
 *
 * Article bodies may contain a small, safe subset of HTML produced by the
 * admin rich-text editor. Every tag and attribute is filtered here before the
 * body is rendered on the public site, so an article can never inject
 * scripts, event handlers, or unsafe URLs.
 *
 * Allowed:
 *   p, br, h2, h3, h4, strong, em, blockquote, ul, ol, li, a, img
 * Attribute allow-list per tag; `javascript:` and other dangerous schemes
 * are rejected outright.
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "h2",
  "h3",
  "h4",
  "strong",
  "b",
  "em",
  "i",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "img",
]);

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "title"],
  img: ["src", "alt", "title"],
};

const ALLOWED_SCHEMES = new Set(["http:", "https:", "mailto:"]);

function isSafeUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith("/")) return true;
  try {
    const parsed = new URL(trimmed);
    return ALLOWED_SCHEMES.has(parsed.protocol);
  } catch {
    return false;
  }
}

function sanitizeAttributes(tagName: string, raw: string): string {
  const allowList = ALLOWED_ATTRIBUTES[tagName];
  if (!allowList) return "";

  const attrs: string[] = [];
  const pattern = /([a-z-]+)\s*=\s*("([^"]*)"|'([^']*)')/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(raw)) !== null) {
    const name = match[1].toLowerCase();
    if (!allowList.includes(name)) continue;
    let value = match[3] ?? match[4] ?? "";
    if (name === "href" || name === "src") {
      if (!isSafeUrl(value)) continue;
    }
    value = value.replace(/"/g, "&quot;");
    attrs.push(`${name}="${value}"`);
  }
  return attrs.length > 0 ? ` ${attrs.join(" ")}` : "";
}

/**
 * Returns the article body as safe HTML. Plain-text bodies are wrapped in
 * `<p>` per paragraph so existing content renders identically to before.
 */
export function sanitizeRichText(body: string): string {
  if (!body.trim()) return "";

  // Heuristic: treat as HTML only when it actually contains a tag.
  const looksLikeHtml =
    /<(p|h[2-4]|strong|em|b|i|ul|ol|li|blockquote|a|img|br)\b/i.test(body);

  if (!looksLikeHtml) {
    return body
      .split(/\n\n+/)
      .map((paragraph) => {
        const escaped = paragraph
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br>");
        return `<p>${escaped}</p>`;
      })
      .join("");
  }

  // Tokenize into tags and text, keeping void elements and closing tags.
  const tokens = body.match(/<\/?[a-z][^>]*>|[^<]+/gi) ?? [];
  const output: string[] = [];
  const stack: string[] = [];

  for (const token of tokens) {
    const openTag = token.match(/^<([a-z][a-z0-9]*)([^>]*)\/?>$/i);
    const closeTag = token.match(/^<\/([a-z][a-z0-9]*)>$/i);

    if (closeTag) {
      const name = closeTag[1].toLowerCase();
      if (!ALLOWED_TAGS.has(name)) continue;
      if (stack[stack.length - 1] === name) {
        stack.pop();
        output.push(`</${name}>`);
      }
      continue;
    }

    if (openTag) {
      const name = openTag[1].toLowerCase();
      if (!ALLOWED_TAGS.has(name)) continue;
      const attrs = sanitizeAttributes(name, openTag[2]);
      if (name === "img") {
        if (!/src=/.test(attrs)) continue;
        output.push(`<img${attrs} />`);
        continue;
      }
      stack.push(name);
      output.push(`<${name}${attrs}>`);
      continue;
    }

    output.push(token.replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, "&amp;"));
  }

  while (stack.length > 0) {
    output.push(`</${stack.pop()}>`);
  }

  return output.join("");
}

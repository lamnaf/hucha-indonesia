/**
 * Analytics snapshot helpers (blueprint §28). The snapshot's `top_articles`
 * is a free-form JSONB array; these helpers narrow it to a stable, typed
 * shape so a malformed snapshot can never break an admin page.
 */

export interface TopArticle {
  title: string;
  views: number;
}

/** Parses a snapshot `topArticles` payload into a stable typed array. */
export function parseTopArticles(value: unknown): TopArticle[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item): item is Record<string, unknown> =>
      Boolean(item && typeof item === "object")
    )
    .map((item) => ({
      title: typeof item.title === "string" ? item.title : "Artikel",
      views: typeof item.views === "number" ? item.views : 0,
    }));
}
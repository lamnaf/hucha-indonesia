import { AnalyticsRepository } from "@/domain/analytics/analytics.repository";
import { PageViewRepository } from "@/domain/analytics/page-view.repository";
import { LeadRepository } from "@/domain/leads/lead.repository";
import { ArticleRepository } from "@/domain/articles/article.repository";

export interface AggregateDayResult {
  date: Date;
  uniqueVisitors: number;
  pageViews: number;
  newLeadsCount: number;
  topArticles: { title: string; views: number }[];
  rawRowsPruned: number;
}

const BLOG_PATH_PREFIX = "/blog/";

/** Normalizes a path into a blog slug (returns null for non-blog paths). */
function blogSlugFromPath(path: string): string | null {
  if (!path.startsWith(BLOG_PATH_PREFIX)) {
    return null;
  }
  const slug = path.slice(BLOG_PATH_PREFIX.length).split("/")[0] ?? "";
  return slug || null;
}

/**
 * Nightly aggregation job (blueprint §28): folds raw page views + new leads for
 * one calendar day (UTC) into a single `analytics_snapshots` row. Bot traffic is
 * excluded from every metric by the repository layer. Returns a summary useful
 * for cron logging.
 */
export class AnalyticsAggregationService {
  constructor(
    private readonly analytics = new AnalyticsRepository(),
    private readonly pageViews = new PageViewRepository(),
    private readonly leads = new LeadRepository(),
    private readonly articles = new ArticleRepository()
  ) {}

  /** Aggregates `date` (defaults to the previous UTC day). */
  async aggregateDay(date = new Date(Date.now() - 24 * 60 * 60 * 1000)) {
    const day = new Date(date);
    day.setUTCHours(0, 0, 0, 0);
    const next = new Date(day);
    next.setUTCDate(day.getUTCDate() + 1);

    const [pageViews, uniqueVisitors, topPaths, newLeadsCount, rawRowsPruned] =
      await Promise.all([
        this.pageViews.countWithin(day, next),
        this.pageViews.countUniqueVisitors(day, next),
        this.pageViews.topPaths(day, next, 10),
        this.leads.countCreatedWithin(day, next),
        this.pageViews.deleteOlderThan(90),
      ]);

    const slugs = new Set(
      topPaths
        .map((row) => blogSlugFromPath(row.path))
        .filter((slug): slug is string => slug !== null)
    );

    const slugTitles = await this.articles.findTitlesBySlugs(slugs);

    const topArticles = topPaths
      .map((row) => {
        const slug = blogSlugFromPath(row.path);
        if (!slug) {
          return null;
        }
        return {
          title: slugTitles.get(slug) ?? row.path,
          views: row.views,
        };
      })
      .filter((row): row is { title: string; views: number } => row !== null)
      .slice(0, 10);

    await this.analytics.upsertDaily({
      date: day,
      uniqueVisitors,
      pageViews,
      topArticles,
      newLeadsCount,
    });

    return {
      date: day,
      uniqueVisitors,
      pageViews,
      newLeadsCount,
      topArticles,
      rawRowsPruned,
    };
  }
}
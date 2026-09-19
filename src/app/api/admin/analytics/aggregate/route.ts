import { requireAdmin } from "@/domain/auth/guards";
import { AnalyticsAggregationService } from "@/domain/analytics/analytics-aggregation.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await requireAdmin();

  try {
    const body = await request.json().catch(() => ({}));
    const date = body.date ? new Date(body.date) : undefined;

    const service = new AnalyticsAggregationService();
    const result = await service.aggregateDay(date);

    return NextResponse.json({
      success: true,
      message: `Aggregation completed for ${result.date.toISOString().split("T")[0]}`,
      data: {
        date: result.date,
        uniqueVisitors: result.uniqueVisitors,
        pageViews: result.pageViews,
        newLeadsCount: result.newLeadsCount,
        topArticlesCount: result.topArticles.length,
        rawRowsPruned: result.rawRowsPruned,
      },
    });
  } catch (error) {
    console.error("Analytics aggregation failed:", error);
    return NextResponse.json(
      { success: false, error: "Aggregation failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  await requireAdmin();

  try {
    const service = new AnalyticsAggregationService();
    const result = await service.aggregateDay();

    return NextResponse.json({
      success: true,
      message: `Aggregation completed for ${result.date.toISOString().split("T")[0]}`,
      data: {
        date: result.date,
        uniqueVisitors: result.uniqueVisitors,
        pageViews: result.pageViews,
        newLeadsCount: result.newLeadsCount,
        topArticlesCount: result.topArticles.length,
        rawRowsPruned: result.rawRowsPruned,
      },
    });
  } catch (error) {
    console.error("Analytics aggregation failed:", error);
    return NextResponse.json(
      { success: false, error: "Aggregation failed" },
      { status: 500 }
    );
  }
}
import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3Icon,
  EyeIcon,
  InboxIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";

import { requireAdmin } from "@/domain/auth/guards";
import { AnalyticsRepository } from "@/domain/analytics/analytics.repository";
import { AnalyticsAggregationService } from "@/domain/analytics/analytics-aggregation.service";
import { LeadRepository } from "@/domain/leads/lead.repository";
import type { LeadType } from "@/infrastructure/database/generated/client";
import { AnalyticsLineChart } from "@/components/admin/analytics-line-chart";
import { AnalyticsBarChart } from "@/components/admin/analytics-bar-chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { leadTypeLabel } from "@/lib/admin";
import { parseTopArticles } from "@/lib/analytics";
import { GenerateSnapshotButton } from "@/components/admin/generate-snapshot-button";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

const LEAD_TYPES: LeadType[] = ["distributor", "oem", "contact", "career_note"];

interface AnalyticsSearchParams {
  range?: string;
}

function shortDate(date: Date): string {
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<AnalyticsSearchParams>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const range = params.range === "30" ? 30 : 7;

  // Day boundaries are computed entirely in UTC to match the repository,
  // which stores snapshots keyed at 00:00 UTC (§28). Mixing local time with
  // a UTC hour offset could shift a day across timezones.
  const now = new Date();
  const from = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - (range - 1)
    )
  );
  const to = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );

  const [snapshots, leadCounts] = await Promise.all([
    new AnalyticsRepository().listBetween(from, to),
    new LeadRepository().countByType(),
  ]);

  if (snapshots.length === 0) {
    const agg = new AnalyticsAggregationService();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    yesterday.setUTCHours(0, 0, 0, 0);
    for (let i = 0; i < range; i++) {
      const day = new Date(yesterday);
      day.setUTCDate(yesterday.getUTCDate() - i);
      await agg.aggregateDay(day);
    }
    const refreshed = await new AnalyticsRepository().listBetween(from, to);
    snapshots.push(...refreshed);
  }

  const totalLeads = LEAD_TYPES.reduce(
    (sum, type) => sum + leadCounts[type],
    0
  );
  const pageViews = snapshots.reduce((sum, item) => sum + item.pageViews, 0);
  const uniqueVisitors = snapshots.reduce(
    (sum, item) => sum + item.uniqueVisitors,
    0
  );
  const newLeads = snapshots.reduce((sum, item) => sum + item.newLeadsCount, 0);

  const lineData = snapshots.map((item) => ({
    label: shortDate(item.date),
    value: item.pageViews,
  }));

  const barData = LEAD_TYPES.map((type) => ({
    label: leadTypeLabel(type),
    value: leadCounts[type],
  }));

  const latest = snapshots[snapshots.length - 1];
  const topArticles = parseTopArticles(latest?.topArticles);

  const statCards = [
    {
      label: `Tayangan Halaman (${range} hari)`,
      value: pageViews,
      icon: <EyeIcon className="size-4" aria-hidden="true" />,
    },
    {
      label: `Pengunjung Unik (${range} hari)`,
      value: uniqueVisitors,
      icon: <UsersIcon className="size-4" aria-hidden="true" />,
    },
    {
      label: `Lead Baru (${range} hari)`,
      value: newLeads,
      icon: <InboxIcon className="size-4" aria-hidden="true" />,
    },
    {
      label: "Total Lead",
      value: totalLeads,
      icon: <TrendingUpIcon className="size-4" aria-hidden="true" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Ringkasan traffic dan lead dari snapshot harian (blueprint §28).
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
          <Button
            asChild
            size="sm"
            variant={range === 7 ? "default" : "ghost"}
          >
            <Link href="/admin/analytics?range=7">7 hari</Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant={range === 30 ? "default" : "ghost"}
          >
            <Link href="/admin/analytics?range=30">30 hari</Link>
          </Button>
          <GenerateSnapshotButton />
        </div>
      </div>

      {snapshots.length === 0 ? (
        <div className="rounded-xl border bg-card p-6">
          <EmptyState
            icon={<BarChart3Icon aria-hidden="true" />}
            title="Belum ada data snapshot"
            description="Snapshot analytics dibuat oleh job harian. Data live lead tetap tersedia di bawah."
          />
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border bg-card p-4">
            <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
              <span className="text-primary">{card.icon}</span>
              {card.label}
            </div>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {card.value.toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Kunjungan Halaman Harian</h2>
            <Badge variant="outline">{range} hari</Badge>
          </div>
          {lineData.length > 0 ? (
            <AnalyticsLineChart data={lineData} />
          ) : (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Data snapshot belum tersedia.
            </p>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Lead per Tipe</h2>
          <AnalyticsBarChart data={barData} />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">Artikel Terpopuler</h2>
        {topArticles.length > 0 ? (
          <ul className="space-y-2">
            {topArticles.map((article, index) => (
              <li
                key={`${article.title}-${index}`}
                className="flex items-center justify-between gap-4 border-b pb-2 text-sm last:border-0 last:pb-0"
              >
                <span className="text-muted-foreground truncate">
                  {index + 1}. {article.title}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {article.views.toLocaleString("id-ID")} tayangan
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground py-6 text-center text-sm">
            Belum ada data artikel terpopuler dari snapshot.
          </p>
        )}
      </div>
    </div>
  );
}

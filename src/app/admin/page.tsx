import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  BellIcon,
  FileClockIcon,
  FileTextIcon,
  FactoryIcon,
  InboxIcon,
  MailIcon,
  PackageIcon,
  PencilLineIcon,
  SettingsIcon,
  TrendingUpIcon,
  TruckIcon,
  UsersIcon,
} from "lucide-react";

import { requirePageAuth } from "@/domain/auth/guards";
import { ProductRepository } from "@/domain/products/product.repository";
import { ArticleRepository } from "@/domain/articles/article.repository";
import { LeadRepository } from "@/domain/leads/lead.repository";
import { NewsletterSubscriberRepository } from "@/domain/newsletter/newsletter.repository";
import { AuditLogRepository } from "@/domain/audit/audit-log.repository";
import { AnalyticsRepository } from "@/domain/analytics/analytics.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { AnalyticsLineChart } from "@/components/admin/analytics-line-chart";
import { AnalyticsBarChart } from "@/components/admin/analytics-bar-chart";
import {
  auditActionLabel,
  entityLabel,
  formatRelativeTime,
  leadTypeLabel,
  monthLabel,
} from "@/lib/admin";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint?: string;
}

function StatCard({ icon, label, value, hint }: StatCardProps) {
  return (
    <Card className="gap-3">
      <CardHeader className="flex-row items-center gap-3">
        <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
          {icon}
        </div>
        <CardTitle className="text-sm">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {hint ? (
          <span className="text-muted-foreground text-xs">{hint}</span>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboard() {
  const user = await requirePageAuth();

  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000);

  const [
    publishedProducts,
    totalArticles,
    articleByStatus,
    totalLeads,
    leadsByType,
    newsletterCount,
    newLeadsThisWeek,
    monthlyLeads,
    monthlyArticles,
    recentActivity,
    recentLeads,
    recentArticles,
  ] = await Promise.all([
    new ProductRepository().countPublished(),
    new ArticleRepository().countAll(),
    new ArticleRepository().countByStatus(),
    new LeadRepository().list({ pageSize: 1 }).then((r) => r.total),
    new LeadRepository().countByType(),
    new NewsletterSubscriberRepository().countSubscribed(),
    new LeadRepository().countNewSince(sevenDaysAgo),
    new LeadRepository().countByMonth(6),
    new ArticleRepository().countPublishedByMonth(6),
    new AuditLogRepository().list({ pageSize: 5 }),
    new LeadRepository().list({ pageSize: 5 }),
    new ArticleRepository().listAdmin({
      status: "published",
      sort: "newest",
      pageSize: 5,
    }),
    new AnalyticsRepository().latest(),
  ]);

  function countStatus(
    rows: Awaited<ReturnType<ArticleRepository["countByStatus"]>>,
    status: "draft" | "published" | "scheduled"
  ): number {
    return rows.find((row) => row.status === status)?._count._all ?? 0;
  }

  const publishedArticles = countStatus(articleByStatus, "published");
  const draftArticles = countStatus(articleByStatus, "draft");

  const contactMessages = leadsByType["contact"] ?? 0;
  const distributorLeads = leadsByType["distributor"] ?? 0;
  const oemLeads = leadsByType["oem"] ?? 0;

  const leadChartData =
    monthlyLeads?.map((item) => ({
      label: monthLabel(item.label),
      value: item.value,
    })) ?? [];
  const articleChartData =
    monthlyArticles?.map((item) => ({
      label: monthLabel(item.label),
      value: item.value,
    })) ?? [];

  const statCards: StatCardProps[] = [
    {
      icon: <PackageIcon aria-hidden="true" />,
      label: "Total Produk",
      value: publishedProducts,
      hint: "Produk terbit di katalog",
    },
    {
      icon: <FileTextIcon aria-hidden="true" />,
      label: "Total Artikel",
      value: totalArticles,
      hint: `${publishedArticles} terbit`,
    },
    {
      icon: <TrendingUpIcon aria-hidden="true" />,
      label: "Artikel Terbit",
      value: publishedArticles,
      hint: "Artikel sudah publik",
    },
    {
      icon: <PencilLineIcon aria-hidden="true" />,
      label: "Draf Artikel",
      value: draftArticles,
      hint: "Belum diterbitkan",
    },
    {
      icon: <InboxIcon aria-hidden="true" />,
      label: "Total Leads",
      value: totalLeads,
      hint: `${newLeadsThisWeek} baru minggu ini`,
    },
    {
      icon: <TruckIcon aria-hidden="true" />,
      label: "Lead Distributor",
      value: distributorLeads,
      hint: "Pendaftaran mitra",
    },
    {
      icon: <FactoryIcon aria-hidden="true" />,
      label: "Lead OEM",
      value: oemLeads,
      hint: "Inquiry maklon",
    },
    {
      icon: <UsersIcon aria-hidden="true" />,
      label: "Pesan Kontak",
      value: contactMessages,
      hint: "Formulir kontak",
    },
    {
      icon: <MailIcon aria-hidden="true" />,
      label: "Newsletter",
      value: newsletterCount,
      hint: "Subscriber aktif",
    },
  ];

  const quickLinks: { href: string; label: string; icon: React.ReactNode }[] = [
    {
      href: "/admin/blog/new",
      label: "Artikel Baru",
      icon: <FileTextIcon className="size-4" aria-hidden="true" />,
    },
    {
      href: "/admin/products/new",
      label: "Produk Baru",
      icon: <PackageIcon className="size-4" aria-hidden="true" />,
    },
    {
      href: "/admin/leads",
      label: "Lihat Semua Leads",
      icon: <InboxIcon className="size-4" aria-hidden="true" />,
    },
    {
      href: "/admin/notifications",
      label: "Notifikasi",
      icon: <BellIcon className="size-4" aria-hidden="true" />,
    },
    {
      href: "/admin/settings",
      label: "Pengaturan",
      icon: <SettingsIcon className="size-4" aria-hidden="true" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Selamat datang, <strong>{user.name}</strong> (Super Admin). Berikut
          ringkasan aktivitas platform HuCha Indonesia.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3">
            <CardTitle className="text-sm">Lead per Bulan</CardTitle>
            <Badge variant="outline">6 bulan</Badge>
          </CardHeader>
          <CardContent>
            {leadChartData.length > 0 ? (
              <AnalyticsBarChart data={leadChartData} />
            ) : (
              <EmptyState
                title="Belum ada lead"
                description="Data lead akan tampil setelah ada permintaan masuk."
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3">
            <CardTitle className="text-sm">Artikel Terbit per Bulan</CardTitle>
            <Badge variant="outline">6 bulan</Badge>
          </CardHeader>
          <CardContent>
            {articleChartData.length > 0 ? (
              <AnalyticsLineChart data={articleChartData} />
            ) : (
              <EmptyState
                icon={<FileTextIcon aria-hidden="true" />}
                title="Belum ada artikel"
                description="Artikel yang diterbitkan akan tampil di sini."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Lead Terbaru</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/leads">
                Lihat semua
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <Card>
            {recentLeads.items.length > 0 ? (
              <ul className="divide-y">
                {recentLeads.items.map((lead) => (
                  <li
                    key={lead.id}
                    className="flex items-center justify-between gap-4 px-6 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="bg-muted text-muted-foreground mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
                        <InboxIcon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="break-words text-sm font-medium">
                          {lead.fullName}
                          {lead.companyName ? ` — ${lead.companyName}` : ""}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {leadTypeLabel(lead.type)} ·{" "}
                          {formatRelativeTime(lead.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{lead.status}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={<InboxIcon aria-hidden="true" />}
                title="Belum ada lead"
                description="Permintaan masuk akan tampil di sini."
              />
            )}
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Artikel Terbit Terbaru</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/blog">
                Lihat semua
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <Card>
            {recentArticles.items.length > 0 ? (
              <ul className="divide-y">
                {recentArticles.items.map((article) => (
                  <li
                    key={article.id}
                    className="flex items-center justify-between gap-4 px-6 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="bg-muted text-muted-foreground mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
                        <FileTextIcon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="break-words text-sm font-medium">
                          {article.title}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {article.author.name} ·{" "}
                          {article.publishedAt
                            ? formatRelativeTime(article.publishedAt)
                            : "Baru"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Terbit</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={<FileTextIcon aria-hidden="true" />}
                title="Belum ada artikel terbit"
                description="Artikel yang dipublikasikan akan tampil di sini."
              />
            )}
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Aktivitas Terbaru</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/audit-log">
                Lihat semua
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <Card>
            {recentActivity.items.length > 0 ? (
              <ul className="divide-y">
                {recentActivity.items.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-start justify-between gap-4 px-6 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="bg-muted text-muted-foreground mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
                        <FileClockIcon className="size-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">
                            {auditActionLabel(entry.action)}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            {entityLabel(entry.entityType)}
                            {entry.entityId ? ` #${entry.entityId}` : ""}
                          </span>
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {entry.user?.name ?? "Sistem"} ·{" "}
                          {formatRelativeTime(entry.createdAt)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Belum ada aktivitas"
                description="Aksi admin akan tercatat di sini."
              />
            )}
          </Card>

          <h2 className="text-lg font-semibold">Aksi Cepat</h2>
          <Card>
            <CardContent className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <Button key={link.href} asChild variant="outline">
                  <Link href={link.href}>
                    {link.icon}
                    {link.label}
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
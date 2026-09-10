import type { Metadata } from "next";
import Link from "next/link";
import { FileTextIcon, FolderOpenIcon, PlusIcon, StarIcon, TagsIcon } from "lucide-react";

import { requireAdmin } from "@/domain/auth/guards";
import { ArticleRepository } from "@/domain/articles/article.repository";
import { BlogCategoryRepository } from "@/domain/articles/blog-category.repository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { PaginationNav } from "@/components/admin/pagination-nav";
import { PageHeader } from "@/components/admin/page-header";
import { articleStatusLabel, formatDateTime } from "@/lib/admin";
import type { ArticleStatus } from "@/infrastructure/database/generated/client";
import { ArticleRowActions } from "./article-actions";

/** Reading time from the stored body (~200 words/min, min 1 minute). */
function readingMinutes(body: string | null | undefined): number {
  const text = (body ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const metadata: Metadata = {
  title: "Blog & Artikel",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

const STATUS_OPTIONS: { value: ArticleStatus; label: string }[] = [
  { value: "draft", label: "Draf" },
  { value: "scheduled", label: "Terjadwal" },
  { value: "published", label: "Terbit" },
];

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    category?: string;
    sort?: string;
  }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search?.trim() || undefined;
  const status =
    params.status === "draft" ||
    params.status === "scheduled" ||
    params.status === "published"
      ? (params.status as ArticleStatus)
      : undefined;
  const category = params.category?.trim() || undefined;
  const sort =
    params.sort === "oldest" ||
    params.sort === "title" ||
    params.sort === "updated"
      ? params.sort
      : undefined;

  const [{ items, total }, categories] = await Promise.all([
    new ArticleRepository().listAdmin({
      page,
      pageSize: PAGE_SIZE,
      search,
      status,
      category,
      sort,
    }),
    new BlogCategoryRepository().list(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(nextPage: number): string {
    const query = new URLSearchParams();
    if (nextPage > 1) query.set("page", String(nextPage));
    if (search) query.set("search", search);
    if (status) query.set("status", status);
    if (category) query.set("category", category);
    if (sort) query.set("sort", sort);
    const qs = query.toString();
    return `/admin/blog${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog & Artikel"
        description="Kelola artikel blog, kategori, dan tag."
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/blog/categories">
                <FolderOpenIcon className="size-4" aria-hidden="true" />
                Kategori
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/blog/tags">
                <TagsIcon className="size-4" aria-hidden="true" />
                Tag
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/blog/new">
                <PlusIcon className="size-4" aria-hidden="true" />
                Artikel Baru
              </Link>
            </Button>
          </div>
        }
      />

      <form
        method="get"
        action="/admin/blog"
        className="flex flex-wrap items-end gap-3"
      >
        <Input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Cari judul atau slug..."
          className="max-w-xs"
          aria-label="Cari artikel"
        />
        <label className="text-sm">
          <span className="text-muted-foreground mb-1 block text-xs">
            Status
          </span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
          >
            <option value="">Semua</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-muted-foreground mb-1 block text-xs">
            Kategori
          </span>
          <select
            name="category"
            defaultValue={category ?? ""}
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
          >
            <option value="">Semua</option>
            {categories.map((categoryOption) => (
              <option key={categoryOption.id} value={categoryOption.slug}>
                {categoryOption.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-muted-foreground mb-1 block text-xs">
            Urutkan
          </span>
          <select
            name="sort"
            defaultValue={sort ?? ""}
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
          >
            <option value="">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="title">Judul</option>
            <option value="updated">Terakhir diperbarui</option>
          </select>
        </label>
        <Button type="submit" size="sm">
          Terapkan
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border bg-card">
        {items.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-4 py-3 font-medium">Artikel</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Penulis</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Dibaca</th>
                <th className="px-4 py-3 font-medium">Tayang</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((article) => (
                <tr key={article.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/blog/${article.id}`}>
                      <span className="flex items-center gap-1.5 font-medium">
                        {article.isFeatured ? (
                          <StarIcon
                            className="size-3.5 text-amber-500"
                            aria-label="Unggulan"
                          />
                        ) : null}
                        {article.title}
                      </span>
                      <span className="text-muted-foreground block break-all text-xs">
                        {article.slug}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {article.blogCategory?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">{article.author?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        article.status === "published" ? "default" : "secondary"
                      }
                    >
                      {articleStatusLabel(article.status)}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-xs">
                    {readingMinutes(article.body)} menit
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-xs">
                    {article.publishedAt
                      ? formatDateTime(article.publishedAt)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/blog/${article.id}`}>Edit</Link>
                      </Button>
                      <ArticleRowActions
                        articleId={article.id}
                        title={article.title}
                        status={article.status}
                        isFeatured={article.isFeatured}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={<FileTextIcon aria-hidden="true" />}
            title="Belum ada artikel"
            description="Mulai menulis artikel atau ubah filter pencarian Anda."
          />
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Menampilkan {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, total)} dari {total} artikel
        </p>
        <PaginationNav
          prevHref={pageHref(page - 1)}
          nextHref={pageHref(page + 1)}
          prevDisabled={page <= 1}
          nextDisabled={page >= totalPages}
        />
      </div>
    </div>
  );
}

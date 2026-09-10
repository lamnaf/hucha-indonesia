import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";

import { requireAdmin } from "@/domain/auth/guards";
import { BlogCategoryRepository } from "@/domain/articles/blog-category.repository";
import {
  createBlogCategoryAction,
  updateBlogCategoryAction,
  deleteBlogCategoryAction,
} from "@/domain/articles/taxonomy-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationNav } from "@/components/admin/pagination-nav";
import { PageHeader } from "@/components/admin/page-header";
import { TaxonomyManager } from "../taxonomy-manager";

export const metadata: Metadata = {
  title: "Kategori Blog",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

export default async function BlogCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search?.trim() || undefined;

  const { items, total } = await new BlogCategoryRepository().listAdmin({
    page,
    pageSize: PAGE_SIZE,
    search,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(nextPage: number): string {
    const query = new URLSearchParams();
    if (nextPage > 1) query.set("page", String(nextPage));
    if (search) query.set("search", search);
    const qs = query.toString();
    return `/admin/blog/categories${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategori Blog"
        description="Kelola kategori untuk mengelompokkan artikel."
        actions={
          <Button asChild variant="ghost" size="sm" className="-mr-2">
            <Link href="/admin/blog">
              <ChevronLeftIcon className="size-4" aria-hidden="true" />
              Kembali ke artikel
            </Link>
          </Button>
        }
      />

      <form method="get" action="/admin/blog/categories" className="flex gap-3">
        <Input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Cari kategori..."
          className="max-w-xs"
          aria-label="Cari kategori blog"
        />
        <Button type="submit" size="sm">
          Cari
        </Button>
      </form>

      <TaxonomyManager
          createAction={createBlogCategoryAction}
          updateAction={updateBlogCategoryAction}
          deleteAction={deleteBlogCategoryAction}
          items={items.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            count: item._count.articles,
          }))}
          entityLabel="Kategori"
          pluralLabel="Kategori"
          description="Buat kategori baru untuk mengelompokkan artikel blog."
          emptyMessage="Belum ada kategori. Buat kategori pertama Anda."
        />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Menampilkan {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, total)} dari {total} kategori
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

import type { Metadata } from "next";
import { FolderTreeIcon } from "lucide-react";

import { requireAdmin } from "@/domain/auth/guards";
import { CategoryRepository } from "@/domain/products/category.repository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { PaginationNav } from "@/components/admin/pagination-nav";
import { PageHeader } from "@/components/admin/page-header";
import { categoryTypeLabel } from "@/lib/admin";
import type { CategoryType } from "@/infrastructure/database/generated/client";
import { CategoryRowActions } from "./category-actions";
import { CreateCategoryButton } from "./create-category-button";

export const metadata: Metadata = {
  title: "Kategori Produk",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 30;

const TYPE_OPTIONS: { value: CategoryType; label: string }[] = [
  { value: "spareparts", label: "Spareparts" },
  { value: "fluids", label: "Cairan Otomotif" },
  { value: "autocare", label: "Perawatan Kendaraan" },
];

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; type?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search?.trim() || undefined;
  const type =
    params.type === "spareparts" ||
    params.type === "fluids" ||
    params.type === "autocare"
      ? (params.type as CategoryType)
      : undefined;

  const repository = new CategoryRepository();
  const [{ items, total }, topLevel] = await Promise.all([
    repository.listAdmin({ page, pageSize: PAGE_SIZE, search, type }),
    repository.listTopLevel(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(nextPage: number): string {
    const query = new URLSearchParams();
    if (nextPage > 1) query.set("page", String(nextPage));
    if (search) query.set("search", search);
    if (type) query.set("type", type);
    const qs = query.toString();
    return `/admin/categories${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategori Produk"
        description="Kelola struktur kategori produk (tipe dan sub-kategori, maksimal 2 tingkat)."
        actions={<CreateCategoryButton categories={topLevel} />}
      />

      <form
        method="get"
        action="/admin/categories"
        className="flex flex-wrap items-end gap-3"
      >
        <Input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Cari nama atau slug..."
          className="max-w-xs"
          aria-label="Cari kategori"
        />
        <label className="text-sm">
          <span className="text-muted-foreground mb-1 block text-xs">Tipe</span>
          <select
            name="type"
            defaultValue={type ?? ""}
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
          >
            <option value="">Semua</option>
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
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
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Tipe</th>
                <th className="px-4 py-3 font-medium">Induk</th>
                <th className="px-4 py-3 text-right font-medium">Produk</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((category) => (
                <tr key={category.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{category.name}</p>
                    <p className="text-muted-foreground break-all text-xs">
                      {category.slug}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">
                      {categoryTypeLabel(category.type)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {category.parent ? (
                      category.parent.name
                    ) : (
                      <Badge variant="outline">Tipe</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {category._count.products}{" "}
                    <span className="text-muted-foreground text-xs">
                      ({category._count.children} sub)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CategoryRowActions
                      category={category}
                      categories={topLevel}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={<FolderTreeIcon aria-hidden="true" />}
            title="Belum ada kategori"
            description="Buat kategori pertama Anda atau ubah filter pencarian."
          />
        )}
      </div>

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

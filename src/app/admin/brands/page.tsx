import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon, TagsIcon } from "lucide-react";

import { requireAdmin } from "@/domain/auth/guards";
import { BrandRepository } from "@/domain/brands/brand.repository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { PaginationNav } from "@/components/admin/pagination-nav";
import { PageHeader } from "@/components/admin/page-header";
import { categoryTypeLabel } from "@/lib/admin";
import type { CategoryType } from "@/infrastructure/database/generated/client";
import { BrandRowActions } from "./brand-actions";

export const metadata: Metadata = {
  title: "Merek",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; category?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search?.trim() || undefined;
  const category =
    params.category === "spareparts" ||
    params.category === "fluids" ||
    params.category === "lubricants" ||
    params.category === "autocare"
      ? (params.category as CategoryType)
      : undefined;

  const { items, total } = await new BrandRepository().list({
    page,
    pageSize: PAGE_SIZE,
    search,
    category,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(nextPage: number): string {
    const query = new URLSearchParams();
    if (nextPage > 1) query.set("page", String(nextPage));
    if (search) query.set("search", search);
    if (category) query.set("category", category);
    const qs = query.toString();
    return `/admin/brands${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Merek"
        description="Kelola lini merek yang ditampilkan pada halaman Merek Kami."
        actions={
          <Button asChild>
            <Link href="/admin/brands/new">
              <PlusIcon className="size-4" aria-hidden="true" />
              Tambah Merek
            </Link>
          </Button>
        }
      />

      <form
        method="get"
        action="/admin/brands"
        className="flex flex-wrap items-end gap-3"
      >
        <Input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Cari nama atau slug..."
          className="max-w-xs"
          aria-label="Cari merek"
        />
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
            <option value="spareparts">Spareparts</option>
            <option value="fluids">Cairan Otomotif</option>
            <option value="lubricants">Lubricants</option>
            <option value="autocare">Perawatan Kendaraan</option>
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
                <th className="px-4 py-3 font-medium">Merek</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Produk</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((brand) => (
                <tr key={brand.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/brands/${brand.id}`}
                      className="flex items-center gap-3"
                    >
                      <span className="bg-muted flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md">
                        {brand.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={brand.logo.filePath}
                            alt={brand.logo.altText ?? brand.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <TagsIcon
                            aria-hidden="true"
                            className="text-muted-foreground size-5"
                          />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium">{brand.name}</span>
                        <span className="text-muted-foreground block break-all text-xs">
                          {brand.tagline ?? brand.slug}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">
                      {categoryTypeLabel(brand.category)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {brand.isPublished ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-600/40 text-emerald-700 dark:text-emerald-400"
                      >
                        Terbit
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Draf</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {brand._count.products}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/brands/${brand.id}`}>Edit</Link>
                      </Button>
                      <BrandRowActions
                        brandId={brand.id}
                        name={brand.name}
                        productCount={brand._count.products}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={<TagsIcon aria-hidden="true" />}
            title="Belum ada merek"
            description="Buat merek pertama Anda atau ubah filter pencarian."
          />
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Menampilkan {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, total)} dari {total} merek
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

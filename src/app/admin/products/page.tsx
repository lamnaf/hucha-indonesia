import type { Metadata } from "next";
import Link from "next/link";
import { PackageIcon, PlusIcon } from "lucide-react";

import { requireAdmin } from "@/domain/auth/guards";
import { ProductRepository } from "@/domain/products/product.repository";
import { CategoryRepository } from "@/domain/products/category.repository";
import { BrandRepository } from "@/domain/brands/brand.repository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { PaginationNav } from "@/components/admin/pagination-nav";
import { PageHeader } from "@/components/admin/page-header";
import {
  categoryTypeLabel,
  productStatusLabel,
} from "@/lib/admin";
import { ProductRowActions } from "./product-actions";
import { getImageUrl } from "@/lib/utils";
import type { ProductStatus } from "@/infrastructure/database/generated/client";

export const metadata: Metadata = {
  title: "Produk",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: "draft", label: "Draf" },
  { value: "published", label: "Terbit" },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    category?: string;
    brand?: string;
  }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search?.trim() || undefined;
  const status =
    params.status === "draft" || params.status === "published"
      ? params.status
      : undefined;
  const category = params.category?.trim() || undefined;
  const brandId = params.brand ? Number(params.brand) : undefined;

  const productRepository = new ProductRepository();
  const [{ items, total }, categories, brands] = await Promise.all([
    productRepository.listAdmin({
      page,
      pageSize: PAGE_SIZE,
      search,
      status,
      category,
      brandId,
    }),
    new CategoryRepository().listTopLevel(),
    new BrandRepository().list({ pageSize: 100 }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(nextPage: number): string {
    const query = new URLSearchParams();
    if (nextPage > 1) query.set("page", String(nextPage));
    if (search) query.set("search", search);
    if (status) query.set("status", status);
    if (category) query.set("category", category);
    if (brandId) query.set("brand", String(brandId));
    const qs = query.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produk"
        description="Kelola katalog produk, status penerbitan, dan penanda unggulan."
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              <PlusIcon className="size-4" aria-hidden="true" />
              Tambah Produk
            </Link>
          </Button>
        }
      />

      <form
        method="get"
        action="/admin/products"
        className="flex flex-wrap items-end gap-3"
      >
        <Input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Cari nama atau slug..."
          className="max-w-xs"
          aria-label="Cari produk"
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
              <option
                key={categoryOption.id}
                value={categoryOption.slug}
              >
                {categoryOption.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-muted-foreground mb-1 block text-xs">
            Merek
          </span>
          <select
            name="brand"
            defaultValue={brandId ? String(brandId) : ""}
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
          >
            <option value="">Semua</option>
            {brands.items.map((brand) => (
              <option key={brand.id} value={String(brand.id)}>
                {brand.name}
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
                <th className="px-4 py-3 font-medium">Produk</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Merek</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((product) => (
                <tr key={product.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="flex items-center gap-3"
                    >
                      <span className="bg-muted flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md [&_svg]:size-5">
                        {product.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getImageUrl(product.images[0].media.filePath)}
                            alt={product.images[0].media.altText ?? product.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <PackageIcon aria-hidden="true" className="text-muted-foreground" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium">{product.name}</span>
                        <span className="text-muted-foreground block break-all text-xs">
                          {product.slug}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {product.category.name}
                    {product.subCategory
                      ? ` / ${product.subCategory.name}`
                      : ""}
                    <span className="text-muted-foreground block text-xs">
                      {categoryTypeLabel(product.category.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {product.brand ? product.brand.name : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        product.status === "published" ? "default" : "secondary"
                      }
                    >
                      {productStatusLabel(product.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/products/${product.id}`}>Edit</Link>
                      </Button>
                      <ProductRowActions
                        productId={product.id}
                        isFeatured={product.isFeatured}
                        name={product.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={<PackageIcon aria-hidden="true" />}
            title="Belum ada produk"
            description="Mulai tambahkan produk atau ubah filter pencarian Anda."
          />
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Menampilkan {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, total)} dari {total} produk
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

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import {
  categoryTypeLabel,
  type CategoryType,
  type MockCategory,
  type MockProduct,
} from "@/lib/mock/products";

type CategoryFilter = CategoryType | "all";

export interface ProductCatalogProps {
  products: MockProduct[];
  categories: MockCategory[];
}

function normalizeCategory(value?: string | null): CategoryFilter {
  return value === "spareparts" || value === "fluids" || value === "lubricants" || value === "autocare"
    ? value
    : "all";
}

function buildHref(category: CategoryFilter, search: string): string {
  const params = new URLSearchParams();
  if (category !== "all") {
    params.set("kategori", category);
  }
  const query = search.trim();
  if (query) {
    params.set("q", query);
  }
  const queryString = params.toString();
  return queryString ? `/produk?${queryString}` : "/produk";
}

function ProductCatalog({ products, categories }: ProductCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = normalizeCategory(searchParams.get("kategori"));
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
  }, [searchParams]);

  const filters: { value: CategoryFilter; label: string }[] = [
    { value: "all", label: "Semua" },
    ...categories.map((category) => ({
      value: category.type,
      label: category.name,
    })),
  ];

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        category === "all" || product.category === category;
      const matchesSearch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.subcategory.toLowerCase().includes(query) ||
        product.shortDescription.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [products, category, search]);

  function updateFilter(nextCategory: CategoryFilter, nextSearch: string) {
    setSearch(nextSearch);
    router.replace(buildHref(nextCategory, nextSearch), { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter kategori"
        >
          {filters.map((filter) => (
            <Button
              key={filter.value}
              size="sm"
              variant={category === filter.value ? "default" : "outline"}
              onClick={() => updateFilter(filter.value, search)}
              aria-pressed={category === filter.value}
            >
              {filter.label}
            </Button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <SearchIcon
            className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => updateFilter(category, event.target.value)}
            placeholder="Cari produk..."
            className="pl-9"
            aria-label="Cari produk"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<SearchIcon />}
          title="Produk tidak ditemukan"
          description={
            category === "all" && search
              ? "Coba kata kunci lain atau hapus filter pencarian."
              : "Belum ada produk pada kategori ini."
          }
          action={
            category !== "all" || search ? (
              <Button variant="outline" onClick={() => updateFilter("all", "")}>
                Reset Filter
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}

      <p className="text-muted-foreground text-sm">
        Menampilkan{" "}
        <span className="font-semibold">
          {filtered.length} dari {products.length}
        </span>{" "}
        produk
        {category !== "all"
          ? ` pada kategori ${categoryTypeLabel[category]}`
          : ""}
        {search ? ` untuk pencarian "${search}"` : ""}.
      </p>
    </div>
  );
}

export { ProductCatalog };

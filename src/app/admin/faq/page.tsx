import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { requireAdmin } from "@/domain/auth/guards";
import { FaqRepository } from "@/domain/faqs/faq.repository";
import {
  createFaqCategoryAction,
  deleteFaqCategoryAction,
  updateFaqCategoryAction,
} from "@/domain/faqs/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { PaginationNav } from "@/components/admin/pagination-nav";
import { PageHeader } from "@/components/admin/page-header";
import { TaxonomyManager } from "@/app/admin/blog/taxonomy-manager";
import { FaqRowActions } from "./faq-actions";

export const metadata: Metadata = {
  title: "FAQ",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

export default async function FaqPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    published?: string;
    category?: string;
  }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search?.trim() || undefined;
  const published =
    params.published === "true"
      ? true
      : params.published === "false"
        ? false
        : undefined;
  const categoryId = params.category ? Number(params.category) : undefined;

  const repository = new FaqRepository();
  const [{ items, total }, categories] = await Promise.all([
    repository.listAdmin({ page, pageSize: PAGE_SIZE, search, published, categoryId }),
    repository.listCategories(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(nextPage: number): string {
    const query = new URLSearchParams();
    if (nextPage > 1) query.set("page", String(nextPage));
    if (search) query.set("search", search);
    if (published !== undefined) query.set("published", String(published));
    if (categoryId) query.set("category", String(categoryId));
    const qs = query.toString();
    return `/admin/faq${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="FAQ"
        description="Kelola pertanyaan umum dan kategori yang tampil di halaman publik."
        actions={
          <Button asChild>
            <Link href="/admin/faq/new">
              <PlusIcon className="size-4" aria-hidden="true" />
              FAQ Baru
            </Link>
          </Button>
        }
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Kategori</h2>
          <p className="text-muted-foreground text-sm">
            Kelompokkan FAQ agar lebih mudah dinavigasi.
          </p>
        </div>
        <TaxonomyManager
          createAction={createFaqCategoryAction}
          updateAction={updateFaqCategoryAction}
          deleteAction={deleteFaqCategoryAction}
          items={categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            count: category._count.faqs,
          }))}
          entityLabel="Kategori"
          pluralLabel="Kategori"
          description="Nama dan slug kategori FAQ."
          emptyMessage="Belum ada kategori. Buat satu untuk mulai mengelompokkan FAQ."
          deleteHint="Kategori yang masih berisi FAQ tidak dapat dihapus."
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Daftar FAQ</h2>
          <p className="text-muted-foreground text-sm">
            Pertanyaan dan jawaban yang ditampilkan per kategori.
          </p>
        </div>

        <form
          method="get"
          action="/admin/faq"
          className="flex flex-wrap items-end gap-3"
        >
          <Input
            name="search"
            defaultValue={search ?? ""}
            placeholder="Cari pertanyaan..."
            className="max-w-xs"
            aria-label="Cari FAQ"
          />
          <label className="text-sm">
            <span className="text-muted-foreground mb-1 block text-xs">
              Status
            </span>
            <select
              name="published"
              defaultValue={published === undefined ? "" : String(published)}
              className="border-input bg-background h-9 rounded-md border px-3 text-sm"
            >
              <option value="">Semua</option>
              <option value="true">Terbit</option>
              <option value="false">Draft</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground mb-1 block text-xs">
              Kategori
            </span>
            <select
              name="category"
              defaultValue={categoryId ? String(categoryId) : ""}
              className="border-input bg-background h-9 rounded-md border px-3 text-sm"
            >
              <option value="">Semua</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
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
                  <th className="px-4 py-3 font-medium">Pertanyaan</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium">Urutan</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((faq) => (
                  <tr key={faq.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/faq/${faq.id}`}
                        className="font-medium hover:underline"
                      >
                        {faq.question}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {faq.faqCategory?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">{faq.sortOrder}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={faq.isPublished ? "default" : "secondary"}
                      >
                        {faq.isPublished ? "Terbit" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <FaqRowActions
                        faqId={faq.id}
                        question={faq.question}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              title="Belum ada FAQ"
              description="Tambahkan pertanyaan yang sering diajukan."
            />
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            Menampilkan {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, total)} dari {total} FAQ
          </p>
          <PaginationNav
            prevHref={pageHref(page - 1)}
            nextHref={pageHref(page + 1)}
            prevDisabled={page <= 1}
            nextDisabled={page >= totalPages}
          />
        </div>
      </section>
    </div>
  );
}

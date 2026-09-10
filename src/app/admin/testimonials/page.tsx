import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon, QuoteIcon, StarIcon } from "lucide-react";

import { requireAdmin } from "@/domain/auth/guards";
import { TestimonialRepository } from "@/domain/testimonials/testimonial.repository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { PaginationNav } from "@/components/admin/pagination-nav";
import { PageHeader } from "@/components/admin/page-header";
import { TestimonialRowActions } from "./testimonial-actions";

export const metadata: Metadata = {
  title: "Testimoni",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

export default async function TestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; published?: string }>;
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

  const { items, total } = await new TestimonialRepository().listAdmin({
    page,
    pageSize: PAGE_SIZE,
    search,
    published,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(nextPage: number): string {
    const query = new URLSearchParams();
    if (nextPage > 1) query.set("page", String(nextPage));
    if (search) query.set("search", search);
    if (published !== undefined) query.set("published", String(published));
    const qs = query.toString();
    return `/admin/testimonials${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimoni"
        description="Ulasan partner yang ditampilkan di halaman publik."
        actions={
          <Button asChild>
            <Link href="/admin/testimonials/new">
              <PlusIcon className="size-4" aria-hidden="true" />
              Testimoni Baru
            </Link>
          </Button>
        }
      />

      <form
        method="get"
        action="/admin/testimonials"
        className="flex flex-wrap items-end gap-3"
      >
        <Input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Cari nama partner..."
          className="max-w-xs"
          aria-label="Cari testimoni"
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
        <Button type="submit" size="sm">
          Terapkan
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border bg-card">
        {items.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-4 py-3 font-medium">Partner</th>
                <th className="px-4 py-3 font-medium">Kutipan</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((testimonial) => (
                <tr key={testimonial.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/testimonials/${testimonial.id}`}
                      className="font-medium hover:underline"
                    >
                      {testimonial.partnerName}
                    </Link>
                    {testimonial.partnerBusiness || testimonial.partnerRegion ? (
                      <p className="text-muted-foreground break-words text-xs">
                        {[testimonial.partnerBusiness, testimonial.partnerRegion]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    ) : null}
                  </td>
                  <td className="max-w-md px-4 py-3">
                    <p className="line-clamp-2 text-muted-foreground text-xs">
                      <QuoteIcon
                        className="text-muted-foreground/50 mr-1 inline size-3"
                        aria-hidden="true"
                      />
                      {testimonial.quote}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {testimonial.rating ? (
                      <span className="flex items-center gap-1 text-amber-500">
                        <StarIcon
                          className="size-4 fill-current"
                          aria-hidden="true"
                        />
                        <span className="text-muted-foreground text-xs">
                          {testimonial.rating}/5
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        testimonial.isPublished ? "default" : "secondary"
                      }
                    >
                      {testimonial.isPublished ? "Terbit" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <TestimonialRowActions
                      testimonialId={testimonial.id}
                      partnerName={testimonial.partnerName}
                      isPublished={testimonial.isPublished}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={<QuoteIcon aria-hidden="true" />}
            title="Belum ada testimoni"
            description="Tambahkan testimoni partner pertama Anda."
          />
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Menampilkan {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, total)} dari {total} testimoni
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

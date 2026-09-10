"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, FileTextIcon, SearchIcon } from "lucide-react";
import { Select } from "radix-ui";

import {
  createArticleAction,
  updateArticleAction,
} from "@/domain/articles/actions";
import { EMPTY_FORM_STATE } from "@/domain/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, SubmitButton } from "@/components/admin/form-fields";
import { FormStatus } from "@/components/admin/form-status";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { articleStatusLabel } from "@/lib/admin";
import type { ArticleStatus } from "@/infrastructure/database/generated/client";

export interface ArticleSeoInitial {
  metaTitle: string | null;
  metaDescription: string | null;
  slugOverride: string | null;
  ogImageMediaId: number | null;
  ogTitle: string | null;
  ogDescription: string | null;
  twitterCard: string | null;
  robots: string | null;
  keywords: string | null;
  canonicalUrl: string | null;
}

export interface ArticleFormProps {
  categories: { id: number; name: string }[];
  tags: { id: number; name: string }[];
  /** URL of the persisted cover image for edit-mode preview. */
  initialFeaturedMediaUrl?: string | null;
  /** URL of the persisted SEO OG image for edit-mode preview. */
  initialOgImageUrl?: string | null;
  initial?: {
    id: number;
    title: string;
    slug: string;
    blogCategoryId: number;
    featuredMediaId: number | null;
    excerpt: string | null;
    body: string | null;
    status: ArticleStatus;
    publishedAt: string | null;
    tagIds: number[];
    isFeatured: boolean;
    seo?: ArticleSeoInitial | null;
  };
}

function toDatetimeLocal(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ArticleForm({
  categories,
  tags,
  initialFeaturedMediaUrl,
  initialOgImageUrl,
  initial,
}: ArticleFormProps) {
  const isEdit = Boolean(initial);
  const [featuredKept, setFeaturedKept] = React.useState(
    initial?.featuredMediaId ? String(initial.featuredMediaId) : ""
  );
  const [ogKept, setOgKept] = React.useState(
    initial?.seo?.ogImageMediaId ? String(initial.seo.ogImageMediaId) : ""
  );
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [metaTitle, setMetaTitle] = React.useState(
    initial?.seo?.metaTitle ?? ""
  );
  const [metaDescription, setMetaDescription] = React.useState(
    initial?.seo?.metaDescription ?? ""
  );

  const metaTitleWarning =
    metaTitle.length > 0 && metaTitle.length > 60
      ? "Panjang meta title lebih dari 60 karakter"
      : metaTitle.length > 0 && metaTitle.length < 30
        ? "Meta title pendek (kurang dari 30 karakter)"
        : null;
  const metaDescriptionWarning =
    metaDescription.length > 160
      ? "Panjang meta description lebih dari 160 karakter"
      : null;

  const [state, formAction, pending] = useActionState(
    React.useCallback(
      async function submit(prev: typeof EMPTY_FORM_STATE, formData: FormData) {
        if (isEdit && initial) {
          return updateArticleAction(initial.id, prev, formData);
        }
        return createArticleAction(prev, formData);
      },
      [isEdit, initial]
    ),
    EMPTY_FORM_STATE
  );

  return (
    <form action={formAction} className="grid gap-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/admin/blog">
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
            Kembali ke daftar artikel
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isEdit ? "Edit Artikel" : "Artikel Baru"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Tulis dan kelola konten blog untuk publikasi.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Konten</h2>
          <Field label="Judul" htmlFor="article-title" required>
            <Input
              id="article-title"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Judul artikel (minimal 10 karakter)"
              required
            />
          </Field>
          <Field
            label="Slug"
            htmlFor="article-slug"
            hint="Kosongkan untuk dibuat otomatis dari judul."
          >
            <Input
              id="article-slug"
              name="slug"
              defaultValue={initial?.slug}
              placeholder="cara-merawat-oli-mesin"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kategori" htmlFor="article-category" required>
              <Select.Root
                name="blogCategoryId"
                defaultValue={initial ? String(initial.blogCategoryId) : ""}
              >
                <SelectTrigger id="article-category" className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select.Root>
            </Field>
            <Field label="Status" htmlFor="article-status">
              <Select.Root
                name="status"
                defaultValue={initial?.status ?? "draft"}
              >
                <SelectTrigger id="article-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["draft", "scheduled", "published"] as const).map(
                    (status) => (
                      <SelectItem key={status} value={status}>
                        {articleStatusLabel(status)}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select.Root>
            </Field>
          </div>
          <Field
            label="Tanggal Tayang"
            htmlFor="article-published"
            hint="Wajib untuk status terjadwal."
          >
            <Input
              id="article-published"
              name="publishedAt"
              type="datetime-local"
              defaultValue={toDatetimeLocal(initial?.publishedAt ?? null)}
            />
          </Field>
          <Field
            label="Ringkasan"
            htmlFor="article-excerpt"
            hint="Tampil pada kartu artikel. Maksimal 500 karakter."
          >
            <Textarea
              id="article-excerpt"
              name="excerpt"
              defaultValue={initial?.excerpt ?? ""}
              rows={3}
            />
          </Field>
          <Field
            label="Isi Artikel"
            htmlFor="article-body"
            hint="Dukung teks tebal, miring, judul, daftar, dan tautan."
          >
            <RichTextEditor id="article-body" name="body" defaultValue={initial?.body ?? ""} />
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Gambar & Tag</h2>
          <ImageUploadField
            name="thumbnail"
            hiddenName="featuredMediaId"
            keptValue={featuredKept}
            onKeptValueChange={setFeaturedKept}
            currentUrl={initialFeaturedMediaUrl}
            label="Gambar Sampul"
            hint="JPEG, PNG, atau WebP — maksimal 10 MB. Dioptimalkan otomatis menjadi WebP."
            disabled={pending}
          />
          <Field label="Tag">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className="border-input flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
                >
                  <input
                    type="checkbox"
                    name="tagIds"
                    value={tag.id}
                    defaultChecked={initial?.tagIds.includes(tag.id) ?? false}
                    className="accent-primary size-4"
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </Field>
          <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={initial?.isFeatured ?? false}
              className="accent-primary mt-1 size-4"
            />
            <span className="text-sm">
              <span className="block font-medium">Artikel unggulan</span>
              <span className="text-muted-foreground text-xs">
                Ditampilkan lebih menonjol di halaman blog.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="font-semibold">SEO</h2>
        <Field label="Meta Title" htmlFor="article-meta-title">
          <Input
            id="article-meta-title"
            name="metaTitle"
            value={metaTitle}
            onChange={(event) => setMetaTitle(event.target.value)}
            placeholder="Judul meta (opsional, ~50-60 karakter)"
          />
          <MetaCount current={metaTitle.length} />
          {metaTitleWarning ? (
            <p className="text-amber-600 text-xs dark:text-amber-400">
              {metaTitleWarning}
            </p>
          ) : null}
        </Field>
        <Field label="Meta Description" htmlFor="article-meta-desc">
          <Textarea
            id="article-meta-desc"
            name="metaDescription"
            value={metaDescription}
            onChange={(event) => setMetaDescription(event.target.value)}
            rows={2}
            placeholder="Ringkasan untuk hasil pencarian (maks 160 karakter)"
          />
          <MetaCount current={metaDescription.length} max={160} />
          {metaDescriptionWarning ? (
            <p className="text-amber-600 text-xs dark:text-amber-400">
              {metaDescriptionWarning}
            </p>
          ) : null}
        </Field>
        <Field
          label="Slug SEO"
          htmlFor="article-seo-slug"
          hint="Kosongkan untuk memakai slug utama."
        >
          <Input
            id="article-seo-slug"
            name="slugOverride"
            defaultValue={initial?.seo?.slugOverride ?? ""}
            placeholder="slug-seo-khusus"
          />
        </Field>
        <Field label="Open Graph Title" htmlFor="article-og-title">
          <Input
            id="article-og-title"
            name="ogTitle"
            defaultValue={initial?.seo?.ogTitle ?? ""}
            placeholder="Judul saat dibagikan ke media sosial"
          />
        </Field>
        <Field label="Open Graph Description" htmlFor="article-og-desc">
          <Textarea
            id="article-og-desc"
            name="ogDescription"
            defaultValue={initial?.seo?.ogDescription ?? ""}
            rows={2}
            placeholder="Ringkasan saat dibagikan ke media sosial"
          />
        </Field>
        <ImageUploadField
          name="ogImage"
          hiddenName="ogImageMediaId"
          keptValue={ogKept}
          onKeptValueChange={setOgKept}
          currentUrl={initialOgImageUrl}
          label="Gambar Open Graph"
          hint="Gambar default saat artikel dibagikan. Kosongkan untuk memakai gambar situs."
          disabled={pending}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Twitter Card" htmlFor="article-twitter-card">
            <Select.Root
              name="twitterCard"
              defaultValue={initial?.seo?.twitterCard ?? ""}
            >
              <SelectTrigger id="article-twitter-card" className="w-full">
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary</SelectItem>
                <SelectItem value="summary_large_image">
                  Summary Large Image
                </SelectItem>
              </SelectContent>
            </Select.Root>
          </Field>
          <Field label="Robots" htmlFor="article-robots">
            <Select.Root
              name="robots"
              defaultValue={initial?.seo?.robots ?? ""}
            >
              <SelectTrigger id="article-robots" className="w-full">
                <SelectValue placeholder="Pilih aturan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="index, follow">Index, Follow</SelectItem>
                <SelectItem value="noindex, follow">Noindex, Follow</SelectItem>
                <SelectItem value="index, nofollow">Index, Nofollow</SelectItem>
                <SelectItem value="noindex, nofollow">
                  Noindex, Nofollow
                </SelectItem>
              </SelectContent>
            </Select.Root>
          </Field>
        </div>
        <Field
          label="Keywords"
          htmlFor="article-keywords"
          hint="Pisahkan dengan koma."
        >
          <Input
            id="article-keywords"
            name="keywords"
            defaultValue={initial?.seo?.keywords ?? ""}
            placeholder="pelumas, oli mesin, perawatan mobil"
          />
        </Field>
        <Field label="Canonical URL" htmlFor="article-canonical">
          <Input
            id="article-canonical"
            name="canonicalUrl"
            defaultValue={initial?.seo?.canonicalUrl ?? ""}
            placeholder="https://hucha.id/blog/slug"
            type="url"
          />
        </Field>
        <LiveSeoPreview
          title={metaTitle || (title ? `${title} | HuCha` : "")}
          description={metaDescription}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <FormStatus state={state} />
        <div className="flex gap-2">
          <Button asChild variant="outline" type="button">
            <Link href="/admin/blog">Batal</Link>
          </Button>
          <SubmitButton pending={pending}>
            <FileTextIcon className="size-4" aria-hidden="true" />
            {isEdit ? "Simpan Perubahan" : "Buat Artikel"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}

function MetaCount({ current, max = 60 }: { current: number; max?: number }) {
  const over = current > max;
  return (
    <span
      className={`mt-1 block text-xs ${
        over ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
      }`}
    >
      {current}/{max} karakter{over ? " — melebihi batas" : ""}
    </span>
  );
}

function LiveSeoPreview({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
        <SearchIcon className="size-4" aria-hidden="true" />
        Pratinjau hasil pencarian
      </div>
      <div className="space-y-1">
        <p className="text-sm text-blue-600">{title || "Judul meta"}</p>
        <p className="text-xs">https://hucha.id/blog/slug</p>
        <p className="text-muted-foreground text-xs">
          {description || "Deskripsi meta artikel akan tampil di sini."}
        </p>
      </div>
    </div>
  );
}

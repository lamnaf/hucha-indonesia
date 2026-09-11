"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, PackageIcon } from "lucide-react";
import { Select } from "radix-ui";

import {
  createProductAction,
  updateProductAction,
} from "@/domain/products/actions";
import { EMPTY_FORM_STATE } from "@/domain/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, SubmitButton } from "@/components/admin/form-fields";
import { FormStatus } from "@/components/admin/form-status";
import { MultiImageUploadField } from "@/components/admin/image-upload-field";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ProductFormCategory {
  id: number;
  name: string;
  children: { id: number; name: string }[];
}

export interface ProductFormProps {
  categories: ProductFormCategory[];
  brands: { id: number; name: string }[];
  initial?: {
    id: number;
    name: string;
    slug: string;
    categoryId: number;
    subCategoryId: number | null;
    brandId: number | null;
    shortDescription: string | null;
    description: string | null;
    tokopediaUrl: string | null;
    shopeeUrl: string | null;
    tiktokshopUrl: string | null;
    isFeatured: boolean;
    status: "draft" | "published";
    /** Persisted gallery images (media id + URL) for edit mode. */
    images: { id: number; url: string }[];
  };
}

export function ProductForm({ categories, brands, initial }: ProductFormProps) {
  const isEdit = Boolean(initial);

  const [selectedCategory, setSelectedCategory] = React.useState(
    initial?.categoryId ?? 0
  );
  const [subcategory, setSubcategory] = React.useState(
    initial?.subCategoryId ? String(initial.subCategoryId) : ""
  );
  const [keptImages, setKeptImages] = React.useState(initial?.images ?? []);
  const [newFiles, setNewFiles] = React.useState<
    { file: File; url: string }[]
  >([]);

  // Mirror of `newFiles` so the unmount cleanup can revoke every object URL
  // still alive without depending on possibly-stale closure state.
  const newFilesRef = React.useRef(newFiles);
  React.useEffect(() => {
    newFilesRef.current = newFiles;
  }, [newFiles]);

  React.useEffect(() => {
    return () => {
      for (const item of newFilesRef.current) URL.revokeObjectURL(item.url);
    };
  }, []);

  function addNewFiles(files: File[]) {
    setNewFiles((current) => [
      ...current,
      ...files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
  }

  function removeNewFile(index: number) {
    setNewFiles((current) => {
      const removed = current[index];
      if (removed) URL.revokeObjectURL(removed.url);
      return current.filter((_, i) => i !== index);
    });
  }

  const subcategories = React.useMemo(() => {
    const category = categories.find((c) => c.id === selectedCategory);
    return category?.children ?? [];
  }, [categories, selectedCategory]);

  const [state, formAction, pending] = useActionState(
    React.useCallback(
      async function submit(prev: typeof EMPTY_FORM_STATE, formData: FormData) {
        if (isEdit && initial) {
          return updateProductAction(initial.id, prev, formData);
        }
        return createProductAction(prev, formData);
      },
      [isEdit, initial]
    ),
    EMPTY_FORM_STATE
  );

  function handleSubmit(formData: FormData) {
    // Staged files live in React state (the file input carries no name), so
    // they are appended here right before the server action runs. This is
    // what guarantees every picked image actually reaches the FormData.
    for (const item of newFilesRef.current) {
      formData.append("newImages", item.file);
    }
    formAction(formData);
  }

  // After a successful save the staged files are stored on the server — clear
  // them so re-submitting cannot upload duplicates, and release their preview
  // object URLs. `keptImages` already reflects the persisted gallery (kept +
  // new in order), so it stays untouched for further edits.
  const saved = Boolean(state.success);
  React.useEffect(() => {
    if (!saved) return;
    setNewFiles((current) => {
      for (const item of current) URL.revokeObjectURL(item.url);
      return [];
    });
  }, [saved]);

  return (
    <form action={handleSubmit} className="grid gap-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/admin/products">
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
            Kembali ke daftar produk
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isEdit ? "Edit Produk" : "Produk Baru"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isEdit
            ? "Perbarui detail produk dan unggahannya."
            : "Lengkapi detail produk. Produk dapat disimpan sebagai draf terlebih dahulu."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Informasi Produk</h2>
          <Field label="Nama Produk" htmlFor="product-name" required>
            <Input
              id="product-name"
              name="name"
              defaultValue={initial?.name}
              placeholder="Contoh: Kampas Rem HuCha Racing"
              required
            />
          </Field>
          <Field
            label="Slug"
            htmlFor="product-slug"
            hint="Kosongkan untuk dibuat otomatis dari nama."
          >
            <Input
              id="product-slug"
              name="slug"
              defaultValue={initial?.slug}
              placeholder="kampas-rem-hucha-racing"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kategori" htmlFor="product-category" required>
                <Select.Root
                  name="categoryId"
                  value={selectedCategory === 0 ? "" : String(selectedCategory)}
                  onValueChange={(value) => {
                    setSelectedCategory(Number(value));
                    setSubcategory("");
                  }}
                >
                  <input type="hidden" name="categoryId" value={selectedCategory || ""} />
                  <SelectTrigger id="product-category" className="w-full">
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
            <Field label="Sub-kategori" htmlFor="product-subcategory">
              <Select.Root
                  name="subCategoryId"
                  value={subcategory}
                  onValueChange={setSubcategory}
                >
                  <input type="hidden" name="subCategoryId" value={subcategory || ""} />
                  <SelectTrigger id="product-subcategory" className="w-full">
                    <SelectValue placeholder="Tanpa sub-kategori" />
                  </SelectTrigger>
                <SelectContent>
                  {subcategories.map((sub) => (
                    <SelectItem key={sub.id} value={String(sub.id)}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select.Root>
            </Field>
          </div>
          <Field label="Merek" htmlFor="product-brand">
            <Select.Root
              name="brandId"
              defaultValue={initial?.brandId ? String(initial.brandId) : ""}
            >
              <input type="hidden" name="brandId" value={initial?.brandId ?? ""} />
              <SelectTrigger id="product-brand" className="w-full">
                <SelectValue placeholder="Tanpa merek" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={String(brand.id)}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select.Root>
          </Field>
          <Field
            label="Deskripsi Singkat"
            htmlFor="product-short"
            hint="Tampil pada kartu produk. Maksimal 300 karakter."
          >
            <Textarea
              id="product-short"
              name="shortDescription"
              defaultValue={initial?.shortDescription ?? ""}
              rows={2}
            />
          </Field>
          <Field label="Deskripsi Lengkap" htmlFor="product-description">
            <Textarea
              id="product-description"
              name="description"
              defaultValue={initial?.description ?? ""}
              rows={6}
            />
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Penerbitan & Pemasaran</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status" htmlFor="product-status">
              <Select.Root
                name="status"
                defaultValue={initial?.status ?? "draft"}
              >
                <SelectTrigger id="product-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draf</SelectItem>
                  <SelectItem value="published">Terbit</SelectItem>
                </SelectContent>
              </Select.Root>
            </Field>
            <Field
              label="Tautan Marketplace"
              hint="Wajib minimal 1 saat terbit."
            >
              <div className="grid gap-2">
                <Input
                  name="tokopediaUrl"
                  defaultValue={initial?.tokopediaUrl ?? ""}
                  placeholder="URL Tokopedia"
                  aria-label="Tautan Tokopedia"
                />
                <Input
                  name="shopeeUrl"
                  defaultValue={initial?.shopeeUrl ?? ""}
                  placeholder="URL Shopee"
                  aria-label="Tautan Shopee"
                />
                <Input
                  name="tiktokshopUrl"
                  defaultValue={initial?.tiktokshopUrl ?? ""}
                  placeholder="URL TikTok Shop"
                  aria-label="Tautan TikTok Shop"
                />
              </div>
            </Field>
          </div>
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={initial?.isFeatured ?? false}
              className="accent-primary size-4"
            />
            Produk unggulan (ditampilkan pertama)
          </label>
          <Field
            label="Gambar Produk"
            hint="Maksimal 5 gambar. Gambar pertama menjadi gambar utama produk."
          >
            {/* Kept media ids ride along as a csv; staged files are appended
                to the submit FormData from React state (see handleSubmit). */}
            <input
              type="hidden"
              name="images"
              value={keptImages.map((image) => image.id).join(",")}
            />
            <MultiImageUploadField
              keptImages={keptImages}
              onRemoveKept={(id) =>
                setKeptImages((current) =>
                  current.filter((image) => image.id !== id)
                )
              }
              newFiles={newFiles}
              onAddFiles={addNewFiles}
              onRemoveNew={removeNewFile}
              max={5}
              disabled={pending}
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <FormStatus state={state} />
        <div className="flex gap-2">
          <Button asChild variant="outline" type="button">
            <Link href="/admin/products">Batal</Link>
          </Button>
          <SubmitButton pending={pending}>
            <PackageIcon className="size-4" aria-hidden="true" />
            {isEdit ? "Simpan Perubahan" : "Buat Produk"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}

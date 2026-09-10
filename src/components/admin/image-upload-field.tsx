"use client";

import * as React from "react";
import { ImagePlusIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // mirrors server-side limit

export interface ImageUploadFieldProps {
  /** Name of the file input submitted with the form. */
  name: string;
  /**
   * Optional hidden input name carrying the kept media id across submit.
   * Cleared automatically when a new file is chosen or the image is removed
   * ("" = no image). Omit for flows that collect files outside FormData.
   */
  hiddenName?: string;
  /** Current kept value for `hiddenName` (controlled by the parent form). */
  keptValue?: string;
  onKeptValueChange?: (value: string) => void;
  /** URL of the persisted image to preview before any new file is chosen. */
  currentUrl?: string | null;
  /** Optional notification whenever the picked file changes (null = cleared). */
  onFileChange?: (file: File | null) => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
}

/**
 * Direct image upload control used inside admin forms — [Pilih Gambar],
 * preview, [Hapus]. Replaces the old pick-from-Media-Library workflow;
 * the selected file is submitted with the form and stored by the entity's
 * own server action. Client-side checks are UX only; the server re-validates
 * magic bytes and size.
 */
export function ImageUploadField({
  name,
  hiddenName,
  keptValue = "",
  onKeptValueChange,
  currentUrl,
  onFileChange,
  label = "Gambar",
  hint,
  disabled = false,
}: ImageUploadFieldProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const preview = objectUrl ?? currentUrl ?? null;

  React.useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  function handleSelect(nextFile: File | null) {
    if (!nextFile || nextFile.size === 0) return;
    const typeOk =
      ACCEPTED_TYPES.includes(nextFile.type) ||
      /\.(jpe?g|png|webp)$/i.test(nextFile.name);
    if (!typeOk) {
      setError("Format harus JPEG, PNG, atau WebP");
      return;
    }
    if (nextFile.size > MAX_SIZE_BYTES) {
      setError("Ukuran gambar maksimal 10 MB");
      return;
    }
    setError(null);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setFile(nextFile);
    setObjectUrl(URL.createObjectURL(nextFile));
    onKeptValueChange?.("");
    onFileChange?.(nextFile);
  }

  function handleRemove() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setFile(null);
    setObjectUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    onKeptValueChange?.("");
    onFileChange?.(null);
  }

  return (
    <div className="space-y-2">
      {hiddenName ? (
        <input type="hidden" name={hiddenName} value={keptValue} />
      ) : null}
      <p className="text-sm font-medium">{label}</p>
      {preview ? (
        <div className="bg-muted relative w-fit overflow-hidden rounded-md border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={label}
            className="max-h-48 max-w-full object-contain"
          />
        </div>
      ) : (
        <div className="text-muted-foreground flex h-24 w-full items-center justify-center rounded-md border border-dashed text-xs">
          Belum ada gambar
        </div>
      )}
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" disabled={disabled}>
          <label className="cursor-pointer">
            <ImagePlusIcon className="size-4" aria-hidden="true" />
            Pilih Gambar
            <input
              ref={inputRef}
              type="file"
              name={name}
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={disabled}
              onChange={(event) => handleSelect(event.target.files?.[0] ?? null)}
            />
          </label>
        </Button>
        {(file || currentUrl) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={disabled}
          >
            <XIcon className="size-4" aria-hidden="true" />
            Hapus
          </Button>
        )}
      </div>
      {error ? (
        <p className="text-destructive text-xs">{error}</p>
      ) : (
        hint && <p className="text-muted-foreground text-xs">{hint}</p>
      )}
    </div>
  );
}

/**
 * Multi-image variant (product gallery): kept images plus newly picked files
 * are shown as one removable thumbnail strip, capped at `max` items total.
 *
 * Picked files are owned by the parent form's React state — the file input
 * carries no `name`, so the browser never submits its (reset) selection.
 * Instead, the parent appends every state-owned File to the submit FormData
 * itself, which is deterministic across browsers and keeps staged files
 * submittable no matter how often the input is cleared in between picks.
 */
export function MultiImageUploadField({
  keptImages,
  onRemoveKept,
  newFiles,
  onAddFiles,
  onRemoveNew,
  max = 5,
  disabled = false,
}: {
  keptImages: { id: number; url: string }[];
  onRemoveKept: (id: number) => void;
  newFiles: { file: File; url: string }[];
  onAddFiles: (files: File[]) => void;
  onRemoveNew: (index: number) => void;
  max?: number;
  disabled?: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const total = keptImages.length + newFiles.length;
  const atCap = total >= max;

  function handleAdd(files: FileList | null) {
    if (!files || files.length === 0) return;
    const accepted: File[] = [];
    let rejectedMessage: string | null = null;
    for (const candidate of Array.from(files)) {
      if (total + accepted.length >= max) {
        rejectedMessage = `Maksimal ${max} gambar produk`;
        break;
      }
      const typeOk =
        ACCEPTED_TYPES.includes(candidate.type) ||
        /\.(jpe?g|png|webp)$/i.test(candidate.name);
      if (!typeOk) {
        rejectedMessage = "Format harus JPEG, PNG, atau WebP";
        continue;
      }
      if (candidate.size > MAX_SIZE_BYTES) {
        rejectedMessage = "Ukuran gambar maksimal 10 MB";
        continue;
      }
      accepted.push(candidate);
    }
    setError(rejectedMessage);
    // Clear the input so picking the same file again re-fires onChange; the
    // accepted copies live on in the parent's state and FormData append.
    if (inputRef.current) inputRef.current.value = "";
    onAddFiles(accepted);
  }

  return (
    <div className="space-y-2">
      {total > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {keptImages.map((image) => (
            <li
              key={image.id}
              className="bg-muted group relative overflow-hidden rounded-md border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt="Gambar produk"
                className="size-20 object-cover"
              />
              <button
                type="button"
                onClick={() => onRemoveKept(image.id)}
                disabled={disabled}
                aria-label="Hapus gambar"
                className={cn(
                  "bg-background/80 absolute top-1 right-1 rounded-full p-1",
                  "hover:bg-background cursor-pointer"
                )}
              >
                <XIcon className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
          {newFiles.map((item, index) => (
            <li
              key={item.url}
              className="bg-muted group relative overflow-hidden rounded-md border ring-primary/40 ring-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt="Gambar baru"
                className="size-20 object-cover"
              />
              <button
                type="button"
                onClick={() => onRemoveNew(index)}
                disabled={disabled}
                aria-label="Hapus gambar"
                className={cn(
                  "bg-background/80 absolute top-1 right-1 rounded-full p-1",
                  "hover:bg-background cursor-pointer"
                )}
              >
                <XIcon className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-muted-foreground flex h-24 w-full items-center justify-center rounded-md border border-dashed text-xs">
          Belum ada gambar
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm" disabled={disabled || atCap}>
          <label className="cursor-pointer">
            <ImagePlusIcon className="size-4" aria-hidden="true" />
            Pilih Gambar
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              disabled={disabled || atCap}
              onChange={(event) => handleAdd(event.target.files)}
            />
          </label>
        </Button>
        <span className="text-muted-foreground text-xs">
          {total}/{max} gambar
        </span>
      </div>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}

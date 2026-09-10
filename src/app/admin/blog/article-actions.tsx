"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CopyIcon, SendIcon, StarIcon, Trash2Icon } from "lucide-react";

import {
  deleteArticleAction,
  duplicateArticleAction,
  publishArticleAction,
  setArticleFeaturedAction,
} from "@/domain/articles/actions";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { ArticleStatus } from "@/infrastructure/database/generated/client";

export interface ArticleRowActionsProps {
  articleId: number;
  title: string;
  status: ArticleStatus;
  isFeatured?: boolean;
}

export function ArticleRowActions({
  articleId,
  title,
  status,
  isFeatured = false,
}: ArticleRowActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function run(action: () => Promise<{ success?: string; error?: string }>) {
    startTransition(async () => {
      const res = await action();
      if (res.error) {
        toast({ variant: "destructive", title: res.error });
        return;
      }
      router.refresh();
    });
  }

  function toggleFeatured() {
    run(() => setArticleFeaturedAction(articleId, !isFeatured));
  }

  function duplicate() {
    run(() => duplicateArticleAction(articleId));
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteArticleAction(articleId);
      if (res.error) {
        toast({ variant: "destructive", title: res.error });
        setDeleteOpen(false);
        return;
      }
      setDeleteOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex items-center gap-1">
        {status !== "published" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => run(() => publishArticleAction(articleId))}
            disabled={pending}
            aria-label={`Terbitkan ${title}`}
          >
            <SendIcon className="size-4" aria-hidden="true" />
            Terbitkan
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleFeatured}
          disabled={pending}
          aria-label={
            isFeatured ? `Hapus unggulan ${title}` : `Jadikan unggulan ${title}`
          }
          title={isFeatured ? "Hapus unggulan" : "Jadikan unggulan"}
          className={isFeatured ? "text-amber-500" : ""}
        >
          <StarIcon
            className="size-4"
            aria-hidden="true"
            fill={isFeatured ? "currentColor" : "none"}
          />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={duplicate}
          disabled={pending}
          aria-label={`Duplikasi ${title}`}
          title="Duplikasi"
        >
          <CopyIcon className="size-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          className="text-destructive hover:text-destructive"
          aria-label={`Hapus ${title}`}
        >
          <Trash2Icon className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Artikel?"
        description={`"${title}" akan dihapus (soft delete).`}
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={pending}>
              {pending ? "Menghapus..." : "Hapus"}
            </Button>
          </>
        }
      />
    </>
  );
}

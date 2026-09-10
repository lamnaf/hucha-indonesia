"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StarIcon, Trash2Icon } from "lucide-react";

import {
  deleteTestimonialAction,
  setTestimonialPublishedAction,
} from "@/domain/testimonials/actions";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export interface TestimonialRowActionsProps {
  testimonialId: number;
  partnerName: string;
  isPublished: boolean;
}

export function TestimonialRowActions({
  testimonialId,
  partnerName,
  isPublished,
}: TestimonialRowActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function togglePublished() {
    startTransition(async () => {
      const res = await setTestimonialPublishedAction(
        testimonialId,
        !isPublished
      );
      if (res.error) {
        toast({ variant: "destructive", title: res.error });
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteTestimonialAction(testimonialId);
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
      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={togglePublished}
          disabled={pending}
          aria-label={isPublished ? "Tarik testimoni" : "Terbitkan testimoni"}
        >
          {isPublished ? (
            <span className="flex items-center gap-1 text-xs">
              <StarIcon className="size-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
              Terbit
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs">Terbitkan</span>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          className="text-destructive hover:text-destructive"
          aria-label={`Hapus ${partnerName}`}
        >
          <Trash2Icon className="size-4" aria-hidden="true" />
        </Button>
      </div>
      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Testimoni?"
        description={`Testimoni dari "${partnerName}" akan dihapus dan tidak lagi ditampilkan.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={pending}
            >
              {pending ? "Menghapus..." : "Hapus"}
            </Button>
          </>
        }
      />
    </>
  );
}

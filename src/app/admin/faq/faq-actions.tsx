"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";

import { deleteFaqAction } from "@/domain/faqs/actions";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export interface FaqRowActionsProps {
  faqId: number;
  question: string;
}

export function FaqRowActions({ faqId, question }: FaqRowActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteFaqAction(faqId);
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
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setDeleteOpen(true)}
        className="text-destructive hover:text-destructive"
        aria-label="Hapus FAQ"
      >
        <Trash2Icon className="size-4" aria-hidden="true" />
      </Button>
      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus FAQ?"
        description={`"${question}" akan dihapus permanen dari database.`}
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

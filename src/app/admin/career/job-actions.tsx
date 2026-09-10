"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";

import { deleteJobAction, setJobStatusAction } from "@/domain/jobs/actions";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Modal } from "@/components/ui/modal";
import type { JobStatus } from "@/infrastructure/database/generated/client";

export interface JobRowActionsProps {
  jobId: number;
  title: string;
  status: JobStatus;
}

export function JobRowActions({ jobId, title, status }: JobRowActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function toggleOpen(checked: boolean) {
    startTransition(async () => {
      const res = await setJobStatusAction(jobId, checked ? "open" : "closed");
      if (res.error) {
        toast({ variant: "destructive", title: res.error });
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteJobAction(jobId);
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
      <div className="flex items-center justify-end gap-3">
        <div className="flex items-center gap-2">
          <Switch
            checked={status === "open"}
            onCheckedChange={toggleOpen}
            disabled={pending}
            aria-label={status === "open" ? "Tutup lowongan" : "Buka lowongan"}
          />
          <span className="text-muted-foreground text-xs">
            {status === "open" ? "Dibuka" : "Ditutup"}
          </span>
        </div>
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
        title="Hapus Lowongan?"
        description={`"${title}" akan dihapus (soft delete). Lamaran terkait tetap tersimpan.`}
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

"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArchiveIcon, ArchiveRestoreIcon, Trash2Icon } from "lucide-react";

import {
  archiveLeadAction,
  deleteLeadAction,
} from "@/domain/leads/actions";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export interface LeadRowActionsProps {
  leadId: number;
  name: string;
  archived?: boolean;
}

export function LeadRowActions({
  leadId,
  name,
  archived = false,
}: LeadRowActionsProps) {
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
      toast({ title: res.success });
      router.refresh();
    });
  }

  function handleArchive() {
    run(() => archiveLeadAction(leadId, !archived));
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteLeadAction(leadId);
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
        onClick={handleArchive}
        disabled={pending}
        aria-label={archived ? `Pulihkan ${name}` : `Arsipkan ${name}`}
        title={archived ? "Pulihkan dari arsip" : "Arsipkan"}
      >
        {archived ? (
          <ArchiveRestoreIcon className="size-4" aria-hidden="true" />
        ) : (
          <ArchiveIcon className="size-4" aria-hidden="true" />
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setDeleteOpen(true)}
        className="text-destructive hover:text-destructive"
        aria-label={`Hapus ${name}`}
      >
        <Trash2Icon className="size-4" aria-hidden="true" />
      </Button>
      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Lead?"
        description={`Lead dari "${name}" akan dihapus permanen dari database.`}
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

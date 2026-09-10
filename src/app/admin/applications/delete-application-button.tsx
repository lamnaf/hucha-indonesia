"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";

import { deleteApplicationAction } from "@/domain/jobs/application-actions";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export interface DeleteApplicationButtonProps {
  applicationId: number;
  fullName: string;
}

export function DeleteApplicationButton({
  applicationId,
  fullName,
}: DeleteApplicationButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteApplicationAction(applicationId);
      if (res.error) {
        toast({ variant: "destructive", title: res.error });
        setOpen(false);
        return;
      }
      setOpen(false);
      router.push("/admin/applications");
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2Icon className="size-4" aria-hidden="true" />
        Hapus Lamaran
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Hapus Lamaran?"
        description={`Lamaran dari "${fullName}" akan dihapus permanen dari database.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
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

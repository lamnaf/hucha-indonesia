"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MailXIcon, Trash2Icon } from "lucide-react";

import {
  deleteSubscriberAction,
  setSubscriberOptOutAction,
} from "@/domain/newsletter/actions";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export interface SubscriberRowActionsProps {
  subscriberId: number;
  email: string;
  isSubscribed: boolean;
}

export function SubscriberRowActions({
  subscriberId,
  email,
  isSubscribed,
}: SubscriberRowActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function optOut() {
    startTransition(async () => {
      const res = await setSubscriberOptOutAction(subscriberId);
      if (res.error) {
        toast({ variant: "destructive", title: res.error });
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteSubscriberAction(subscriberId);
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
        {isSubscribed ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={optOut}
            disabled={pending}
            className="text-muted-foreground"
            aria-label="Hentikan langganan"
          >
            <MailXIcon className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          className="text-destructive hover:text-destructive"
          aria-label={`Hapus ${email}`}
        >
          <Trash2Icon className="size-4" aria-hidden="true" />
        </Button>
      </div>
      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Pelanggan?"
        description={`${email} akan dihapus permanen dari daftar newsletter.`}
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

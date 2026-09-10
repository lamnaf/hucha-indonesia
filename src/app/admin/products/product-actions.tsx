"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";

import {
  deleteProductAction,
  toggleProductFeaturedAction,
} from "@/domain/products/actions";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Modal } from "@/components/ui/modal";

export interface ProductRowActionsProps {
  productId: number;
  isFeatured: boolean;
  name: string;
}

export function ProductRowActions({
  productId,
  isFeatured,
  name,
}: ProductRowActionsProps) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function toggleFeatured(checked: boolean) {
    startTransition(async () => {
      const res = await toggleProductFeaturedAction(productId, checked);
      if (res.error) {
        toast({ variant: "destructive", title: res.error });
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteProductAction(productId);
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
            checked={isFeatured}
            onCheckedChange={toggleFeatured}
            disabled={pending}
            aria-label={isFeatured ? "Hapus penanda unggulan" : "Tandai unggulan"}
          />
          <span className="text-muted-foreground text-xs">Unggulan</span>
        </div>
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
      </div>

      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Produk?"
        description={`"${name}" akan dihapus (soft delete). Tindakan ini tidak menghapus berkas media terkait.`}
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

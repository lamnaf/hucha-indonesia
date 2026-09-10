"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { EMPTY_FORM_STATE } from "@/domain/action-state";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { TaxonomyForm } from "./taxonomy-form";

export interface TaxonomyManagerProps {
  createAction: (
    prev: typeof EMPTY_FORM_STATE,
    formData: FormData
  ) => Promise<typeof EMPTY_FORM_STATE>;
  updateAction: (
    id: number,
    prev: typeof EMPTY_FORM_STATE,
    formData: FormData
  ) => Promise<typeof EMPTY_FORM_STATE>;
  deleteAction: (id: number) => Promise<typeof EMPTY_FORM_STATE>;
  items: {
    id: number;
    name: string;
    slug: string;
    count: number;
  }[];
  entityLabel: string;
  pluralLabel: string;
  description: string;
  emptyMessage: string;
  deleteHint?: string;
}

/**
 * Row actions + create button for simple taxonomy records (blog categories,
 * tags). The page supplies the server actions and the current items.
 */
export function TaxonomyManager({
  createAction,
  updateAction,
  deleteAction,
  items,
  entityLabel,
  pluralLabel,
  description,
  emptyMessage,
  deleteHint,
}: TaxonomyManagerProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [edit, setEdit] = useState<{
    id: number;
    name: string;
    slug: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteAction(deleteTarget.id);
      if (res.error) {
        toast({ variant: "destructive", title: res.error });
        setDeleteTarget(null);
        return;
      }
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-2 py-3 font-medium">{entityLabel}</th>
                <th className="px-2 py-3 text-right font-medium">Artikel</th>
                <th className="px-2 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="px-2 py-3">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground text-xs">{item.slug}</p>
                  </td>
                  <td className="px-2 py-3 text-right">{item.count}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEdit({
                            id: item.id,
                            name: item.name,
                            slug: item.slug,
                          })
                        }
                        aria-label={`Edit ${item.name}`}
                      >
                        <PencilIcon className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(item)}
                        className="text-destructive hover:text-destructive"
                        aria-label={`Hapus ${item.name}`}
                      >
                        <Trash2Icon className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground py-10 text-center text-sm">
            {emptyMessage}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <PlusIcon className="size-4" aria-hidden="true" />
          Tambah {entityLabel}
        </Button>
      </div>

      <TaxonomyForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        createAction={createAction}
        updateAction={updateAction}
        title={`Tambah ${entityLabel}`}
        description={description}
      />
      <TaxonomyForm
        open={Boolean(edit)}
        onOpenChange={(open) => {
          if (!open) setEdit(null);
        }}
        createAction={createAction}
        updateAction={updateAction}
        initial={edit ?? undefined}
        title={`Edit ${entityLabel}`}
        description={description}
      />
      <Modal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`Hapus ${entityLabel}?`}
        description={
          deleteHint ??
          `"${deleteTarget?.name ?? ""}" akan dihapus. ${pluralLabel} yang masih digunakan oleh artikel tidak dapat dihapus.`
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
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

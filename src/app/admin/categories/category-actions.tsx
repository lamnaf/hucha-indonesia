"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PencilIcon, Trash2Icon } from "lucide-react";

import { deleteCategoryAction } from "@/domain/products/category-actions";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { CategoryForm, type CategoryFormCategory } from "./category-form";

export interface CategoryRowActionsProps {
  category: {
    id: number;
    name: string;
    slug: string;
    type: "spareparts" | "fluids" | "autocare";
    parentId: number | null;
  };
  categories: CategoryFormCategory[];
}

export function CategoryRowActions({
  category,
  categories,
}: CategoryRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteCategoryAction(category.id);
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
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setEditOpen(true)}
          aria-label={`Edit ${category.name}`}
        >
          <PencilIcon className="size-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          className="text-destructive hover:text-destructive"
          aria-label={`Hapus ${category.name}`}
        >
          <Trash2Icon className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <CategoryForm
        open={editOpen}
        onOpenChange={setEditOpen}
        categories={categories}
        initial={category}
        title="Edit Kategori"
        description="Perbarui nama, slug, tipe, atau induk kategori."
      />

      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Kategori?"
        description={`"${category.name}" akan dihapus. Kategori yang masih memiliki produk atau sub-kategori tidak dapat dihapus.`}
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

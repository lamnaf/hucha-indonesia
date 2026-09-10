"use client";

import * as React from "react";
import { useState } from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CategoryForm,
  type CategoryFormCategory,
} from "./category-form";

export interface CreateCategoryButtonProps {
  categories: CategoryFormCategory[];
}

export function CreateCategoryButton({
  categories,
}: CreateCategoryButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <PlusIcon className="size-4" aria-hidden="true" />
        Tambah Kategori
      </Button>
      <CategoryForm
        open={open}
        onOpenChange={setOpen}
        categories={categories}
        title="Tambah Kategori"
        description="Buat tipe kategori baru atau sub-kategori di bawah tipe yang ada."
      />
    </>
  );
}

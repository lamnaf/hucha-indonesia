"use client";

import { useState } from "react";
import { Select } from "radix-ui";

import { submitOemLeadAction } from "@/domain/leads/public-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { FormSuccess } from "@/components/forms/form-success";
import { FormError } from "@/components/forms/form-error";
import { HoneypotField } from "@/components/forms/honeypot-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { useServerSubmit } from "@/components/forms/use-server-submit";
import { whatsappChatLink } from "@/lib/whatsapp-link";

const categoryOptions = [
  { value: "fluids", label: "Cairan Otomotif" },
  { value: "autocare", label: "Perawatan Kendaraan" },
  { value: "other", label: "Lainnya" },
];

function OemForm() {
  const { status, errors, error, handleSubmit, reset } =
    useServerSubmit(submitOemLeadAction);
  const [successCompany, setSuccessCompany] = useState("");

  async function onSubmit(formData: FormData) {
    const ok = await handleSubmit(formData);
    if (ok) {
      setSuccessCompany(String(formData.get("companyName") ?? ""));
    }
  }

  if (status === "success") {
    return (
      <FormSuccess
        title="Inquiry OEM terkirim!"
        description={`Terima kasih, kami telah menerima inquiry dari ${successCompany}. Tim kami akan menghubungi Anda dalam 1x24 jam kerja.`}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <a
                href={whatsappChatLink(
                  `Halo HuCha Indonesia, saya mewakili ${successCompany} ingin membahas kerja sama OEM.`
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat via WhatsApp
              </a>
            </Button>
            <Button variant="outline" onClick={reset}>
              Kirim inquiry lain
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <form action={onSubmit} className="space-y-4" noValidate>
      <HoneypotField />
      <FormField
        id="companyName"
        label="Nama Perusahaan"
        error={errors.companyName}
      >
        <Input
          name="companyName"
          placeholder="Contoh: PT Maju Bersama"
          required
        />
      </FormField>
      <FormField id="picName" label="Nama PIC" error={errors.picName}>
        <Input name="picName" placeholder="Contoh: Andi Pratama" required />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="whatsapp"
          label="WhatsApp (opsional)"
          error={errors.whatsapp}
        >
          <Input name="whatsapp" type="tel" placeholder="08xxxxxxxxxx" />
        </FormField>
        <FormField id="email" label="Email (opsional)" error={errors.email}>
          <Input name="email" type="email" placeholder="nama@perusahaan.com" />
        </FormField>
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor="categoryOfInterest"
          className="text-sm leading-none font-medium select-none"
        >
          Kategori Produk yang Diminati
        </label>
        <Select.Root name="categoryOfInterest" defaultValue="fluids">
          <SelectTrigger id="categoryOfInterest" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select.Root>
        {errors.categoryOfInterest ? (
          <p
            id="categoryOfInterest-error"
            className="text-destructive text-xs"
            role="alert"
          >
            {errors.categoryOfInterest}
          </p>
        ) : null}
      </div>
      <FormField
        id="message"
        label="Pesan / Kebutuhan"
        error={errors.message}
        hint="Minimal 20 karakter"
      >
        <Textarea
          name="message"
          placeholder="Jelaskan kebutuhan produksi, perkiraan volume, dan spesifikasi yang Anda inginkan..."
          className="min-h-32"
          required
        />
      </FormField>
      <FormError message={error} />
      <SubmitButton
        pending={status === "submitting"}
        className="w-full sm:w-auto"
      >
        Kirim Inquiry OEM
      </SubmitButton>
    </form>
  );
}

export { OemForm };

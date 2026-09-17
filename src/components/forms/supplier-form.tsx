"use client";

import { useState } from "react";

import { submitSupplierLeadAction } from "@/domain/leads/public-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";
import { FormSuccess } from "@/components/forms/form-success";
import { FormError } from "@/components/forms/form-error";
import { HoneypotField } from "@/components/forms/honeypot-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { useServerSubmit } from "@/components/forms/use-server-submit";
import { whatsappChatLink } from "@/lib/whatsapp-link";

function SupplierForm() {
  const { status, errors, error, handleSubmit, reset } = useServerSubmit(
    submitSupplierLeadAction
  );
  const [successName, setSuccessName] = useState("");

  async function onSubmit(formData: FormData) {
    const ok = await handleSubmit(formData);
    if (ok) {
      setSuccessName(String(formData.get("companyName") ?? ""));
    }
  }

  if (status === "success") {
    return (
      <FormSuccess
        title="Pendaftaran terkirim!"
        description={`Terima kasih ${successName}. Tim procurement kami akan menghubungi Anda dalam 1x24 jam kerja.`}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <a
                href={whatsappChatLink(
                  `Halo HUCHA Indonesia, kami ${successName} ingin mempercepat proses pendaftaran supplier.`
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat via WhatsApp
              </a>
            </Button>
            <Button variant="outline" onClick={reset}>
              Kirim pendaftaran lain
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <form action={onSubmit} className="space-y-4" noValidate>
      <HoneypotField />
      <FormField id="companyName" label="Nama Perusahaan" error={errors.companyName}>
        <Input name="companyName" placeholder="Contoh: PT Bahan Baku Berkualitas" required />
      </FormField>
      <FormField id="picName" label="Nama PIC (Person In Charge)" error={errors.picName}>
        <Input name="picName" placeholder="Contoh: Budi Santoso" required />
      </FormField>
      <FormField id="region" label="Wilayah/Lokasi Pabrik" error={errors.region}>
        <Input
          name="region"
          placeholder="Contoh: Bekasi, Jawa Barat"
          required
        />
      </FormField>
      <FormField
        id="whatsapp"
        label="Nomor WhatsApp"
        error={errors.whatsapp}
        hint="Contoh: 0812xxxxxxxx atau +62 812-xxxx-xxxx"
      >
        <Input name="whatsapp" type="tel" placeholder="08xxxxxxxxxx" required />
      </FormField>
      <FormField id="email" label="Email" error={errors.email}>
        <Input name="email" type="email" placeholder="procurement@perusahaan.com" required />
      </FormField>
      <FormField
        id="productCategory"
        label="Kategori Produk yang Diminati"
        error={errors.productCategory}
      >
        <Input
          name="productCategory"
          placeholder="Contoh: Base oil, additives, kemasan, dll"
          required
        />
      </FormField>
      <FormField
        id="description"
        label="Deskripsi Perusahaan & Kapasitas Produksi"
        error={errors.description}
      >
        <Textarea
          name="description"
          placeholder="Jelaskan singkat profil perusahaan, kapasitas produksi, sertifikasi yang dimiliki, dll"
          className="min-h-28"
          required
        />
      </FormField>
      <FormError message={error} />
      <SubmitButton
        pending={status === "submitting"}
        className="w-full sm:w-auto"
      >
        Daftar Sebagai Supplier
      </SubmitButton>
    </form>
  );
}

export { SupplierForm };
"use client";

import { useState } from "react";

import { submitDistributorLeadAction } from "@/domain/leads/public-actions";
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

function DistributorForm() {
  const { status, errors, error, handleSubmit, reset } = useServerSubmit(
    submitDistributorLeadAction
  );
  const [successName, setSuccessName] = useState("");

  async function onSubmit(formData: FormData) {
    const ok = await handleSubmit(formData);
    if (ok) {
      setSuccessName(String(formData.get("fullName") ?? ""));
    }
  }

  if (status === "success") {
    return (
      <FormSuccess
        title="Pendaftaran terkirim!"
        description={`Terima kasih ${successName}. Tim sales kami akan menghubungi Anda dalam 1x24 jam kerja.`}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <a
                href={whatsappChatLink(
                  `Halo HuCha Indonesia, saya ${successName} ingin mempercepat proses pendaftaran distributor.`
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
      <FormField id="fullName" label="Nama Lengkap" error={errors.fullName}>
        <Input name="fullName" placeholder="Contoh: Budi Santoso" required />
      </FormField>
      <FormField id="region" label="Wilayah" error={errors.region}>
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
      <FormField
        id="businessType"
        label="Jenis Usaha (opsional)"
        error={errors.businessType}
      >
        <Textarea
          name="businessType"
          placeholder="Contoh: Toko onderdil, bengkel, atau distributor"
          className="min-h-20"
        />
      </FormField>
      <FormError message={error} />
      <SubmitButton
        pending={status === "submitting"}
        className="w-full sm:w-auto"
      >
        Daftar Sebagai Distributor
      </SubmitButton>
    </form>
  );
}

export { DistributorForm };

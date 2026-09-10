"use client";

import { useState } from "react";

import { submitContactLeadAction } from "@/domain/leads/public-actions";
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

function ContactForm() {
  const { status, errors, error, handleSubmit, reset } = useServerSubmit(
    submitContactLeadAction
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
        title="Pesan terkirim!"
        description={`Terima kasih ${successName}. Tim kami akan membalas pesan Anda melalui email secepatnya.`}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <a
                href={whatsappChatLink(
                  `Halo HuCha Indonesia, saya ${successName} ingin berbicara lebih cepat.`
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat via WhatsApp
              </a>
            </Button>
            <Button variant="outline" onClick={reset}>
              Kirim pesan lain
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
      <FormField id="email" label="Email" error={errors.email}>
        <Input
          name="email"
          type="email"
          placeholder="nama@email.com"
          required
        />
      </FormField>
      <FormField
        id="message"
        label="Pesan"
        error={errors.message}
        hint="Minimal 10 karakter"
      >
        <Textarea
          name="message"
          placeholder="Tuliskan pertanyaan atau kebutuhan Anda..."
          className="min-h-32"
          required
        />
      </FormField>
      <FormError message={error} />
      <SubmitButton
        pending={status === "submitting"}
        className="w-full sm:w-auto"
      >
        Kirim Pesan
      </SubmitButton>
    </form>
  );
}

export { ContactForm };

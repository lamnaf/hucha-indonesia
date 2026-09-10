"use client";

import { useState } from "react";

import { submitJobApplicationAction } from "@/domain/jobs/public-application-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";
import { FormSuccess } from "@/components/forms/form-success";
import { FormError } from "@/components/forms/form-error";
import { HoneypotField } from "@/components/forms/honeypot-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { useServerSubmit } from "@/components/forms/use-server-submit";
import type { MockJob } from "@/lib/mock/jobs";

const MAX_CV_MB = 5;

export interface CareerApplicationFormProps {
  job: MockJob;
}

function CareerApplicationForm({ job }: CareerApplicationFormProps) {
  const { status, errors, error, handleSubmit, reset } = useServerSubmit(
    submitJobApplicationAction
  );
  const [cvError, setCvError] = useState<string | undefined>();
  const [cvName, setCvName] = useState<string | undefined>();
  const [successName, setSuccessName] = useState("");

  function validateCv(file: File | undefined): string | undefined {
    if (!file) {
      return "Unggah CV wajib diisi";
    }
    const allowed = ["application/pdf", "application/msword"];
    const isWordDoc =
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (!allowed.includes(file.type) && !isWordDoc) {
      return "Format CV harus PDF, DOC, atau DOCX";
    }
    if (file.size > MAX_CV_MB * 1024 * 1024) {
      return `Ukuran CV maksimal ${MAX_CV_MB}MB`;
    }
    return undefined;
  }

  async function onSubmit(formData: FormData) {
    const file = (formData.get("cv") as File | null) ?? undefined;
    setCvError(validateCv(file));
    setCvName(file?.name);
    const ok = await handleSubmit(formData);
    if (ok) {
      setSuccessName(String(formData.get("fullName") ?? ""));
    }
  }

  if (status === "success") {
    return (
      <FormSuccess
        title="Lamaran terkirim!"
        description={`Terima kasih ${successName}. Lamaran Anda untuk posisi ${job.title} telah kami terima dan akan kami tinjau.`}
        action={
          <Button variant="outline" onClick={reset}>
            Kirim lamaran lain
          </Button>
        }
      />
    );
  }

  return (
    <form action={onSubmit} className="space-y-4" noValidate>
      <HoneypotField />
      <input type="hidden" name="jobId" value={job.id} />
      <FormField id="fullName" label="Nama Lengkap" error={errors.fullName}>
        <Input name="fullName" placeholder="Contoh: Dinda Putri" required />
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
        id="phone"
        label="Nomor Telepon (opsional)"
        error={errors.phone}
      >
        <Input name="phone" type="tel" placeholder="08xxxxxxxxxx" />
      </FormField>
      <div className="space-y-1.5">
        <Label htmlFor="cv">Unggah CV</Label>
        <Input
          id="cv"
          name="cv"
          type="file"
          accept=".pdf,.doc,.docx"
          aria-invalid={cvError || errors.cv ? true : undefined}
          aria-describedby={cvError || errors.cv ? "cv-error" : undefined}
          onChange={(event) => {
            const selected = event.target.files?.[0];
            setCvName(selected?.name);
            setCvError(validateCv(selected));
          }}
        />
        <p className="text-muted-foreground text-xs">
          {cvName
            ? `Terpilih: ${cvName}`
            : "PDF, DOC, atau DOCX — maksimal 5MB"}
        </p>
        {cvError || errors.cv ? (
          <p id="cv-error" className="text-destructive text-xs" role="alert">
            {cvError ?? errors.cv}
          </p>
        ) : null}
      </div>
      <FormField
        id="coverNote"
        label="Catatan Singkat (opsional)"
        error={errors.coverNote}
      >
        <Textarea
          name="coverNote"
          placeholder="Ceritakan pengalaman dan alasan Anda melamar posisi ini..."
          className="min-h-24"
        />
      </FormField>
      <FormError message={error} />
      <SubmitButton
        pending={status === "submitting"}
        className="w-full sm:w-auto"
      >
        Kirim Lamaran
      </SubmitButton>
    </form>
  );
}

export { CareerApplicationForm };

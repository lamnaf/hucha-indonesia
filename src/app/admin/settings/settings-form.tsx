"use client";

import * as React from "react";
import { useActionState } from "react";

import { type SettingsGroup } from "@/shared/validation/admin";
import { updateSettingsAction } from "@/domain/settings/actions";
import { EMPTY_FORM_STATE } from "@/domain/action-state";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Field } from "@/components/admin/form-fields";
import { SubmitButton } from "@/components/admin/form-fields";
import { FormStatus } from "@/components/admin/form-status";
import { ImageUploadField } from "@/components/admin/image-upload-field";

type FieldKind = "text" | "email" | "tel" | "number" | "password" | "switch";

interface TextFieldDef {
  name: string;
  label: string;
  kind?: FieldKind;
  placeholder?: string;
  hint?: string;
}

interface MediaFieldDef {
  name: string;
  label: string;
  kind: "media";
  hint?: string;
}

type FieldDef = TextFieldDef | MediaFieldDef;

const COMPANY_FIELDS: TextFieldDef[] = [
  { name: "name", label: "Nama Merek", placeholder: "HuCha Indonesia" },
  {
    name: "legalName",
    label: "Nama Legal",
    placeholder: "CV Usaha Bintang Mulia",
  },
  {
    name: "address",
    label: "Alamat",
    placeholder: "Jl. Raya Industri No. 45, Cikarang",
  },
  {
    name: "phone",
    label: "Telepon",
    kind: "tel",
    placeholder: "+6280000000000",
  },
  {
    name: "email",
    label: "Email",
    kind: "email",
    placeholder: "halo@hucha.id",
  },
  {
    name: "whatsapp",
    label: "WhatsApp",
    kind: "tel",
    placeholder: "+6280000000000",
  },
];

const SOCIAL_FIELDS: TextFieldDef[] = [
  {
    name: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/hucha.indonesia",
  },
  {
    name: "tiktok",
    label: "TikTok",
    placeholder: "https://tiktok.com/@hucha.indonesia",
  },
  {
    name: "whatsapp",
    label: "WhatsApp (link)",
    placeholder: "https://wa.me/6280000000000",
  },
];

const SEO_FIELDS: TextFieldDef[] = [
  {
    name: "defaultMetaTitle",
    label: "Meta Title Default",
    hint: "Disarankan maksimal 60 karakter.",
  },
  {
    name: "defaultMetaDescription",
    label: "Meta Description Default",
    hint: "Disarankan maksimal 155 karakter.",
  },
];

const SMTP_FIELDS: TextFieldDef[] = [
  { name: "host", label: "Host SMTP", placeholder: "smtp.hucha.id" },
  { name: "port", label: "Port", kind: "number", placeholder: "587" },
  { name: "user", label: "Username", placeholder: "no-reply@hucha.id" },
  { name: "password", label: "Password", kind: "password" },
  { name: "fromName", label: "Nama Pengirim", placeholder: "HuCha Indonesia" },
  {
    name: "fromEmail",
    label: "Email Pengirim",
    kind: "email",
    placeholder: "no-reply@hucha.id",
  },
  {
    name: "secure",
    label: "Gunakan koneksi aman (SSL/TLS)",
    kind: "switch",
    hint: "Aktifkan untuk port 465.",
  },
];

const ANALYTICS_FIELDS: TextFieldDef[] = [
  {
    name: "googleAnalyticsId",
    label: "Google Analytics 4 ID",
    placeholder: "G-XXXXXXXXXX",
  },
  {
    name: "googleTagManagerId",
    label: "Google Tag Manager ID",
    placeholder: "GTM-XXXXXXX",
  },
];

const MEDIA_FIELDS: MediaFieldDef[] = [
  {
    name: "logo",
    label: "Logo",
    kind: "media",
    hint: "Tampil di header & footer.",
  },
  { name: "favicon", label: "Favicon", kind: "media" },
  { name: "ogImage", label: "Gambar OG Default", kind: "media" },
];

const HOMEPAGE_FIELDS: (TextFieldDef | MediaFieldDef)[] = [
  {
    name: "metaTitle",
    label: "Meta Title Homepage",
    hint: "Kosongkan untuk memakai default.",
  },
  {
    name: "metaDescription",
    label: "Meta Description Homepage",
  },
  { name: "ogImage", label: "Gambar OG Homepage", kind: "media" },
];

const RECIPIENT_FIELDS: TextFieldDef[] = [
  { name: "distributorLeads", label: "Lead Distributor" },
  { name: "oemLeads", label: "Inquiry OEM" },
  { name: "contactLeads", label: "Pesan Kontak" },
  { name: "applications", label: "Lamaran Kerja" },
];

const GROUP_FIELDS: Record<
  SettingsGroup,
  { title: string; description: string; fields: FieldDef[] }
> = {
  company: {
    title: "Informasi Perusahaan",
    description: "Data legal yang ditampilkan di situs publik.",
    fields: COMPANY_FIELDS,
  },
  social: {
    title: "Tautan Sosial",
    description: "Instagram, TikTok, dan WhatsApp untuk tombol sosial.",
    fields: SOCIAL_FIELDS,
  },
  seo: {
    title: "SEO Default",
    description:
      "Meta title dan description default untuk halaman tanpa SEO khusus.",
    fields: SEO_FIELDS,
  },
  smtp: {
    title: "Konfigurasi SMTP",
    description:
      "Pengaturan server email untuk notifikasi transaksional (§30).",
    fields: SMTP_FIELDS,
  },
  analytics: {
    title: "Analytics & Tag Manager",
    description:
      "ID Google Analytics dan Google Tag Manager untuk situs publik.",
    fields: ANALYTICS_FIELDS,
  },
  media: {
    title: "Aset Situs (Logo / Favicon / OG)",
    description: "Unggah logo, favicon, dan gambar Open Graph situs.",
    fields: MEDIA_FIELDS,
  },
  homepage_seo: {
    title: "SEO Homepage",
    description: "Override meta dan gambar OG khusus halaman beranda.",
    fields: HOMEPAGE_FIELDS,
  },
  notification_recipients: {
    title: "Penerima Notifikasi",
    description:
      "Alamat email (dipisahkan koma) yang menerima notifikasi per jenis lead (§30).",
    fields: RECIPIENT_FIELDS,
  },
};

interface SettingsGroupFormProps {
  title: string;
  description: string;
  fields: FieldDef[];
  values: Record<string, unknown>;
  group: SettingsGroup;
}

/** Serializes email arrays as a comma-separated list for the input fields. */
function toCommaSeparated(
  values: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.join(", ") : value,
    ])
  );
}

/** Splits comma-separated email lists back into arrays for the server schema. */
function fromCommaSeparated(
  group: SettingsGroup,
  raw: Record<string, unknown>
): Record<string, unknown> {
  if (group !== "notification_recipients") {
    return raw;
  }
  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      typeof value === "string"
        ? value
            .split(",")
            .map((email) => email.trim())
            .filter(Boolean)
        : value,
    ])
  );
}

function SettingsGroupForm({
  title,
  description,
  fields,
  values,
  group,
}: SettingsGroupFormProps) {
  const [state, formAction, pending] = useActionState(
    updateSettingsAction,
    EMPTY_FORM_STATE
  );

  // Direct uploads: field name -> picked File (replace) or "" (cleared).
  // Absent means "keep the persisted value untouched".
  const mediaEdits = React.useRef(new Map<string, File | "">());

  React.useEffect(() => {
    if (state.success) mediaEdits.current.clear();
  }, [state.success]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const rawValues: Record<string, unknown> = {};
    for (const field of fields) {
      if (field.kind === "media") {
        const edit = mediaEdits.current.get(field.name);
        if (edit === undefined || edit instanceof File) continue;
        rawValues[field.name] = edit;
        continue;
      }
      const item = formData.get(field.name);
      if (field.kind === "switch") {
        rawValues[field.name] = item === "on";
      } else {
        rawValues[field.name] = item ?? "";
      }
    }

    // The recipient setting expects email arrays typed client-side from the
    // comma-separated input; the server action is still the single validator.
    const payload = fromCommaSeparated(group, rawValues);

    const out = new FormData();
    out.set("group", group);
    out.set("value", JSON.stringify(payload));
    for (const [name, edit] of mediaEdits.current) {
      if (edit instanceof File) out.append(`mediaFile:${name}`, edit);
    }
    formAction(out);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {fields.map((field) => {
        if (field.kind === "media") {
          const mediaDef = field;
          const current = String(values[mediaDef.name] ?? "");
          return (
            <MediaSettingField
              key={mediaDef.name}
              field={mediaDef}
              value={current}
              pending={pending}
              onEdit={(edit) => mediaEdits.current.set(mediaDef.name, edit)}
            />
          );
        }
        const textField = field as TextFieldDef;
        const current = values[textField.name];
        return (
          <Field
            key={textField.name}
            label={textField.label}
            htmlFor={`${group}-${textField.name}`}
            hint={textField.hint}
          >
            {textField.kind === "switch" ? (
              <div className="rounded-md border p-3">
                <Switch
                  id={`${group}-${textField.name}`}
                  name={textField.name}
                  defaultChecked={current === true}
                />
              </div>
            ) : (
              <Input
                id={`${group}-${textField.name}`}
                name={textField.name}
                type={textField.kind ?? "text"}
                defaultValue={
                  textField.kind === "number"
                    ? Number(current) || ""
                    : String(current ?? "")
                }
                placeholder={textField.placeholder}
              />
            )}
          </Field>
        );
      })}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FormStatus state={state} />
        <SubmitButton pending={pending} pendingText="Menyimpan...">
          Simpan
        </SubmitButton>
      </div>
    </form>
  );
}

function MediaSettingField({
  field,
  value,
  pending,
  onEdit,
}: {
  field: MediaFieldDef;
  value: string;
  pending: boolean;
  /** Called with the picked File, or "" when the admin clears the image. */
  onEdit: (edit: File | "") => void;
}) {
  return (
    <ImageUploadField
      name={`mediaFile:${field.name}`}
      currentUrl={value || null}
      onFileChange={(file) => onEdit(file ?? "")}
      label={field.label}
      hint={field.hint ?? "JPEG, PNG, atau WebP — maksimal 10 MB."}
      disabled={pending}
    />
  );
}

export interface SettingsFormsProps {
  values: Record<string, Record<string, unknown>>;
}

export function SettingsForms({ values }: SettingsFormsProps) {
  const order: SettingsGroup[] = [
    "company",
    "social",
    "seo",
    "smtp",
    "analytics",
    "media",
    "homepage_seo",
    "notification_recipients",
  ];
  const left = order.slice(0, 4);
  const right = order.slice(4);

  function renderPanel(group: SettingsGroup) {
    const groupDef = GROUP_FIELDS[group];
    return (
      <section key={group} className="rounded-xl border bg-card p-6 shadow-sm">
        <SettingsGroupForm
          title={groupDef.title}
          description={groupDef.description}
          fields={groupDef.fields}
          values={toCommaSeparated(values[group] ?? {})}
          group={group}
        />
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">{left.map(renderPanel)}</div>
      <div className="space-y-6">{right.map(renderPanel)}</div>
    </div>
  );
}

import type { Metadata } from "next";

import { requireAdmin } from "@/domain/auth/guards";
import { SettingRepository } from "@/domain/settings/setting.repository";
import { SettingsForms } from "./settings-form";

export const metadata: Metadata = {
  title: "Pengaturan",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  await requireAdmin();

  const settings = await new SettingRepository().getAll();
  const values = settings.reduce<Record<string, Record<string, unknown>>>(
    (acc, setting) => {
      acc[setting.key] =
        setting.value && typeof setting.value === "object"
          ? (setting.value as Record<string, unknown>)
          : {};
      return acc;
    },
    {}
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground text-sm">
          Konfigurasi situs: informasi perusahaan, tautan sosial, SEO, dan
          penerima notifikasi (§30).
        </p>
      </div>
      <SettingsForms values={values} />
    </div>
  );
}

import type { Metadata } from "next";

import { requireAdmin } from "@/domain/auth/guards";
import { BrandForm } from "../brand-form";

export const metadata: Metadata = {
  title: "Merek Baru",
  robots: { index: false, follow: false },
};

export default async function NewBrandPage() {
  await requireAdmin();

  return <BrandForm />;
}

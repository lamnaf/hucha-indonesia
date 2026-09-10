import type { Metadata } from "next";

import { requireAdmin } from "@/domain/auth/guards";
import { JobForm } from "../job-form";

export const metadata: Metadata = {
  title: "Lowongan Baru",
  robots: { index: false, follow: false },
};

export default async function NewJobPage() {
  await requireAdmin();
  return <JobForm />;
}

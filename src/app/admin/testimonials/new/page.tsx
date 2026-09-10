import type { Metadata } from "next";

import { requireAdmin } from "@/domain/auth/guards";
import { TestimonialForm } from "../testimonial-form";

export const metadata: Metadata = {
  title: "Testimoni Baru",
  robots: { index: false, follow: false },
};

export default async function NewTestimonialPage() {
  await requireAdmin();

  return <TestimonialForm />;
}

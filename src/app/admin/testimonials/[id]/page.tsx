import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/domain/auth/guards";
import { TestimonialRepository } from "@/domain/testimonials/testimonial.repository";
import { TestimonialForm } from "../testimonial-form";

export const metadata: Metadata = {
  title: "Edit Testimoni",
  robots: { index: false, follow: false },
};

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const testimonialId = Number(id);
  if (!Number.isInteger(testimonialId)) notFound();

  const testimonial = await new TestimonialRepository().findById(testimonialId);
  if (!testimonial) notFound();

  return (
    <TestimonialForm
      initialLogoUrl={testimonial.partnerLogo?.filePath ?? null}
      initial={{
        id: testimonial.id,
        partnerName: testimonial.partnerName,
        partnerBusiness: testimonial.partnerBusiness,
        partnerRegion: testimonial.partnerRegion,
        quote: testimonial.quote,
        partnerLogoMediaId: testimonial.partnerLogoMediaId,
        rating: testimonial.rating,
        isPublished: testimonial.isPublished,
      }}
    />
  );
}

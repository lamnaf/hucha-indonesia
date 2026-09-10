import { TestimonialRepository } from "@/domain/testimonials/testimonial.repository";
import type { MockTestimonial } from "@/lib/mock/testimonials";

export async function getPublicTestimonials(): Promise<MockTestimonial[]> {
  const items = await new TestimonialRepository().listPublished();
  return items.map((testimonial) => ({
    partnerName: testimonial.partnerName,
    partnerBusiness: testimonial.partnerBusiness ?? "",
    partnerRegion: testimonial.partnerRegion ?? "",
    quote: testimonial.quote,
    rating: testimonial.rating ?? 5,
  }));
}

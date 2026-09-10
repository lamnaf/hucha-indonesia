-- Media lifecycle is now explicit: media rows are deleted through
-- releaseUnusedMedia only after callers detach them. All referencing FKs must
-- therefore be ON DELETE RESTRICT so the database itself refuses to delete a
-- media row that any entity (article cover, SEO OG image, brand/testimonial
-- logo, application CV) still references — previously ON DELETE SET NULL
-- silently nulled the reference while the file was removed.
-- Constraint-only change; no data is read or rewritten.

ALTER TABLE "articles" DROP CONSTRAINT "articles_featured_media_id_fkey";
ALTER TABLE "articles" ADD CONSTRAINT "articles_featured_media_id_fkey" FOREIGN KEY ("featured_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "seo_meta" DROP CONSTRAINT "seo_meta_og_image_media_id_fkey";
ALTER TABLE "seo_meta" ADD CONSTRAINT "seo_meta_og_image_media_id_fkey" FOREIGN KEY ("og_image_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "applications" DROP CONSTRAINT "applications_cv_media_id_fkey";
ALTER TABLE "applications" ADD CONSTRAINT "applications_cv_media_id_fkey" FOREIGN KEY ("cv_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "testimonials" DROP CONSTRAINT "testimonials_partner_logo_media_id_fkey";
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_partner_logo_media_id_fkey" FOREIGN KEY ("partner_logo_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "brands" DROP CONSTRAINT "brands_logo_media_id_fkey";
ALTER TABLE "brands" ADD CONSTRAINT "brands_logo_media_id_fkey" FOREIGN KEY ("logo_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

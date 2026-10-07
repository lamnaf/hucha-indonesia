-- Add shopee_url and tokopedia_url columns to products table
ALTER TABLE "products" ADD COLUMN "shopee_url" TEXT;
ALTER TABLE "products" ADD COLUMN "tokopedia_url" TEXT;

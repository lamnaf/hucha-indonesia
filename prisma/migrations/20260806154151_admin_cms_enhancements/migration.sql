-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "folder" TEXT;

-- AlterTable
ALTER TABLE "seo_meta" ADD COLUMN     "keywords" TEXT,
ADD COLUMN     "og_description" TEXT,
ADD COLUMN     "og_title" TEXT,
ADD COLUMN     "robots" TEXT,
ADD COLUMN     "twitter_card" TEXT;

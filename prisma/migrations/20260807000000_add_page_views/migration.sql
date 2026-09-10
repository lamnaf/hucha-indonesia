-- CreateTable
CREATE TABLE "page_views" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "visitor_id" TEXT,
    "ip_address" TEXT,
    "is_bot" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_views_created_at_idx" ON "page_views"("created_at");

-- CreateIndex
CREATE INDEX "page_views_path_idx" ON "page_views"("path");

-- CreateIndex
CREATE INDEX "page_views_visitor_id_idx" ON "page_views"("visitor_id");
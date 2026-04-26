-- CreateTable
CREATE TABLE "hero_slides" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "cta_label" TEXT NOT NULL,
    "cta_href" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

/*
  Warnings:

  - You are about to drop the column `store_lat` on the `store_settings` table. All the data in the column will be lost.
  - You are about to drop the column `store_lng` on the `store_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "store_id" INTEGER;

-- AlterTable
ALTER TABLE "store_settings" DROP COLUMN "store_lat",
DROP COLUMN "store_lng";

-- CreateTable
CREATE TABLE "stores" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "cost_per_km" DECIMAL(10,2),
    "service_charge_pct" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

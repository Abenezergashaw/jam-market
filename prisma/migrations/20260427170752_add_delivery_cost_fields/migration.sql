/*
  Warnings:

  - You are about to drop the column `delivery_fee` on the `store_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "delivery_fee" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "store_settings" DROP COLUMN "delivery_fee",
ADD COLUMN     "cost_per_km" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "service_charge_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "store_lat" DECIMAL(10,7),
ADD COLUMN     "store_lng" DECIMAL(10,7);

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COLLECTED', 'FAILED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "payment_method" TEXT NOT NULL DEFAULT 'COD',
ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "store_settings" (
    "id" SERIAL NOT NULL,
    "min_order_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "delivery_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "estimated_delivery_minutes" INTEGER NOT NULL DEFAULT 45,
    "store_is_open" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_zones" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "center_lat" DECIMAL(10,8) NOT NULL,
    "center_lng" DECIMAL(11,8) NOT NULL,
    "radius_km" DECIMAL(6,2) NOT NULL DEFAULT 10,
    "min_order_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "delivery_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "delivery_zones_pkey" PRIMARY KEY ("id")
);

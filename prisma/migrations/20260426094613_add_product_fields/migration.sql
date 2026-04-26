-- AlterTable
ALTER TABLE "products" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "cost_price" DECIMAL(10,2),
ADD COLUMN     "country_of_origin" TEXT,
ADD COLUMN     "expiry_date" TIMESTAMP(3),
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "low_stock_threshold" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "storage_instructions" TEXT,
ADD COLUMN     "unit" TEXT,
ADD COLUMN     "weight" TEXT;

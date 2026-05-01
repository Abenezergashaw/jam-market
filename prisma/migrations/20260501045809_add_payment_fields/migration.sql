-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "payment_reference_code" TEXT,
ADD COLUMN     "receipt_image_url" TEXT;

-- AlterTable
ALTER TABLE "store_settings" ADD COLUMN     "telebirr_account_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "telebirr_account_number" TEXT NOT NULL DEFAULT '';

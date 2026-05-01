-- AlterTable
ALTER TABLE "store_settings" ADD COLUMN     "boa_account_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "boa_account_number" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "cbe_account_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "cbe_account_number" TEXT NOT NULL DEFAULT '';

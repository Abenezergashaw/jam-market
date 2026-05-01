-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "payment_verified_at" TIMESTAMP(3),
ADD COLUMN     "payment_verified_by_id" INTEGER;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_verified_by_id_fkey" FOREIGN KEY ("payment_verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "GuestStay" ADD COLUMN "expectsForeignGuest" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "GuestStay" ADD COLUMN "guestLabel" TEXT;

-- CreateIndex
CREATE INDEX "GuestStay_propertyId_checkInDate_idx" ON "GuestStay"("propertyId", "checkInDate");

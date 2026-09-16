-- AlterTable
ALTER TABLE "Registration" ADD COLUMN "cinNumber" TEXT;
ALTER TABLE "Registration" ADD COLUMN "cinBdsrStatus" TEXT NOT NULL DEFAULT 'not_started';
ALTER TABLE "Registration" ADD COLUMN "cinDisplayedOnListings" BOOLEAN NOT NULL DEFAULT false;

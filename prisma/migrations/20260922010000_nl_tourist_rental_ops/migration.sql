-- Netherlands tourist rental compliance ops (registration, permit, night-cap source, wijk)
ALTER TABLE "Registration" ADD COLUMN "nlRegistrationNumber" TEXT;
ALTER TABLE "Registration" ADD COLUMN "nlRegistrationStatus" TEXT NOT NULL DEFAULT 'not_started';
ALTER TABLE "Registration" ADD COLUMN "nlRegistrationDisplayedOnListings" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Registration" ADD COLUMN "nlHolidayPermitStatus" TEXT NOT NULL DEFAULT 'not_started';
ALTER TABLE "Registration" ADD COLUMN "nlHolidayPermitExpiry" DATETIME;
ALTER TABLE "Registration" ADD COLUMN "nlPermitNumber" TEXT;
ALTER TABLE "Registration" ADD COLUMN "nlNeighborhood" TEXT;
ALTER TABLE "Registration" ADD COLUMN "nlNightCapSource" TEXT NOT NULL DEFAULT 'none';

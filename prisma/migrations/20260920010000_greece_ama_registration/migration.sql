-- Greece AMA registration fields on Registration
ALTER TABLE "Registration" ADD COLUMN "amaNumber" TEXT;
ALTER TABLE "Registration" ADD COLUMN "amaStatus" TEXT NOT NULL DEFAULT 'not_started';
ALTER TABLE "Registration" ADD COLUMN "amaDisplayedOnListings" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Registration" ADD COLUMN "greeceRegistrationKind" TEXT NOT NULL DEFAULT 'ama';
ALTER TABLE "Registration" ADD COLUMN "greeceAlternateLicenseNumber" TEXT;
ALTER TABLE "Registration" ADD COLUMN "atak" TEXT;

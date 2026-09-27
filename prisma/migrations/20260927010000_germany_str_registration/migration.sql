-- Germany / Berlin ZwVbG STR registration fields
ALTER TABLE "Registration" ADD COLUMN "deRegistrationNumber" TEXT;
ALTER TABLE "Registration" ADD COLUMN "deRegistrationStatus" TEXT NOT NULL DEFAULT 'not_started';
ALTER TABLE "Registration" ADD COLUMN "deRegistrationDisplayedOnListings" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Registration" ADD COLUMN "deFederalState" TEXT;
ALTER TABLE "Registration" ADD COLUMN "deCityOrDistrict" TEXT;
ALTER TABLE "Registration" ADD COLUMN "deOperatorCategory" TEXT;
ALTER TABLE "Registration" ADD COLUMN "dePermitType" TEXT;
ALTER TABLE "Registration" ADD COLUMN "deDossierPreparedAt" DATETIME;
ALTER TABLE "Registration" ADD COLUMN "deTransitionDeadline" DATETIME;

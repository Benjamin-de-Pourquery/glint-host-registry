-- Austria / Vienna WKVRG STR registration fields
ALTER TABLE "Registration" ADD COLUMN "atRegistrationNumber" TEXT;
ALTER TABLE "Registration" ADD COLUMN "atRegistrationStatus" TEXT NOT NULL DEFAULT 'not_started';
ALTER TABLE "Registration" ADD COLUMN "atRegistrationDisplayedOnListings" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Registration" ADD COLUMN "atFederalState" TEXT;
ALTER TABLE "Registration" ADD COLUMN "atOperatorCategory" TEXT;
ALTER TABLE "Registration" ADD COLUMN "atDossierPreparedAt" DATETIME;
ALTER TABLE "Registration" ADD COLUMN "atTransitionDeadline" DATETIME;

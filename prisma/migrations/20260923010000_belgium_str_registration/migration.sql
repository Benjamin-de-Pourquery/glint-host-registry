-- Belgium tri-regional STR registration fields
ALTER TABLE "Registration" ADD COLUMN "beRegistrationNumber" TEXT;
ALTER TABLE "Registration" ADD COLUMN "beRegistrationStatus" TEXT NOT NULL DEFAULT 'not_started';
ALTER TABLE "Registration" ADD COLUMN "beRegistrationDisplayedOnListings" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Registration" ADD COLUMN "beRegion" TEXT;
ALTER TABLE "Registration" ADD COLUMN "beOperatorCategory" TEXT;
ALTER TABLE "Registration" ADD COLUMN "beFireSafetyStatus" TEXT NOT NULL DEFAULT 'not_started';
ALTER TABLE "Registration" ADD COLUMN "beInsuranceStatus" TEXT NOT NULL DEFAULT 'not_started';
ALTER TABLE "Registration" ADD COLUMN "beUrbanPlanningStatus" TEXT NOT NULL DEFAULT 'not_started';
ALTER TABLE "Registration" ADD COLUMN "beDossierSubmittedAt" DATETIME;

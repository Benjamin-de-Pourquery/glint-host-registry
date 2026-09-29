-- Spain / Catalonia regional STR registration (HUT)
ALTER TABLE "Registration" ADD COLUMN "esRegistrationNumber" TEXT;
ALTER TABLE "Registration" ADD COLUMN "esRegistrationStatus" TEXT NOT NULL DEFAULT 'not_started';
ALTER TABLE "Registration" ADD COLUMN "esRegistrationDisplayedOnListings" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Registration" ADD COLUMN "esAutonomousCommunity" TEXT;
ALTER TABLE "Registration" ADD COLUMN "esLicenseKind" TEXT;
ALTER TABLE "Registration" ADD COLUMN "esDossierPreparedAt" DATETIME;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN "nationalRegistrationNumber" TEXT;
ALTER TABLE "Registration" ADD COLUMN "nationalTransitionStatus" TEXT NOT NULL DEFAULT 'not_applicable';
ALTER TABLE "Registration" ADD COLUMN "nationalRenewalDeadline" DATETIME;

-- Backfill: French properties default to awaiting_portal; others stay not_applicable
UPDATE "Registration"
SET "nationalTransitionStatus" = 'awaiting_portal'
WHERE "propertyId" IN (
  SELECT "id" FROM "Property"
  WHERE LOWER(TRIM("country")) IN ('france', 'fr', 'frança', 'francaise')
);

-- Ireland Fáilte Ireland national STL register fields
ALTER TABLE "Registration" ADD COLUMN "ieStlNumber" TEXT;
ALTER TABLE "Registration" ADD COLUMN "ieStlStatus" TEXT NOT NULL DEFAULT 'not_started';
ALTER TABLE "Registration" ADD COLUMN "ieRegisteredAt" DATETIME;
ALTER TABLE "Registration" ADD COLUMN "ieRenewalDueAt" DATETIME;
ALTER TABLE "Registration" ADD COLUMN "iePlanningStatus" TEXT;
ALTER TABLE "Registration" ADD COLUMN "ieEircode" TEXT;
ALTER TABLE "Registration" ADD COLUMN "ieMaxGuests" INTEGER;
ALTER TABLE "Registration" ADD COLUMN "ieBedPlaces" INTEGER;
ALTER TABLE "Registration" ADD COLUMN "ieResidenceType" TEXT;

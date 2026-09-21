-- Croatia eVisitor categorisation / object registration fields
ALTER TABLE "Registration" ADD COLUMN "hrCategorisationNumber" TEXT;
ALTER TABLE "Registration" ADD COLUMN "hrObjectId" TEXT;
ALTER TABLE "Registration" ADD COLUMN "hrCategorisationStatus" TEXT NOT NULL DEFAULT 'not_started';
ALTER TABLE "Registration" ADD COLUMN "hrCategorisationDisplayedOnListings" BOOLEAN NOT NULL DEFAULT false;

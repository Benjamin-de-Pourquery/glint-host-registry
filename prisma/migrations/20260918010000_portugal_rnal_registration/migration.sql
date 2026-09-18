-- Portugal RNAL registration fields on Registration
ALTER TABLE "Registration" ADD COLUMN "rnalNumber" TEXT;
ALTER TABLE "Registration" ADD COLUMN "rnalStatus" TEXT NOT NULL DEFAULT 'not_started';
ALTER TABLE "Registration" ADD COLUMN "rnalDisplayedOnListings" BOOLEAN NOT NULL DEFAULT false;

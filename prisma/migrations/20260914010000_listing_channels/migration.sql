-- CreateTable
CREATE TABLE "ListingChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "listingUrl" TEXT NOT NULL,
    "registrationNumberDisplayed" TEXT,
    "displayStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "lastCheckedAt" DATETIME,
    "notes" TEXT,
    "blockedAt" DATETIME,
    "blockReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ListingChannel_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ListingChannel_propertyId_channel_key" ON "ListingChannel"("propertyId", "channel");

-- CreateIndex
CREATE INDEX "ListingChannel_propertyId_idx" ON "ListingChannel"("propertyId");

-- CreateIndex
CREATE INDEX "ListingChannel_displayStatus_idx" ON "ListingChannel"("displayStatus");

-- Backfill from legacy Property URL columns (one channel per platform)
INSERT INTO "ListingChannel" ("id", "propertyId", "channel", "listingUrl", "displayStatus", "createdAt", "updatedAt")
SELECT "id" || '-lc-airbnb', "id", 'AIRBNB', trim("airbnbUrl"), 'UNKNOWN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Property"
WHERE "airbnbUrl" IS NOT NULL AND trim("airbnbUrl") != '';

INSERT INTO "ListingChannel" ("id", "propertyId", "channel", "listingUrl", "displayStatus", "createdAt", "updatedAt")
SELECT "id" || '-lc-booking', "id", 'BOOKING', trim("bookingUrl"), 'UNKNOWN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Property"
WHERE "bookingUrl" IS NOT NULL AND trim("bookingUrl") != '';

INSERT INTO "ListingChannel" ("id", "propertyId", "channel", "listingUrl", "displayStatus", "createdAt", "updatedAt")
SELECT "id" || '-lc-vrbo', "id", 'VRBO', trim("vrboUrl"), 'UNKNOWN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Property"
WHERE "vrboUrl" IS NOT NULL AND trim("vrboUrl") != '';

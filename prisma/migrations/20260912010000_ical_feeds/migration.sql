-- CreateTable
CREATE TABLE "CalendarFeed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sourceLabel" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" DATETIME,
    "lastError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CalendarFeed_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- AlterTable
ALTER TABLE "GuestStay" ADD COLUMN "calendarFeedId" TEXT;
ALTER TABLE "GuestStay" ADD COLUMN "externalUid" TEXT;
ALTER TABLE "GuestStay" ADD COLUMN "importStatus" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CalendarFeed_propertyId_url_key" ON "CalendarFeed"("propertyId", "url");
CREATE INDEX "CalendarFeed_propertyId_idx" ON "CalendarFeed"("propertyId");
CREATE INDEX "CalendarFeed_enabled_idx" ON "CalendarFeed"("enabled");
CREATE UNIQUE INDEX "GuestStay_propertyId_externalUid_key" ON "GuestStay"("propertyId", "externalUid");
CREATE INDEX "GuestStay_calendarFeedId_idx" ON "GuestStay"("calendarFeedId");

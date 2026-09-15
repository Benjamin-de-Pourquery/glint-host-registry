-- CreateTable: RegionalGuestReport (Mossos / Ertzaintza manual submission tracking)
CREATE TABLE "RegionalGuestReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "stayId" TEXT,
    "system" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'prepared',
    "notes" TEXT,
    "preparedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" DATETIME,
    "acceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RegionalGuestReport_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RegionalGuestReport_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "GuestStay" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "RegionalGuestReport_propertyId_createdAt_idx" ON "RegionalGuestReport"("propertyId", "createdAt");
CREATE INDEX "RegionalGuestReport_propertyId_status_idx" ON "RegionalGuestReport"("propertyId", "status");
CREATE INDEX "RegionalGuestReport_stayId_idx" ON "RegionalGuestReport"("stayId");

-- CreateTable
CREATE TABLE "PlatformImport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "filename" TEXT,
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    CONSTRAINT "PlatformImport_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlatformImport_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlatformReservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "importId" TEXT,
    "channel" TEXT NOT NULL,
    "externalRef" TEXT,
    "listingRef" TEXT,
    "checkIn" DATETIME NOT NULL,
    "checkOut" DATETIME NOT NULL,
    "nights" INTEGER NOT NULL,
    "guests" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "grossAmountCents" INTEGER,
    "matchedStayId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlatformReservation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlatformReservation_importId_fkey" FOREIGN KEY ("importId") REFERENCES "PlatformImport" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PlatformReservation_matchedStayId_fkey" FOREIGN KEY ("matchedStayId") REFERENCES "GuestStay" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReconciliationFinding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "code" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "expectedJson" TEXT NOT NULL DEFAULT '{}',
    "observedJson" TEXT NOT NULL DEFAULT '{}',
    "sourceRefsJson" TEXT NOT NULL DEFAULT '[]',
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReconciliationFinding_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Dac7ListingOverview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "channel" TEXT NOT NULL,
    "listingRef" TEXT NOT NULL DEFAULT '',
    "daysRented" INTEGER NOT NULL,
    "q1ConsiderationCents" INTEGER,
    "q2ConsiderationCents" INTEGER,
    "q3ConsiderationCents" INTEGER,
    "q4ConsiderationCents" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Dac7ListingOverview_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlatformColumnMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'GENERIC',
    "mappingJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlatformColumnMapping_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlatformColumnMapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PlatformImport_propertyId_idx" ON "PlatformImport"("propertyId");
CREATE INDEX "PlatformImport_propertyId_createdAt_idx" ON "PlatformImport"("propertyId", "createdAt");

-- CreateIndex
CREATE INDEX "PlatformReservation_propertyId_idx" ON "PlatformReservation"("propertyId");
CREATE INDEX "PlatformReservation_propertyId_checkIn_idx" ON "PlatformReservation"("propertyId", "checkIn");
CREATE INDEX "PlatformReservation_importId_idx" ON "PlatformReservation"("importId");
CREATE INDEX "PlatformReservation_matchedStayId_idx" ON "PlatformReservation"("matchedStayId");
CREATE UNIQUE INDEX "PlatformReservation_propertyId_channel_externalRef_key" ON "PlatformReservation"("propertyId", "channel", "externalRef");

-- CreateIndex
CREATE INDEX "ReconciliationFinding_propertyId_periodStart_idx" ON "ReconciliationFinding"("propertyId", "periodStart");
CREATE INDEX "ReconciliationFinding_propertyId_resolvedAt_idx" ON "ReconciliationFinding"("propertyId", "resolvedAt");
CREATE INDEX "ReconciliationFinding_propertyId_code_idx" ON "ReconciliationFinding"("propertyId", "code");

-- CreateIndex
CREATE INDEX "Dac7ListingOverview_propertyId_year_idx" ON "Dac7ListingOverview"("propertyId", "year");
CREATE UNIQUE INDEX "Dac7ListingOverview_propertyId_year_channel_listingRef_key" ON "Dac7ListingOverview"("propertyId", "year", "channel", "listingRef");

-- CreateIndex
CREATE INDEX "PlatformColumnMapping_propertyId_idx" ON "PlatformColumnMapping"("propertyId");
CREATE UNIQUE INDEX "PlatformColumnMapping_propertyId_userId_channel_key" ON "PlatformColumnMapping"("propertyId", "userId", "channel");

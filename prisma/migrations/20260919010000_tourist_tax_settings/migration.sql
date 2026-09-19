-- CreateTable
CREATE TABLE "TouristTaxSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "collectionMode" TEXT NOT NULL DEFAULT 'unknown',
    "declarationCadence" TEXT NOT NULL DEFAULT 'monthly',
    "portalUrl" TEXT,
    "classification" TEXT NOT NULL DEFAULT 'unclassified',
    "attestationOnFile" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TouristTaxSettings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TouristTaxPeriod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "nightsInPeriod" INTEGER,
    "declaredAt" DATETIME,
    "declarationChannel" TEXT,
    "amountCents" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TouristTaxPeriod_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TouristTaxSettings_propertyId_key" ON "TouristTaxSettings"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "TouristTaxPeriod_propertyId_periodStart_key" ON "TouristTaxPeriod"("propertyId", "periodStart");

-- CreateIndex
CREATE INDEX "TouristTaxPeriod_propertyId_idx" ON "TouristTaxPeriod"("propertyId");

-- CreateIndex
CREATE INDEX "TouristTaxPeriod_propertyId_status_idx" ON "TouristTaxPeriod"("propertyId", "status");

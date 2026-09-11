-- CreateTable
CREATE TABLE "GuestRegisterToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    CONSTRAINT "GuestRegisterToken_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuestStay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "checkInDate" DATETIME NOT NULL,
    "checkOutDate" DATETIME NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GuestStay_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuestRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "stayId" TEXT,
    "lastName" TEXT NOT NULL,
    "firstNames" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "placeOfBirth" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "usualAddress" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "arrivalDate" DATETIME NOT NULL,
    "departureDate" DATETIME NOT NULL,
    "isFrenchNational" BOOLEAN NOT NULL DEFAULT false,
    "requiresPoliceForm" BOOLEAN NOT NULL DEFAULT true,
    "signatureDataUrl" TEXT,
    "signedAt" DATETIME,
    "submittedAt" DATETIME,
    "retentionExpiresAt" DATETIME,
    "accompanyingChildrenJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GuestRecord_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GuestRecord_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "GuestStay" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestRegisterToken_propertyId_key" ON "GuestRegisterToken"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "GuestRegisterToken_token_key" ON "GuestRegisterToken"("token");

-- CreateIndex
CREATE INDEX "GuestStay_propertyId_idx" ON "GuestStay"("propertyId");

-- CreateIndex
CREATE INDEX "GuestRecord_propertyId_retentionExpiresAt_idx" ON "GuestRecord"("propertyId", "retentionExpiresAt");

-- CreateTable
CREATE TABLE "CapGuardPolicy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "mode" TEXT NOT NULL DEFAULT 'BUFFER',
    "bufferNights" INTEGER NOT NULL DEFAULT 7,
    "budgetWindows" TEXT NOT NULL DEFAULT '[]',
    "registrationGate" BOOLEAN NOT NULL DEFAULT false,
    "feedToken" TEXT NOT NULL,
    "feedTokenRotatedAt" DATETIME,
    "propagationConfirmedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CapGuardPolicy_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CapGuardEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CapGuardEvent_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CapGuardPolicy_propertyId_key" ON "CapGuardPolicy"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "CapGuardPolicy_feedToken_key" ON "CapGuardPolicy"("feedToken");

-- CreateIndex
CREATE INDEX "CapGuardEvent_propertyId_idx" ON "CapGuardEvent"("propertyId");

-- CreateIndex
CREATE INDEX "CapGuardEvent_propertyId_createdAt_idx" ON "CapGuardEvent"("propertyId", "createdAt");

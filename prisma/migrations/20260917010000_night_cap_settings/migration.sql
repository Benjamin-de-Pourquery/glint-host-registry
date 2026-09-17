-- CreateTable
CREATE TABLE "NightCapSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "nightCapEnabled" BOOLEAN NOT NULL DEFAULT true,
    "nightCapLimit" INTEGER NOT NULL DEFAULT 120,
    "nightCapYear" INTEGER NOT NULL,
    "nightCapSource" TEXT NOT NULL DEFAULT 'statutory_120',
    "notes" TEXT,
    "nightsUsedYtd" INTEGER,
    "lastComputedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NightCapSettings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "NightCapSettings_propertyId_key" ON "NightCapSettings"("propertyId");

-- CreateTable
CREATE TABLE "AlloggiatiCredential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "utente" TEXT NOT NULL,
    "passwordEncrypted" TEXT NOT NULL,
    "wsKeyEncrypted" TEXT NOT NULL,
    "liveSubmitEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastTestedAt" DATETIME,
    "lastTestStatus" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AlloggiatiCredential_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AlloggiatiCredential_propertyId_key" ON "AlloggiatiCredential"("propertyId");

-- CreateTable
CREATE TABLE "ListingHealthSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "score" TEXT NOT NULL,
    "factorsJson" TEXT NOT NULL DEFAULT '[]',
    "computedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ListingHealthSnapshot_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ListingHealthSnapshot_propertyId_idx" ON "ListingHealthSnapshot"("propertyId");

-- CreateIndex
CREATE INDEX "ListingHealthSnapshot_propertyId_computedAt_idx" ON "ListingHealthSnapshot"("propertyId", "computedAt");

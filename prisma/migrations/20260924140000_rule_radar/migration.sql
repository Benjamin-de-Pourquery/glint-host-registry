-- CreateTable
CREATE TABLE "JurisdictionRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "zone" TEXT,
    "residency" TEXT,
    "valueJson" TEXT NOT NULL,
    "effectiveFrom" DATETIME NOT NULL,
    "effectiveTo" DATETIME,
    "sourceUrl" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RuleChange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ruleKeysJson" TEXT NOT NULL,
    "summaryEn" TEXT NOT NULL,
    "summaryFr" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RuleImpact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ruleChangeId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "beforeJson" TEXT NOT NULL,
    "afterJson" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "seenAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RuleImpact_ruleChangeId_fkey" FOREIGN KEY ("ruleChangeId") REFERENCES "RuleChange" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RuleImpact_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "JurisdictionRule_key_country_city_idx" ON "JurisdictionRule"("key", "country", "city");

-- CreateIndex
CREATE INDEX "JurisdictionRule_effectiveFrom_idx" ON "JurisdictionRule"("effectiveFrom");

-- CreateIndex
CREATE INDEX "RuleImpact_propertyId_seenAt_idx" ON "RuleImpact"("propertyId", "seenAt");

-- CreateIndex
CREATE INDEX "RuleImpact_ruleChangeId_idx" ON "RuleImpact"("ruleChangeId");

-- CreateIndex
CREATE INDEX "RuleImpact_propertyId_idx" ON "RuleImpact"("propertyId");

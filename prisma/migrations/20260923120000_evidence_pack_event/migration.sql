-- CreateTable
CREATE TABLE "EvidencePackEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationId" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "locale" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "EvidencePackEvent_registrationId_idx" ON "EvidencePackEvent"("registrationId");

-- CreateIndex
CREATE INDEX "EvidencePackEvent_generatedAt_idx" ON "EvidencePackEvent"("generatedAt");

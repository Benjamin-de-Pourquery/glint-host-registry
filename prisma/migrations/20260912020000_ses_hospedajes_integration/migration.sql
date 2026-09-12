-- AlterTable: GuestRecord SES Annex I fields
ALTER TABLE "GuestRecord" ADD COLUMN "documentType" TEXT;
ALTER TABLE "GuestRecord" ADD COLUMN "documentNumber" TEXT;
ALTER TABLE "GuestRecord" ADD COLUMN "documentSupport" TEXT;
ALTER TABLE "GuestRecord" ADD COLUMN "sex" TEXT;
ALTER TABLE "GuestRecord" ADD COLUMN "kinship" TEXT;
ALTER TABLE "GuestRecord" ADD COLUMN "postalCode" TEXT;
ALTER TABLE "GuestRecord" ADD COLUMN "municipalityCode" TEXT;
ALTER TABLE "GuestRecord" ADD COLUMN "municipalityName" TEXT;
ALTER TABLE "GuestRecord" ADD COLUMN "addressCountryAlpha3" TEXT;

-- CreateTable: SesCredential
CREATE TABLE "SesCredential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "codigoArrendador" TEXT NOT NULL,
    "wsUsernameEncrypted" TEXT NOT NULL,
    "wsPasswordEncrypted" TEXT NOT NULL,
    "codigoEstablecimiento" TEXT NOT NULL,
    "liveSubmitEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastTestedAt" DATETIME,
    "lastTestStatus" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SesCredential_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: SesSubmission
CREATE TABLE "SesSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "stayId" TEXT,
    "guestRecordId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "mode" TEXT NOT NULL DEFAULT 'dry_run',
    "correlationId" TEXT,
    "loteCode" TEXT,
    "governmentCode" TEXT,
    "governmentMessage" TEXT,
    "validationErrorsJson" TEXT,
    "requestSummaryJson" TEXT,
    "submittedAt" DATETIME,
    "respondedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SesSubmission_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SesSubmission_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "GuestStay" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SesSubmission_guestRecordId_fkey" FOREIGN KEY ("guestRecordId") REFERENCES "GuestRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SesCredential_propertyId_key" ON "SesCredential"("propertyId");
CREATE INDEX "SesSubmission_propertyId_createdAt_idx" ON "SesSubmission"("propertyId", "createdAt");
CREATE INDEX "SesSubmission_propertyId_status_idx" ON "SesSubmission"("propertyId", "status");
CREATE INDEX "SesSubmission_stayId_idx" ON "SesSubmission"("stayId");
CREATE INDEX "SesSubmission_guestRecordId_idx" ON "SesSubmission"("guestRecordId");

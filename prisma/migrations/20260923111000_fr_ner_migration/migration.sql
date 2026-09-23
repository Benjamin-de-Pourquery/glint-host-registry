-- CreateTable
CREATE TABLE "FrNerMigration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NO_LOCAL',
    "localRegistrationNumber" TEXT,
    "localIssuingCommune" TEXT,
    "nerNumber" TEXT,
    "nerIssuedAt" DATETIME,
    "transitionEndsAt" DATETIME,
    "documentsChecklist" TEXT NOT NULL DEFAULT '[]',
    "channelUpdatesChecklist" TEXT NOT NULL DEFAULT '[]',
    "notifyOnPortalOpen" BOOLEAN NOT NULL DEFAULT false,
    "wizardStep" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FrNerMigration_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FrNerMigration_registrationId_key" ON "FrNerMigration"("registrationId");

-- Backfill: seed migration rows for existing French registrations
INSERT INTO "FrNerMigration" (
    "id",
    "registrationId",
    "status",
    "localRegistrationNumber",
    "localIssuingCommune",
    "nerNumber",
    "nerIssuedAt",
    "documentsChecklist",
    "channelUpdatesChecklist",
    "notifyOnPortalOpen",
    "updatedAt"
)
SELECT
    'fnm_' || r."id",
    r."id",
    CASE
        WHEN r."nationalRegistrationNumber" IS NOT NULL AND trim(r."nationalRegistrationNumber") != '' THEN 'NER_ACTIVE'
        WHEN r."registrationNumber" IS NOT NULL AND trim(r."registrationNumber") != '' THEN 'HAS_LOCAL'
        ELSE 'NO_LOCAL'
    END,
    r."registrationNumber",
    r."issuingAuthority",
    r."nationalRegistrationNumber",
    NULL,
    '[]',
    '[]',
    false,
    CURRENT_TIMESTAMP
FROM "Registration" r
INNER JOIN "Property" p ON p."id" = r."propertyId"
WHERE lower(trim(p."country")) IN ('france', 'fr', 'frança', 'francaise');

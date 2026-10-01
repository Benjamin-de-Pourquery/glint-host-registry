-- Germany Monteur / business-stay kit (Bundle A)
ALTER TABLE "GuestStay" ADD COLUMN "stayType" TEXT NOT NULL DEFAULT 'tourist';
ALTER TABLE "GuestStay" ADD COLUMN "companyName" TEXT;
ALTER TABLE "GuestStay" ADD COLUMN "payer" TEXT;
ALTER TABLE "GuestStay" ADD COLUMN "projectRef" TEXT;
ALTER TABLE "GuestStay" ADD COLUMN "invoicePackJson" TEXT;

ALTER TABLE "Registration" ADD COLUMN "deRegistrationHolderName" TEXT;
ALTER TABLE "Registration" ADD COLUMN "deRegistrationHolderType" TEXT;
ALTER TABLE "Registration" ADD COLUMN "deHostChangeFlagged" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Registration" ADD COLUMN "deMonteurKitChecklistJson" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Registration" ADD COLUMN "deCompanyAgreementChecklistJson" TEXT NOT NULL DEFAULT '[]';

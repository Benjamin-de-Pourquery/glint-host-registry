-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordChangedAt" DATETIME;

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestIp" TEXT,
    CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PasswordResetAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "emailNormalized" TEXT NOT NULL,
    "requestIp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_createdAt_idx" ON "PasswordResetToken"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PasswordResetToken_requestIp_createdAt_idx" ON "PasswordResetToken"("requestIp", "createdAt");

-- CreateIndex
CREATE INDEX "PasswordResetAttempt_emailNormalized_createdAt_idx" ON "PasswordResetAttempt"("emailNormalized", "createdAt");

-- CreateIndex
CREATE INDEX "PasswordResetAttempt_requestIp_createdAt_idx" ON "PasswordResetAttempt"("requestIp", "createdAt");

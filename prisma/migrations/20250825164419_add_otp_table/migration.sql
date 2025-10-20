-- CreateTable
CREATE TABLE "otps" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PASSWORD_RESET',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "otps_phone_type_idx" ON "otps"("phone", "type");

-- CreateIndex
CREATE INDEX "otps_expiresAt_idx" ON "otps"("expiresAt");

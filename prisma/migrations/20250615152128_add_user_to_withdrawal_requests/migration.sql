/*
  Warnings:

  - Added the required column `userId` to the `withdrawal_requests` table without a default value. This is not possible if the table is not empty.

*/
-- First, add the column as nullable
ALTER TABLE "withdrawal_requests" ADD COLUMN "userId" TEXT;

-- Update existing records with the user ID from the wallet's DCC profile
UPDATE "withdrawal_requests" wr
SET "userId" = dcc_profiles."userId"
FROM "dcc_wallets"
JOIN "dcc_profiles" ON "dcc_wallets"."dccProfileId" = "dcc_profiles"."id"
WHERE wr."walletId" = "dcc_wallets"."id";

-- Now make the column required
ALTER TABLE "withdrawal_requests" ALTER COLUMN "userId" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

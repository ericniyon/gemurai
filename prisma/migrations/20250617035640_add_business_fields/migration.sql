-- AlterTable
ALTER TABLE "users" ADD COLUMN     "businessAddress" TEXT,
ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "businessRegistrationNumber" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

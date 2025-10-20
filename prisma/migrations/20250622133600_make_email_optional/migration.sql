-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'AGENT';

-- AlterTable
ALTER TABLE "applications" ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;

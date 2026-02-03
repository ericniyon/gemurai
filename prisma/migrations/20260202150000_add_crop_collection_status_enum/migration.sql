-- Create CropCollectionStatus enum (matches Prisma schema); skip if already exists (e.g. after failed migration)
DO $$ BEGIN
  CREATE TYPE "CropCollectionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'PROCESSED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Drop default so column type can be changed
ALTER TABLE "crop_collections" ALTER COLUMN "status" DROP DEFAULT;

-- Alter crop_collections.status from TEXT to enum, casting existing values
ALTER TABLE "crop_collections"
  ALTER COLUMN "status" TYPE "CropCollectionStatus"
  USING (
    CASE
      WHEN "status"::text IN ('PENDING', 'APPROVED', 'PAID', 'PROCESSED', 'REJECTED') THEN "status"::text::"CropCollectionStatus"
      ELSE 'PENDING'::"CropCollectionStatus"
    END
  );

-- Restore default for new rows
ALTER TABLE "crop_collections"
  ALTER COLUMN "status" SET DEFAULT 'PENDING'::"CropCollectionStatus";

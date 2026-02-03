-- Create ReconciliationType enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE "ReconciliationType" AS ENUM ('COLLECTION', 'PAYMENT', 'INVENTORY', 'PERIOD');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create ReconciliationStatus enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE "ReconciliationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'DISPUTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Alter reconciliation_records to use enum types (only if columns are currently TEXT)
DO $$
BEGIN
  -- Change type column from TEXT to ReconciliationType
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reconciliation_records' AND column_name = 'type' AND data_type = 'text'
  ) THEN
    ALTER TABLE "reconciliation_records" 
    ALTER COLUMN "type" TYPE "ReconciliationType" USING "type"::"ReconciliationType";
  END IF;
  
  -- Change status column from TEXT to ReconciliationStatus
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reconciliation_records' AND column_name = 'status' AND data_type = 'text'
  ) THEN
    ALTER TABLE "reconciliation_records" 
    ALTER COLUMN "status" DROP DEFAULT;
    ALTER TABLE "reconciliation_records" 
    ALTER COLUMN "status" TYPE "ReconciliationStatus" USING "status"::"ReconciliationStatus";
    ALTER TABLE "reconciliation_records" 
    ALTER COLUMN "status" SET DEFAULT 'PENDING'::"ReconciliationStatus";
  END IF;
END $$;

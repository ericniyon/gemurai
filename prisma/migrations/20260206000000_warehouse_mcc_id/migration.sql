-- Each MCC has its own global warehouses: add mccId to warehouses
ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "mccId" TEXT;

CREATE INDEX IF NOT EXISTS "warehouses_mccId_idx" ON "warehouses"("mccId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'warehouses_mccId_fkey'
  ) THEN
    ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_mccId_fkey"
      FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

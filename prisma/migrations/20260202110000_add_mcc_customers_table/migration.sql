-- CreateTable: mcc_customers (MCC customer registry)
-- Table may be missing if older migrations were skipped; create it if not exists.

CREATE TABLE IF NOT EXISTS "mcc_customers" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "district" TEXT,
    "contactPerson" TEXT,
    "taxId" TEXT,
    "notes" TEXT,
    "gpsLatitude" DOUBLE PRECISION,
    "gpsLongitude" DOUBLE PRECISION,
    "geoConsent" BOOLEAN NOT NULL DEFAULT false,
    "geoConsentAt" TIMESTAMP(3),
    "geoCreatedAt" TIMESTAMP(3),
    "geoUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mcc_customers_pkey" PRIMARY KEY ("id")
);

-- Foreign key to mccs (only if not already present)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'mcc_customers_mccId_fkey'
        AND conrelid = 'mcc_customers'::regclass
    ) THEN
        ALTER TABLE "mcc_customers" ADD CONSTRAINT "mcc_customers_mccId_fkey"
            FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS "mcc_customers_mccId_idx" ON "mcc_customers"("mccId");
CREATE INDEX IF NOT EXISTS "mcc_customers_name_idx" ON "mcc_customers"("name");
CREATE INDEX IF NOT EXISTS "mcc_customers_contact_idx" ON "mcc_customers"("contact");

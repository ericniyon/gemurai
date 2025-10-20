-- Create provinces table if it doesn't exist
CREATE TABLE IF NOT EXISTS provinces (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert provinces if they don't exist
INSERT INTO provinces (id, name)
VALUES
  ('eastern', 'Eastern Province'),
  ('northern', 'Northern Province')
ON CONFLICT (id) DO NOTHING;

-- Create a unique index on the National ID field in formData
CREATE UNIQUE INDEX "applications_national_id_unique" ON "applications" ((("formData"->>'q5')));

-- Add a unique constraint using the index
ALTER TABLE "applications" ADD CONSTRAINT "applications_national_id_unique" UNIQUE USING INDEX "applications_national_id_unique";

-- Add the nationalId column
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "nationalId" TEXT;

-- Update existing records by extracting nationalId from formData
UPDATE "applications"
SET "nationalId" = ("formData"->>'q5')::TEXT
WHERE "formData"->>'q5' IS NOT NULL;

-- Add unique constraint
ALTER TABLE "applications" ADD CONSTRAINT "applications_nationalId_key" UNIQUE ("nationalId"); 
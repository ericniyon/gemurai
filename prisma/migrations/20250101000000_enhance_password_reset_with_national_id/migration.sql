-- Enhance password reset table to support national ID verification
-- Add metadata field to store additional verification data

-- Add metadata column to password_resets table
ALTER TABLE "password_resets" ADD COLUMN IF NOT EXISTS "metadata" TEXT;

-- Add index on metadata for faster lookups
CREATE INDEX IF NOT EXISTS "password_resets_metadata_idx" ON "password_resets"("metadata");

-- Add index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS "password_resets_expires_at_idx" ON "password_resets"("expiresAt");

-- Add index on used field for cleanup queries
CREATE INDEX IF NOT EXISTS "password_resets_used_idx" ON "password_resets"("used");

-- Update existing password_resets table structure if needed
-- Ensure the table has all required columns
DO $$
BEGIN
    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'password_resets' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE "password_resets" ADD COLUMN "metadata" TEXT;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'password_resets' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE "password_resets" ADD COLUMN "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_password_resets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS password_resets_updated_at_trigger ON "password_resets";
CREATE TRIGGER password_resets_updated_at_trigger
    BEFORE UPDATE ON "password_resets"
    FOR EACH ROW
    EXECUTE FUNCTION update_password_resets_updated_at();

-- Add comment to document the enhanced functionality
COMMENT ON TABLE "password_resets" IS 'Enhanced password reset table with national ID verification support';
COMMENT ON COLUMN "password_resets"."metadata" IS 'JSON metadata containing national ID and other verification data';
COMMENT ON COLUMN "password_resets"."expiresAt" IS 'Token expiration timestamp (typically 15 minutes)';
COMMENT ON COLUMN "password_resets"."used" IS 'Whether the reset token has been used';

-- Migration: Add Quality-related enum types
-- This migration creates the enum types and converts existing TEXT columns to use them

-- 1. Create QualityFieldType enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'QualityFieldType') THEN
        CREATE TYPE "QualityFieldType" AS ENUM ('NUMERIC', 'DROPDOWN', 'BOOLEAN', 'INDICATOR', 'TEXT');
    END IF;
END $$;

-- 2. Create QualityDataType enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'QualityDataType') THEN
        CREATE TYPE "QualityDataType" AS ENUM ('PERCENTAGE', 'DECIMAL', 'INTEGER', 'STRING', 'BOOLEAN');
    END IF;
END $$;

-- 3. Create QualityRuleType enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'QualityRuleType') THEN
        CREATE TYPE "QualityRuleType" AS ENUM ('PASS', 'FAIL', 'CONDITIONAL', 'WARNING');
    END IF;
END $$;

-- 4. Convert commodity_quality_fields.fieldType from TEXT to QualityFieldType
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'commodity_quality_fields') THEN
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'commodity_quality_fields' 
            AND column_name = 'fieldType'
            AND data_type = 'text'
        ) THEN
            -- Ensure all existing values are valid enum values
            UPDATE "commodity_quality_fields" 
            SET "fieldType" = 'NUMERIC' 
            WHERE "fieldType" NOT IN ('NUMERIC', 'DROPDOWN', 'BOOLEAN', 'INDICATOR', 'TEXT');
            
            -- Convert to enum
            ALTER TABLE "commodity_quality_fields" 
            ALTER COLUMN "fieldType" TYPE "QualityFieldType" 
            USING "fieldType"::"QualityFieldType";
        END IF;
    END IF;
END $$;

-- 5. Convert commodity_quality_fields.dataType from TEXT to QualityDataType
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'commodity_quality_fields') THEN
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'commodity_quality_fields' 
            AND column_name = 'dataType'
            AND data_type = 'text'
        ) THEN
            -- Ensure all existing values are valid enum values
            UPDATE "commodity_quality_fields" 
            SET "dataType" = 'DECIMAL' 
            WHERE "dataType" NOT IN ('PERCENTAGE', 'DECIMAL', 'INTEGER', 'STRING', 'BOOLEAN');
            
            -- Convert to enum
            ALTER TABLE "commodity_quality_fields" 
            ALTER COLUMN "dataType" TYPE "QualityDataType" 
            USING "dataType"::"QualityDataType";
        END IF;
    END IF;
END $$;

-- 6. Convert commodity_quality_rules.ruleType from TEXT to QualityRuleType
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'commodity_quality_rules') THEN
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'commodity_quality_rules' 
            AND column_name = 'ruleType'
            AND data_type = 'text'
        ) THEN
            -- Ensure all existing values are valid enum values
            UPDATE "commodity_quality_rules" 
            SET "ruleType" = 'PASS' 
            WHERE "ruleType" NOT IN ('PASS', 'FAIL', 'CONDITIONAL', 'WARNING');
            
            -- Convert to enum
            ALTER TABLE "commodity_quality_rules" 
            ALTER COLUMN "ruleType" TYPE "QualityRuleType" 
            USING "ruleType"::"QualityRuleType";
        END IF;
    END IF;
END $$;

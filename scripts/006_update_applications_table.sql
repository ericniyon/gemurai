-- Update applications table to reference the new administrative division tables
ALTER TABLE applications ADD COLUMN IF NOT EXISTS province_id TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS district_id TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS sector_id TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS cell_id TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS village_id TEXT;

-- Add foreign key constraints
ALTER TABLE applications ADD CONSTRAINT IF NOT EXISTS fk_applications_province 
    FOREIGN KEY (province_id) REFERENCES provinces(id);
ALTER TABLE applications ADD CONSTRAINT IF NOT EXISTS fk_applications_district 
    FOREIGN KEY (district_id) REFERENCES districts(id);
ALTER TABLE applications ADD CONSTRAINT IF NOT EXISTS fk_applications_sector 
    FOREIGN KEY (sector_id) REFERENCES sectors(id);
ALTER TABLE applications ADD CONSTRAINT IF NOT EXISTS fk_applications_cell 
    FOREIGN KEY (cell_id) REFERENCES cells(id);
ALTER TABLE applications ADD CONSTRAINT IF NOT EXISTS fk_applications_village 
    FOREIGN KEY (village_id) REFERENCES villages(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_province_id ON applications(province_id);
CREATE INDEX IF NOT EXISTS idx_applications_district_id ON applications(district_id);
CREATE INDEX IF NOT EXISTS idx_applications_sector_id ON applications(sector_id);
CREATE INDEX IF NOT EXISTS idx_applications_cell_id ON applications(cell_id);
CREATE INDEX IF NOT EXISTS idx_applications_village_id ON applications(village_id);

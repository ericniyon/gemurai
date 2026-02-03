-- Seed default crop types only if the table is empty (so existing data is not overwritten)
INSERT INTO "crop_types" ("id", "name", "code", "unitOfMeasure", "qualityStandards", "defaultPricePerUnit", "isActive", "createdAt", "updatedAt")
SELECT * FROM (VALUES
  (gen_random_uuid()::text, 'Maize', 'MAIZE', 'kg', '{}'::jsonb, 500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Beans', 'BEANS', 'kg', '{}'::jsonb, 800, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Coffee', 'COFFEE', 'kg', '{}'::jsonb, 1200, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Other', 'OTHER', 'kg', '{}'::jsonb, 300, true, NOW(), NOW())
) AS v(id, name, code, unitOfMeasure, qualityStandards, defaultPricePerUnit, isActive, createdAt, updatedAt)
WHERE NOT EXISTS (SELECT 1 FROM "crop_types" LIMIT 1);

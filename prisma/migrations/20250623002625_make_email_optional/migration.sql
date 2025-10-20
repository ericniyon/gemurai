-- Make email optional in users table
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;

-- Make email optional in applications table
ALTER TABLE "applications" ALTER COLUMN "email" DROP NOT NULL; 
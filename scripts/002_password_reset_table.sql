-- Create password reset table
CREATE TABLE IF NOT EXISTS "PasswordReset" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "used" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordReset_email_key" ON "PasswordReset"("email");

-- Create index on token for faster lookups
CREATE INDEX IF NOT EXISTS "PasswordReset_token_idx" ON "PasswordReset"("token");

-- Check if database exists and create tables if needed
-- This script ensures we have a clean starting point

-- First, let's check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if applications table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'applications'
) as applications_exists;

-- Check if users table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
) as users_exists;

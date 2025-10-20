-- Create core tables for Gemurai Platform
-- This is the foundation script that creates all essential tables

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS application_evaluations CASCADE;
DROP TABLE IF EXISTS dcc_profiles CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS sms_logs CASCADE;
DROP TABLE IF EXISTS password_resets CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    name TEXT NOT NULL,
    password TEXT,
    avatar TEXT,
    role TEXT NOT NULL DEFAULT 'CONSUMER',
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES users(id),
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SUBMITTED',
    form_data JSONB NOT NULL,
    current_step INTEGER DEFAULT 1,
    notes TEXT,
    dcc_created BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application evaluations table
CREATE TABLE application_evaluations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    evaluator_id TEXT NOT NULL REFERENCES users(id),
    questions JSONB NOT NULL,
    overall_score DECIMAL(5,2) NOT NULL,
    overall_comment TEXT,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DCC profiles table
CREATE TABLE dcc_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id),
    application_id TEXT UNIQUE NOT NULL REFERENCES applications(id),
    level TEXT NOT NULL DEFAULT 'LEVEL_C',
    rating DECIMAL(3,2) DEFAULT 5.0,
    total_sales TEXT DEFAULT 'RWF 0',
    monthly_sales TEXT DEFAULT 'RWF 0',
    products_available INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    location TEXT NOT NULL,
    specialties TEXT[] DEFAULT '{}',
    performance JSONB NOT NULL,
    recent_activity JSONB NOT NULL,
    approved_by TEXT,
    approved_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs table
CREATE TABLE email_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    template TEXT NOT NULL,
    status TEXT NOT NULL,
    error TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS logs table
CREATE TABLE sms_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    to_phone TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL,
    error TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password resets table
CREATE TABLE password_resets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_token TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_email ON applications(email);
CREATE INDEX idx_applications_phone ON applications(phone);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_dcc_profiles_level ON dcc_profiles(level);
CREATE INDEX idx_dcc_profiles_status ON dcc_profiles(status);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_sms_logs_status ON sms_logs(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_email ON password_resets(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_application_evaluations_updated_at BEFORE UPDATE ON application_evaluations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dcc_profiles_updated_at BEFORE UPDATE ON dcc_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user
INSERT INTO users (id, email, name, role, permissions) 
VALUES (
    'admin-001',
    'admin@Gemurai.rw',
    'System Administrator',
    'SUPER_ADMIN',
    ARRAY[
        'dashboard.view', 'dashboard.analytics', 'users.view', 'users.create', 'users.edit', 'users.delete',
        'products.view', 'products.create', 'products.edit', 'products.delete', 'products.purchase',
        'orders.view', 'orders.create', 'orders.manage', 'learning.view', 'learning.enroll', 'learning.manage',
        'jobs.view', 'jobs.apply', 'jobs.post', 'jobs.manage', 'finance.view', 'finance.request', 'finance.manage',
        'applications.view', 'applications.review', 'applications.manage', 'admin.users', 'admin.system', 'admin.reports', 'admin.forms'
    ]
) ON CONFLICT (email) DO NOTHING;

-- Verify tables were created
SELECT 'Core tables created successfully' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

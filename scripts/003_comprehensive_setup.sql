-- Add password field to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    salary VARCHAR(100),
    type VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    requirements JSONB NOT NULL DEFAULT '{}',
    benefits JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    posted_by TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    images TEXT[] DEFAULT '{}',
    stock INTEGER DEFAULT 0,
    seller_id TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    instructor VARCHAR(255) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO jobs (title, description, company, location, salary, type, category, requirements, posted_by) VALUES
('Software Developer', 'Full-stack developer position', 'Tech Corp', 'Kigali', 'RWF 500,000', 'full-time', 'Technology', '{"skills": ["JavaScript", "React", "Node.js"]}', (SELECT id FROM users WHERE role = 'EMPLOYER' LIMIT 1))
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, category, seller_id) VALUES
('Laptop Computer', 'High-performance laptop for business', 800000, 'Electronics', (SELECT id FROM users WHERE role = 'DCC' LIMIT 1)),
('Office Chair', 'Ergonomic office chair', 150000, 'Furniture', (SELECT id FROM users WHERE role = 'DCC' LIMIT 1))
ON CONFLICT DO NOTHING;

INSERT INTO courses (title, description, instructor, duration, level, category) VALUES
('Digital Marketing Basics', 'Learn the fundamentals of digital marketing', 'John Doe', '4 weeks', 'beginner', 'Marketing'),
('Web Development', 'Complete web development course', 'Jane Smith', '12 weeks', 'intermediate', 'Technology')
ON CONFLICT DO NOTHING;

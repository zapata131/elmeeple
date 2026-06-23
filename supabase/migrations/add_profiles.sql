-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('player', 'partner', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Allow public select on profiles" ON profiles;
CREATE POLICY "Allow public select on profiles"
    ON profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow public insert on profiles" ON profiles;
CREATE POLICY "Allow public insert on profiles"
    ON profiles FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow owner update on profiles" ON profiles;
CREATE POLICY "Allow owner update on profiles"
    ON profiles FOR UPDATE
    USING (true)
    WITH CHECK (true);

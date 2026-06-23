-- Create venues table
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_name TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    schedule JSONB NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cafe', 'tienda', 'hibrido', 'comunidad')),
    instagram TEXT,
    discord TEXT,
    logo_url TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create venue_tags join table
CREATE TABLE IF NOT EXISTS venue_tags (
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (venue_id, tag_id)
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_tags ENABLE ROW LEVEL SECURITY;

-- Policies for venues
CREATE POLICY "Allow public select on venues"
    ON venues FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on venues"
    ON venues FOR INSERT
    WITH CHECK (true);

-- Policies for tags
CREATE POLICY "Allow public select on tags"
    ON tags FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on tags"
    ON tags FOR INSERT
    WITH CHECK (true);

-- Policies for venue_tags
CREATE POLICY "Allow public select on venue_tags"
    ON venue_tags FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on venue_tags"
    ON venue_tags FOR INSERT
    WITH CHECK (true);

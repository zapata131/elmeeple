-- Add contact_email and contact_phone to venues
ALTER TABLE venues ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    user_email TEXT NOT NULL,
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    PRIMARY KEY (user_email, venue_id)
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for announcements
DROP POLICY IF EXISTS "Allow public select on announcements" ON announcements;
CREATE POLICY "Allow public select on announcements" ON announcements
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on announcements" ON announcements;
CREATE POLICY "Allow public insert on announcements" ON announcements
    FOR INSERT WITH CHECK (true);

-- RLS Policies for favorites
DROP POLICY IF EXISTS "Allow public select on favorites" ON favorites;
CREATE POLICY "Allow public select on favorites" ON favorites
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on favorites" ON favorites;
CREATE POLICY "Allow public insert on favorites" ON favorites
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on favorites" ON favorites;
CREATE POLICY "Allow public delete on favorites" ON favorites
    FOR DELETE USING (true);

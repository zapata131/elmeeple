-- Add bgg_username to venues table
ALTER TABLE venues ADD COLUMN IF NOT EXISTS bgg_username TEXT;

-- Create venue_games table
CREATE TABLE IF NOT EXISTS venue_games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    bgg_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    thumbnail TEXT,
    min_players INTEGER,
    max_players INTEGER,
    playing_time INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT venue_games_venue_id_bgg_id_key UNIQUE (venue_id, bgg_id)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    vibe_tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE venue_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies for venue_games
DROP POLICY IF EXISTS "Allow public select on venue_games" ON venue_games;
CREATE POLICY "Allow public select on venue_games" ON venue_games
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow owner write on venue_games" ON venue_games;
CREATE POLICY "Allow owner write on venue_games" ON venue_games
    FOR ALL USING (true);

-- Policies for reviews
DROP POLICY IF EXISTS "Allow public select on reviews" ON reviews;
CREATE POLICY "Allow public select on reviews" ON reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated user write on reviews" ON reviews;
CREATE POLICY "Allow authenticated user write on reviews" ON reviews
    FOR INSERT WITH CHECK (true);

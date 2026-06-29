-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    game TEXT NOT NULL,
    description TEXT,
    date TIMESTAMPTZ NOT NULL,
    entry_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    max_participants INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policies for events
CREATE POLICY "Allow public select on events"
    ON events FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated insert/update/delete on own events"
    ON events FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM venues 
            WHERE venues.id = events.venue_id 
            AND venues.owner_email = auth.jwt() ->> 'email'
        )
    );

-- Modify events table to support optional venues (siting) and registration URLs
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_venue_id UUID REFERENCES venues(id) ON DELETE CASCADE;

-- Backfill organizer_venue_id with the existing venue_id for backward compatibility
UPDATE events SET organizer_venue_id = venue_id WHERE organizer_venue_id IS NULL;

-- Make organizer_venue_id NOT NULL after backfilling
ALTER TABLE events ALTER COLUMN organizer_venue_id SET NOT NULL;

-- Make the physical venue_id (the host venue / "sede") optional (nullable)
ALTER TABLE events ALTER COLUMN venue_id DROP NOT NULL;

-- Add registration_url column
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_url TEXT;

-- Update RLS Policies to use organizer_venue_id instead of venue_id
DROP POLICY IF EXISTS "Allow authenticated insert/update/delete on own events" ON events;

CREATE POLICY "Allow authenticated insert/update/delete on own events"
    ON events FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM venues 
            WHERE venues.id = events.organizer_venue_id 
            AND venues.owner_email = auth.jwt() ->> 'email'
        )
    );

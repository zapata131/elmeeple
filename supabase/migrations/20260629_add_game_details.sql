-- Add complexity and alternate_names columns to venue_games table
ALTER TABLE venue_games 
ADD COLUMN IF NOT EXISTS complexity NUMERIC(3,2),
ADD COLUMN IF NOT EXISTS alternate_names TEXT;

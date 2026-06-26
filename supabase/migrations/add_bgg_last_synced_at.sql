-- Add bgg_last_synced_at column to venues for tracking collection synchronization time
ALTER TABLE venues ADD COLUMN IF NOT EXISTS bgg_last_synced_at TIMESTAMPTZ;

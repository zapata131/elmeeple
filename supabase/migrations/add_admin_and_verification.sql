-- Add columns to venues for owner verification and admin audit
ALTER TABLE venues ADD COLUMN IF NOT EXISTS business_tax_id TEXT;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS verification_proof TEXT;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE venues ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update RLS policies to only allow public reads of 'approved' venues
DROP POLICY IF EXISTS "Allow public select on venues" ON venues;

CREATE POLICY "Allow public select on venues"
    ON venues FOR SELECT
    USING (verification_status = 'approved');

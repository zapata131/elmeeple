-- Add reviewer_comment column to venues for onboarding contextual messages
ALTER TABLE venues ADD COLUMN IF NOT EXISTS reviewer_comment TEXT;

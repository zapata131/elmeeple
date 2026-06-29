-- Drop the old constraint that limits type to single values
ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_type_check;

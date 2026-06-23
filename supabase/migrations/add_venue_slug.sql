-- Add slug column to venues table
ALTER TABLE venues ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slug for existing venues using a safe slugify function
UPDATE venues 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')) 
WHERE slug IS NULL;

-- Ensure slug is unique and not null
ALTER TABLE venues ADD CONSTRAINT venues_slug_key UNIQUE (slug);

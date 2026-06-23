/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local manually if it exists to get access to environment variables in Node.js
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key if available, fallback to anon key for development/local testing
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tagsData = [
  { name: 'Eurogames', slug: 'eurogames' },
  { name: 'TCGs', slug: 'tcgs' },
  { name: 'Café', slug: 'cafe' },
  { name: 'Magic: The Gathering', slug: 'magic-the-gathering' },
  { name: 'Torneos', slug: 'torneos' },
  { name: 'Ludoteca', slug: 'ludoteca' }
];

const venuesData = [
  {
    name: 'Orcs Stories',
    owner_name: 'Admin',
    owner_email: 'admin@orcsstories.com',
    lat: 19.4165,
    lng: -99.1620,
    schedule: {
      mon: null,
      tue: { open: '14:00', close: '22:00' },
      wed: { open: '14:00', close: '22:00' },
      thu: { open: '14:00', close: '22:00' },
      fri: { open: '14:00', close: '22:00' },
      sat: { open: '14:00', close: '22:00' },
      sun: { open: '14:00', close: '22:00' }
    },
    description: 'Café de especialidad con una increíble ludoteca de juegos de mesa y comunidad activa de TCGs.',
    type: 'hibrido',
    instagram: 'orcs_stories',
    discord: 'https://discord.gg/orcsstories',
    logo_url: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=150&h=150&fit=crop',
    verified: true
  },
  {
    name: 'El Duende',
    owner_name: 'Admin',
    owner_email: 'admin@elduendetcg.com',
    lat: 19.3750,
    lng: -99.1780,
    schedule: {
      mon: { open: '11:00', close: '21:00' },
      tue: { open: '11:00', close: '21:00' },
      wed: { open: '11:00', close: '21:00' },
      thu: { open: '11:00', close: '21:00' },
      fri: { open: '11:00', close: '21:00' },
      sat: { open: '11:00', close: '21:00' },
      sun: { open: '11:00', close: '21:00' }
    },
    description: 'El punto de encuentro para torneos de cartas coleccionables y comunidad de juegos de mesa.',
    type: 'tienda',
    instagram: 'elduendetcg',
    discord: 'https://discord.gg/elduendetcg',
    logo_url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=150&h=150&fit=crop',
    verified: true
  },
  {
    name: 'Ravenfolks',
    owner_name: 'Admin',
    owner_email: 'admin@ravenfolks.com',
    lat: 19.4184,
    lng: -99.1627,
    schedule: {
      mon: null,
      tue: { open: '14:00', close: '22:00' },
      wed: { open: '14:00', close: '22:00' },
      thu: { open: '14:00', close: '22:00' },
      fri: { open: '14:00', close: '22:00' },
      sat: { open: '14:00', close: '22:00' },
      sun: { open: '14:00', close: '22:00' }
    },
    description: 'El primer board game café de la Ciudad de México. Cientos de juegos de mesa, comida deliciosa y excelente café de especialidad.',
    type: 'cafe',
    instagram: 'ravenfolks',
    logo_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop',
    verified: true
  }
];

async function seed() {
  try {
    console.log('--- Database Seeding Started ---');

    // 1. Seed Tags (with upsert to avoid duplicate keys on slug)
    console.log('Inserting/Upserting tags...');
    const { data: insertedTags, error: tagsError } = await supabase
      .from('tags')
      .upsert(tagsData, { onConflict: 'slug' })
      .select();

    if (tagsError) throw tagsError;
    console.log(`Successfully seeded ${insertedTags.length} tags.`);

    // Map tag names to their database IDs
    const tagMap = {};
    insertedTags.forEach(tag => {
      tagMap[tag.name] = tag.id;
    });

    // 2. Clear existing venues to avoid duplicates (clean seed)
    console.log('Cleaning up existing seeded venues...');
    const venueNames = venuesData.map(v => v.name);
    const { error: deleteError } = await supabase
      .from('venues')
      .delete()
      .in('name', venueNames);

    if (deleteError) throw deleteError;

    // 3. Seed Venues
    console.log('Inserting venues...');
    const { data: insertedVenues, error: venuesError } = await supabase
      .from('venues')
      .insert(venuesData)
      .select();

    if (venuesError) throw venuesError;
    console.log(`Successfully seeded ${insertedVenues.length} venues.`);

    // 4. Seed Venue-Tag Mappings
    console.log('Mapping tags to venues...');
    const venueTagsData = [];

    // Orcs Stories -> 'Eurogames', 'TCGs', 'Café'
    const orcs = insertedVenues.find(v => v.name === 'Orcs Stories');
    if (orcs) {
      ['Eurogames', 'TCGs', 'Café'].forEach(tagName => {
        const tagId = tagMap[tagName];
        if (tagId) {
          venueTagsData.push({ venue_id: orcs.id, tag_id: tagId });
        }
      });
    }

    // El Duende -> 'TCGs', 'Magic: The Gathering', 'Torneos'
    const duende = insertedVenues.find(v => v.name === 'El Duende');
    if (duende) {
      ['TCGs', 'Magic: The Gathering', 'Torneos'].forEach(tagName => {
        const tagId = tagMap[tagName];
        if (tagId) {
          venueTagsData.push({ venue_id: duende.id, tag_id: tagId });
        }
      });
    }

    // Ravenfolks -> 'Eurogames', 'Café', 'Ludoteca'
    const raven = insertedVenues.find(v => v.name === 'Ravenfolks');
    if (raven) {
      ['Eurogames', 'Café', 'Ludoteca'].forEach(tagName => {
        const tagId = tagMap[tagName];
        if (tagId) {
          venueTagsData.push({ venue_id: raven.id, tag_id: tagId });
        }
      });
    }

    if (venueTagsData.length > 0) {
      const { error: mappingError } = await supabase
        .from('venue_tags')
        .insert(venueTagsData);

      if (mappingError) throw mappingError;
      console.log(`Successfully mapped ${venueTagsData.length} venue-tag relationships.`);
    }

    console.log('--- Database Seeding Completed Successfully ---');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();

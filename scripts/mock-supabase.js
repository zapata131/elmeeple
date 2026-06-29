/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const http = require('http');
const url = require('url');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

let venues = [
  {
    id: "1",
    name: "Orcs Stories",
    slug: "orcs-stories",
    owner_name: "Owner User",
    owner_email: "owner@example.com",
    description: "Café de especialidad con una increíble ludoteca de juegos de mesa y comunidad activa de TCGs.",
    schedule: {
      mon: null,
      tue: { open: "14:00", close: "22:00" },
      wed: { open: "14:00", close: "22:00" },
      thu: { open: "14:00", close: "22:00" },
      fri: { open: "14:00", close: "22:00" },
      sat: { open: "14:00", close: "22:00" },
      sun: { open: "14:00", close: "22:00" }
    },
    lat: 19.4165,
    lng: -99.1620,
    type: "hibrido",
    instagram: "orcs_stories",
    discord: "https://discord.gg/orcsstories",
    logo_url: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=150&h=150&fit=crop",
    verification_status: "approved",
    verified: true,
    business_tax_id: "RFC-123456-1A",
    verification_proof: "data:image/jpeg;base64,mockcroppedlogo",
    contact_email: "owner@example.com",
    contact_phone: "+525512345678",
    bgg_username: "mybgguser",
    bgg_last_synced_at: new Date().toISOString(),
    venue_tags: [
      { tags: { name: "Eurogames" } },
      { tags: { name: "TCGs" } },
      { tags: { name: "Café" } }
    ]
  },
  {
    id: "2",
    name: "El Duende",
    slug: "el-duende",
    owner_name: "Duende Owner",
    owner_email: "duende@example.com",
    description: "El punto de encuentro para torneos de cartas coleccionables y comunidad de juegos de mesa.",
    schedule: {
      mon: { open: "11:00", close: "21:00" },
      tue: { open: "11:00", close: "21:00" },
      wed: { open: "11:00", close: "21:00" },
      thu: { open: "11:00", close: "21:00" },
      fri: { open: "11:00", close: "21:00" },
      sat: { open: "11:00", close: "21:00" },
      sun: { open: "11:00", close: "21:00" }
    },
    lat: 19.3750,
    lng: -99.1780,
    type: "tienda",
    instagram: "elduendetcg",
    discord: "https://discord.gg/elduendetcg",
    logo_url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=150&h=150&fit=crop",
    verification_status: "approved",
    verified: true,
    business_tax_id: "RFC-654321-2B",
    verification_proof: "data:image/jpeg;base64,mockcroppedlogo2",
    contact_email: "duende@example.com",
    contact_phone: "+525587654321",
    bgg_last_synced_at: null,
    venue_tags: [
      { tags: { name: "TCGs" } },
      { tags: { name: "Magic: The Gathering" } },
      { tags: { name: "Torneos" } }
    ]
  },
  {
    id: "3",
    name: "Ravenfolks",
    slug: "ravenfolks",
    owner_name: "Raven Owner",
    owner_email: "owner@example.com",
    description: "El primer board game café de la Ciudad de México. Cientos de juegos de mesa, comida deliciosa y excelente café de especialidad.",
    schedule: {
      mon: null,
      tue: { open: "14:00", close: "22:00" },
      wed: { open: "14:00", close: "22:00" },
      thu: { open: "14:00", close: "22:00" },
      fri: { open: "14:00", close: "22:00" },
      sat: { open: "14:00", close: "22:00" },
      sun: { open: "14:00", close: "22:00" }
    },
    lat: 19.4184,
    lng: -99.1627,
    type: "cafe",
    instagram: "ravenfolks",
    logo_url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop",
    verification_status: "approved",
    verified: true,
    business_tax_id: "RFC-998877-3C",
    verification_proof: "data:image/jpeg;base64,mockcroppedlogo3",
    contact_email: "ravenfolks@example.com",
    contact_phone: "+525599887766",
    bgg_last_synced_at: null,
    venue_tags: [
      { tags: { name: "Eurogames" } },
      { tags: { name: "Café" } },
      { tags: { name: "Ludoteca" } }
    ]
  },
  {
    id: "4",
    name: "La Matatena",
    slug: "la-matatena",
    owner_name: "Owner User",
    owner_email: "owner@example.com",
    description: "Café de juegos y punto de encuentro cultural en el corazón de Guadalajara, con una colección curada de juegos modernos.",
    schedule: {
      mon: null,
      tue: { open: "15:00", close: "23:00" },
      wed: { open: "15:00", close: "23:00" },
      thu: { open: "15:00", close: "23:00" },
      fri: { open: "15:00", close: "23:00" },
      sat: { open: "12:00", close: "23:00" },
      sun: { open: "12:00", close: "20:00" }
    },
    lat: 20.6736,
    lng: -103.3672,
    type: "cafe",
    instagram: "lamatatena_gdl",
    logo_url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&h=150&fit=crop",
    verification_status: "approved",
    verified: true,
    business_tax_id: "RFC-887766-4D",
    verification_proof: "data:image/jpeg;base64,mockcroppedlogo4",
    contact_email: "owner@example.com",
    contact_phone: "+523312345678",
    bgg_username: "zapata131",
    bgg_last_synced_at: null,
    venue_tags: [
      { tags: { name: "Eurogames" } },
      { tags: { name: "Café" } }
    ]
  }
];

let announcements = [
  {
    id: "ann-init-1",
    venue_id: "1",
    title: "Torneo de Bienvenida",
    content: "¡Ven a jugar con nosotros este viernes!",
    created_at: new Date().toISOString()
  }
];

let events = [
  {
    id: "evt-1",
    venue_id: "1",
    title: "Torneo de Lanzamiento Magic: Duskmourn",
    game: "Magic: The Gathering",
    description: "Únete a nosotros para el torneo de presentación de la nueva expansión. Sobres de juego incluidos con la inscripción.",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    entry_fee: 450.00,
    max_participants: 24,
    created_at: new Date().toISOString()
  },
  {
    id: "evt-2",
    venue_id: "1",
    title: "Noche de Eurogames: Catan y Carcassonne",
    game: "Catan",
    description: "Ven a jugar y conocer a otros entusiastas de los juegos de mesa. Entrada libre, consumo mínimo sugerido.",
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    entry_fee: 0.00,
    max_participants: 16,
    created_at: new Date().toISOString()
  },
  {
    id: "evt-3",
    venue_id: "2",
    title: "Store Championship Yu-Gi-Oh!",
    game: "Yu-Gi-Oh!",
    description: "Torneo oficial con premios exclusivos para el Top 8 y tapete de campeonato para el primer lugar.",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    entry_fee: 200.00,
    max_participants: 32,
    created_at: new Date().toISOString()
  }
];

let favorites = [];

let profiles = [
  {
    id: "prof-1",
    email: "player@example.com",
    name: "Player One",
    password: hashPassword("password123"),
    role: "player",
    created_at: new Date().toISOString()
  },
  {
    id: "prof-2",
    email: "partner@example.com",
    name: "Partner Owner",
    password: hashPassword("password123"),
    role: "partner",
    created_at: new Date().toISOString()
  },
  {
    id: "prof-3",
    email: "admin@example.com",
    name: "Admin User",
    password: hashPassword("password123"),
    role: "admin",
    created_at: new Date().toISOString()
  }
];


let reviews = [
  {
    id: "rev-1",
    user_email: "player@example.com",
    venue_id: "1",
    comment: "Excelente ambiente y gran variedad de juegos.",
    rating: 5,
    vibe_tags: ["Café", "Eurogames"],
    created_at: new Date(Date.now() - 3600000).toISOString(),
    venues: { name: "Orcs Stories" }
  }
];

let venue_games = [
  {
    id: "g-init-1",
    venue_id: "1",
    bgg_id: 167791,
    name: "Terraforming Mars",
    thumbnail: "https://cf.geekdo-images.com/thumb/tfm.jpg",
    min_players: 1,
    max_players: 5,
    playing_time: 120,
    created_at: new Date().toISOString()
  },
  {
    id: "g-init-2",
    venue_id: "1",
    bgg_id: 169786,
    name: "Scythe",
    thumbnail: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=150&h=150&fit=crop",
    min_players: 1,
    max_players: 5,
    playing_time: 115,
    created_at: new Date().toISOString()
  },
  {
    id: "g-init-3",
    venue_id: "3",
    bgg_id: 13,
    name: "Catan",
    thumbnail: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop",
    min_players: 3,
    max_players: 4,
    playing_time: 75,
    created_at: new Date().toISOString()
  },
  {
    id: "g-init-4",
    venue_id: "3",
    bgg_id: 822,
    name: "Carcassonne",
    thumbnail: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop",
    min_players: 2,
    max_players: 5,
    playing_time: 45,
    created_at: new Date().toISOString()
  }
];

function getFilterValue(query, key) {
  const val = query[key];
  if (!val) return null;
  if (Array.isArray(val)) {
    for (const v of val) {
      if (v.startsWith('eq.')) return v.substring(3);
    }
    return null;
  }
  if (val.startsWith('eq.')) {
    return val.substring(3);
  }
  return val;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, x-client-info, Prefer, accept-profile, x-retry-count, prefer-role');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`[Mock Supabase] ${method} ${req.url}`);

  // Helpers to read body
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    // Venues endpoint
    if (path.startsWith('/rest/v1/venues')) {
      if (method === 'GET') {
        const idFilter = getFilterValue(parsedUrl.query, 'id');
        const ownerFilter = getFilterValue(parsedUrl.query, 'owner_email');
        const statusFilter = getFilterValue(parsedUrl.query, 'verification_status');
        const slugFilter = getFilterValue(parsedUrl.query, 'slug');

        let filtered = [...venues];
        if (idFilter) {
          filtered = filtered.filter(v => v.id === idFilter);
        }
        if (ownerFilter) {
          filtered = filtered.filter(v => v.owner_email === ownerFilter);
        }
        if (statusFilter) {
          filtered = filtered.filter(v => v.verification_status === statusFilter);
        }
        if (slugFilter) {
          filtered = filtered.filter(v => v.slug === slugFilter);
        }

        // Dynamically embed venue_games and reviews
        const mapped = filtered.map(v => {
          const games = venue_games.filter(g => g.venue_id === v.id);
          const revs = reviews.filter(r => r.venue_id === v.id);
          return {
            ...v,
            venue_games: games,
            reviews: revs
          };
        });

        // Handle single object request (.single())
        const preferHeader = req.headers['prefer'] || '';
        const acceptHeader = req.headers['accept'] || '';
        if (
          preferHeader.includes('handling=strict') ||
          preferHeader.includes('count=') ||
          req.url.includes('single') ||
          acceptHeader.includes('vnd.pgrst.object')
        ) {
          if (mapped.length === 0) {
            res.writeHead(406, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' }));
            return;
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(mapped[0]));
            return;
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mapped));
      } else if (method === 'POST') {
        try {
          const payload = JSON.parse(body);
          const newVenue = {
            id: String(venues.length + 1),
            verification_status: 'pending',
            verified: false,
            venue_tags: [],
            ...payload
          };
          venues.push(newVenue);
          res.writeHead(201, { 'Content-Type': 'application/json', 'Prefer': 'return=representation' });
          res.end(JSON.stringify([newVenue]));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      } else if (method === 'PATCH') {
        const idFilter = getFilterValue(parsedUrl.query, 'id');
        if (idFilter) {
          try {
            const payload = JSON.parse(body);
            const idx = venues.findIndex(v => v.id === idFilter);
            if (idx !== -1) {
              venues[idx] = { ...venues[idx], ...payload };
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify([venues[idx]]));
            } else {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Venue not found' }));
            }
          } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
          }
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing id parameter' }));
        }
      }
      return;
    }

    // Announcements endpoint
    if (path.startsWith('/rest/v1/announcements')) {
      if (method === 'GET') {
        const venueIdFilter = getFilterValue(parsedUrl.query, 'venue_id');
        let filtered = [...announcements];
        if (venueIdFilter) {
          filtered = filtered.filter(a => a.venue_id === venueIdFilter);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(filtered));
      } else if (method === 'POST') {
        try {
          const payload = JSON.parse(body);
          const newAnn = {
            id: `ann-${Date.now()}`,
            created_at: new Date().toISOString(),
            ...payload
          };
          announcements.push(newAnn);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify([newAnn]));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      }
      return;
    }

    // Favorites endpoint
    if (path.startsWith('/rest/v1/favorites')) {
      if (method === 'GET') {
        const emailFilter = getFilterValue(parsedUrl.query, 'user_email');
        const venueIdFilter = getFilterValue(parsedUrl.query, 'venue_id');

        let filtered = [...favorites];
        if (emailFilter) {
          filtered = filtered.filter(f => f.user_email === emailFilter);
        }
        if (venueIdFilter) {
          filtered = filtered.filter(f => f.venue_id === venueIdFilter);
        }

        // If .single() is expected and no rows found, we return 406 for PGRST116
        const preferHeader = req.headers['prefer'] || '';
        if (preferHeader.includes('handling=strict') || preferHeader.includes('count=') || req.url.includes('single')) {
          if (filtered.length === 0) {
            res.writeHead(406, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' }));
            return;
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(filtered[0]));
            return;
          }
        }

        const mapped = filtered.map(f => {
          const v = venues.find(ven => ven.id === f.venue_id);
          return {
            ...f,
            venues: v ? { id: v.id, name: v.name, type: v.type, logo_url: v.logo_url } : null
          };
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mapped));
      } else if (method === 'POST') {
        try {
          const payload = JSON.parse(body);
          const newFav = {
            id: `fav-${Date.now()}`,
            ...payload
          };
          favorites.push(newFav);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify([newFav]));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      } else if (method === 'DELETE') {
        const emailFilter = getFilterValue(parsedUrl.query, 'user_email');
        const venueIdFilter = getFilterValue(parsedUrl.query, 'venue_id');

        favorites = favorites.filter(f => !(f.user_email === emailFilter && f.venue_id === venueIdFilter));
        res.writeHead(204);
        res.end();
      }
      return;
    }

    // Reviews endpoint
    if (path.startsWith('/rest/v1/reviews')) {
      if (method === 'GET') {
        const emailFilter = getFilterValue(parsedUrl.query, 'user_email');
        const venueIdFilter = getFilterValue(parsedUrl.query, 'venue_id');
        let filtered = [...reviews];
        if (emailFilter) {
          filtered = filtered.filter(r => r.user_email === emailFilter);
        }
        if (venueIdFilter) {
          filtered = filtered.filter(r => r.venue_id === venueIdFilter);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(filtered));
      } else if (method === 'POST') {
        try {
          const payload = JSON.parse(body);
          const newReview = {
            id: `rev-${Date.now()}`,
            created_at: new Date().toISOString(),
            ...payload
          };
          reviews.push(newReview);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify([newReview]));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      } else {
        res.writeHead(404);
        res.end();
      }
      return;
    }

    // Venue Games endpoint
    if (path.startsWith('/rest/v1/venue_games')) {
      if (method === 'GET') {
        const venueIdFilter = getFilterValue(parsedUrl.query, 'venue_id');
        let filtered = [...venue_games];
        if (venueIdFilter) {
          filtered = filtered.filter(g => g.venue_id === venueIdFilter);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(filtered));
      } else if (method === 'POST') {
        try {
          const payload = JSON.parse(body);
          const items = Array.isArray(payload) ? payload : [payload];
          items.forEach(item => {
            const existingIdx = venue_games.findIndex(g => g.venue_id === item.venue_id && g.bgg_id === item.bgg_id);
            if (existingIdx !== -1) {
              venue_games[existingIdx] = { ...venue_games[existingIdx], ...item };
            } else {
              venue_games.push({
                id: `game-${item.venue_id}-${item.bgg_id}`,
                created_at: new Date().toISOString(),
                ...item
              });
            }
          });
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(items));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      } else if (method === 'DELETE') {
        const venueIdFilter = getFilterValue(parsedUrl.query, 'venue_id');
        const bggIdParam = parsedUrl.query['bgg_id'];
        
        if (venueIdFilter) {
          if (bggIdParam && bggIdParam.startsWith('not.in.')) {
            const idsStr = bggIdParam.substring(8, bggIdParam.length - 1);
            const ids = idsStr.split(',').map(id => parseInt(id.trim(), 10)).filter(Boolean);
            venue_games = venue_games.filter(g => !(g.venue_id === venueIdFilter && !ids.includes(g.bgg_id)));
          } else {
            venue_games = venue_games.filter(g => g.venue_id !== venueIdFilter);
          }
          res.writeHead(204);
          res.end();
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing venue_id parameter' }));
        }
      } else {
        res.writeHead(404);
        res.end();
      }
      return;
    }

    // Profiles endpoint
    if (path.startsWith('/rest/v1/profiles')) {
      if (method === 'GET') {
        const emailFilter = getFilterValue(parsedUrl.query, 'email');
        let filtered = [...profiles];
        if (emailFilter) {
          filtered = filtered.filter(p => p.email === emailFilter);
        }

        const preferHeader = req.headers['prefer'] || '';
        const acceptHeader = req.headers['accept'] || '';
        if (
          preferHeader.includes('handling=strict') ||
          preferHeader.includes('count=') ||
          req.url.includes('single') ||
          acceptHeader.includes('vnd.pgrst.object')
        ) {
          if (filtered.length === 0) {
            res.writeHead(406, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' }));
            return;
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(filtered[0]));
            return;
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(filtered));
      } else if (method === 'POST') {
        try {
          const payload = JSON.parse(body);
          const newProfile = {
            id: `prof-${Date.now()}`,
            created_at: new Date().toISOString(),
            ...payload
          };
          profiles.push(newProfile);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify([newProfile]));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      }
      return;
    }

    // Tags endpoint
    if (path.startsWith('/rest/v1/tags')) {
      if (method === 'GET') {
        const initialTags = [
          { id: "t1", name: "Eurogames", slug: "eurogames" },
          { id: "t2", name: "TCGs", slug: "tcgs" },
          { id: "t3", name: "Café", slug: "cafe" }
        ];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(initialTags));
      } else {
        res.writeHead(404);
        res.end();
      }
      return;
    }

    // Events endpoint
    if (path.startsWith('/rest/v1/events')) {
      if (method === 'GET') {
        const venueIdFilter = getFilterValue(parsedUrl.query, 'venue_id');
        let filtered = [...events];
        if (venueIdFilter) {
          filtered = filtered.filter(e => e.venue_id === venueIdFilter);
        }
        // Sort events by date ascending
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(filtered));
      } else if (method === 'POST') {
        try {
          const payload = JSON.parse(body);
          const newEvent = {
            id: `evt-${Date.now()}`,
            created_at: new Date().toISOString(),
            ...payload
          };
          events.push(newEvent);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify([newEvent]));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      } else if (method === 'DELETE') {
        const idFilter = getFilterValue(parsedUrl.query, 'id');
        if (idFilter) {
          events = events.filter(e => e.id !== idFilter);
          res.writeHead(204);
          res.end();
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing id parameter' }));
        }
      } else {
        res.writeHead(404);
        res.end();
      }
      return;
    }

    // Fallback
    res.writeHead(404);
    res.end();
  });
});

server.listen(54321, '127.0.0.1', () => {
  console.log('--- Mock Supabase Server Listening on http://127.0.0.1:54321 ---');
});

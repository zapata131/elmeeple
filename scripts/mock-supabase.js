/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const http = require('http');
const url = require('url');

let venues = [
  {
    id: "1",
    name: "Orcs Stories",
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
    venue_tags: [
      { tags: { name: "Eurogames" } },
      { tags: { name: "TCGs" } },
      { tags: { name: "Café" } }
    ]
  },
  {
    id: "2",
    name: "El Duende",
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
    venue_tags: [
      { tags: { name: "TCGs" } },
      { tags: { name: "Magic: The Gathering" } },
      { tags: { name: "Torneos" } }
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

let favorites = [];

let reviews = [
  {
    id: "rev-1",
    user_email: "player@example.com",
    content: "Excelente ambiente y gran variedad de juegos.",
    rating: 5,
    created_at: new Date().toISOString(),
    venues: { name: "Orcs Stories" }
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(filtered));
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

        // If .single() is expected and no rows found, we return 406 for PGRST116 (no rows)
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

        // In the profile page, we select venues. So we map favorites to have a nested venue object.
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

        const initialLength = favorites.length;
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
        let filtered = [...reviews];
        if (emailFilter) {
          filtered = filtered.filter(r => r.user_email === emailFilter);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(filtered));
      } else {
        res.writeHead(404);
        res.end();
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

    // Fallback
    res.writeHead(404);
    res.end();
  });
});

server.listen(54321, '127.0.0.1', () => {
  console.log('--- Mock Supabase Server Listening on http://127.0.0.1:54321 ---');
});

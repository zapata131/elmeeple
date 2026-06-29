import { Venue } from '@/components/QuickViewCard'

export const MOCK_VENUES: Venue[] = [
  {
    id: '1',
    name: 'Orcs Stories',
    slug: 'orcs-stories',
    lat: 19.4165,
    lng: -99.1620,
    address: 'Roma Norte, CDMX',
    tags: ['Eurogames', 'TCGs', 'Café'],
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
    type: 'cafe,tienda',
    instagram: 'orcs_stories',
    logoUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=150&h=150&fit=crop',
    venue_games: [
      { id: 'g1', name: 'Scythe', thumbnail: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=150&h=150&fit=crop', min_players: 1, max_players: 5, playing_time: 115, complexity: 3.4, alternate_names: 'Scythe' },
      { id: 'g7', name: 'Terraforming Mars', thumbnail: 'https://cf.geekdo-images.com/thumb/tfm.jpg', min_players: 1, max_players: 5, playing_time: 120, complexity: 3.24, alternate_names: 'Terraforming Mars' },
      { id: 'g8', name: 'Catan', thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop', min_players: 3, max_players: 4, playing_time: 75, complexity: 2.3, alternate_names: 'Catan, Los Colonos de Catan' }
    ]
  },
  {
    id: '2',
    name: 'El Duende',
    slug: 'el-duende',
    lat: 19.3750,
    lng: -99.1780,
    address: 'Coyoacán, CDMX',
    tags: ['TCGs', 'Magic: The Gathering', 'Torneos'],
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
    logoUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=150&h=150&fit=crop',
    venue_games: [
      { id: 'g2', name: 'Magic: The Gathering', thumbnail: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=150&h=150&fit=crop', min_players: 2, max_players: 4, playing_time: 45, complexity: 3.1, alternate_names: 'MTG, Magic' },
      { id: 'g3', name: 'Keyforge', thumbnail: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=150&h=150&fit=crop', min_players: 2, max_players: 2, playing_time: 30, complexity: 2.8, alternate_names: 'Keyforge' }
    ]
  },
  {
    id: '3',
    name: 'Ravenfolks',
    slug: 'ravenfolks',
    lat: 19.4184,
    lng: -99.1627,
    address: 'Roma Norte, CDMX',
    tags: ['Eurogames', 'Café', 'Ludoteca'],
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
    logoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop',
    venue_games: [
      { id: 'g4', name: 'Catan', thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop', min_players: 3, max_players: 4, playing_time: 75, complexity: 2.3, alternate_names: 'Catan, Los Colonos de Catan' },
      { id: 'g5', name: 'Carcassonne', thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop', min_players: 2, max_players: 5, playing_time: 45, complexity: 1.9, alternate_names: 'Carcassonne' },
      { id: 'g6', name: 'Dixit', thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop', min_players: 3, max_players: 12, playing_time: 30, complexity: 1.2, alternate_names: 'Dixit' }
    ]
  },
  {
    id: '4',
    name: 'La Matatena',
    slug: 'la-matatena',
    lat: 20.6736,
    lng: -103.3672,
    address: 'Colonia Americana, Guadalajara',
    tags: ['Eurogames', 'Familiar', 'Café'],
    schedule: {
      mon: null,
      tue: { open: '15:00', close: '23:00' },
      wed: { open: '15:00', close: '23:00' },
      thu: { open: '15:00', close: '23:00' },
      fri: { open: '15:00', close: '23:00' },
      sat: { open: '12:00', close: '23:00' },
      sun: { open: '12:00', close: '20:00' }
    },
    description: 'Café de juegos y punto de encuentro cultural en el corazón de Guadalajara, con una colección curada de juegos modernos.',
    type: 'cafe',
    instagram: 'lamatatena_gdl',
    logoUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&h=150&fit=crop',
    venue_games: []
  },
  {
    id: '5',
    name: 'Club de Rol La Torre',
    slug: 'club-de-rol-la-torre',
    lat: undefined,
    lng: undefined,
    address: 'CDMX, México (Sedes variables)',
    tags: ['Rol (RPGs)', 'Wargames', 'Comunidad'],
    schedule: {
      mon: null,
      tue: null,
      wed: null,
      thu: null,
      fri: null,
      sat: null,
      sun: null
    },
    description: 'Comunidad de juegos de rol, wargames y juegos de mesa en la CDMX. Nos reunimos semanalmente en locales colaboradores.',
    type: 'comunidad',
    instagram: 'latorrerpg',
    logoUrl: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=150&h=150&fit=crop',
    venue_games: []
  }
]

export interface Event {
  id: string
  venue_id: string | null
  organizer_venue_id: string
  title: string
  game: string
  description: string | null
  date: string
  entry_fee: number
  max_participants: number | null
  registration_url?: string | null
  created_at: string
}

export const MOCK_EVENTS: Event[] = [
  {
    id: 'evt-1',
    venue_id: '1',
    organizer_venue_id: '1',
    title: 'Torneo de Lanzamiento Magic: Duskmourn',
    game: 'Magic: The Gathering',
    description: 'Únete a nosotros para el torneo de presentación de la nueva expansión. Sobres de juego incluidos con la inscripción.',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    entry_fee: 450.00,
    max_participants: 24,
    created_at: new Date().toISOString()
  },
  {
    id: 'evt-2',
    venue_id: '1',
    organizer_venue_id: '1',
    title: 'Noche de Eurogames: Catan y Carcassonne',
    game: 'Catan',
    description: 'Ven a jugar y conocer a otros entusiastas de los juegos de mesa. Entrada libre, consumo mínimo sugerido.',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    entry_fee: 0.00,
    max_participants: 16,
    created_at: new Date().toISOString()
  },
  {
    id: 'evt-3',
    venue_id: '2',
    organizer_venue_id: '2',
    title: 'Store Championship Yu-Gi-Oh!',
    game: 'Yu-Gi-Oh!',
    description: 'Torneo oficial con premios exclusivos para el Top 8 y tapete de campeonato para el primer lugar.',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    entry_fee: 200.00,
    max_participants: 32,
    created_at: new Date().toISOString()
  },
  {
    id: 'evt-4',
    venue_id: '1',
    organizer_venue_id: '5',
    title: 'Noche de Rol: D&D 5e',
    game: 'Dungeons & Dragons',
    description: 'Una noche de aventuras en las mesas de Orcs Stories. Campañas cortas para principiantes y veteranos.',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    entry_fee: 50.00,
    max_participants: 12,
    created_at: new Date().toISOString()
  },
  {
    id: 'evt-5',
    venue_id: null,
    organizer_venue_id: '5',
    title: 'Sesión de Comunidad Online',
    game: 'Discord',
    description: 'Nos reunimos en nuestro canal de Discord para jugar juegos de mesa en Tabletop Simulator.',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    entry_fee: 0.00,
    max_participants: null,
    created_at: new Date().toISOString()
  }
]

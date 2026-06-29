import { Venue } from '@/components/QuickViewCard'

export const MOCK_VENUES: Venue[] = [
  {
    id: '1',
    name: 'Orcs Stories',
    slug: 'orcs-stories',
    lat: 19.4165,
    lng: -99.1620,
    address: 'Roma Norte, CDMX',
    tags: ['Eurogames', 'TCGs', 'Café', 'Yu-Gi-Oh!', 'Torneos Oficiales'],
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
    logoUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=150&h=150&fit=crop',
    venue_games: [
      { id: 'g1', name: 'Scythe', thumbnail: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=150&h=150&fit=crop', min_players: 1, max_players: 5, playing_time: 115 },
      { id: 'g7', name: 'Terraforming Mars', thumbnail: 'https://cf.geekdo-images.com/thumb/tfm.jpg', min_players: 1, max_players: 5, playing_time: 120 },
      { id: 'g8', name: 'Catan', thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop', min_players: 3, max_players: 4, playing_time: 75 }
    ]
  },
  {
    id: '2',
    name: 'El Duende',
    slug: 'el-duende',
    lat: 19.3750,
    lng: -99.1780,
    address: 'Coyoacán, CDMX',
    tags: ['TCGs', 'Magic: The Gathering', 'Torneos', 'Torneos Oficiales'],
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
      { id: 'g2', name: 'Magic: The Gathering', thumbnail: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=150&h=150&fit=crop', min_players: 2, max_players: 4, playing_time: 45 },
      { id: 'g3', name: 'Keyforge', thumbnail: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=150&h=150&fit=crop', min_players: 2, max_players: 2, playing_time: 30 }
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
      { id: 'g4', name: 'Catan', thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop', min_players: 3, max_players: 4, playing_time: 75 },
      { id: 'g5', name: 'Carcassonne', thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop', min_players: 2, max_players: 5, playing_time: 45 },
      { id: 'g6', name: 'Dixit', thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop', min_players: 3, max_players: 12, playing_time: 30 }
    ]
  },
  {
    id: '4',
    name: 'La Matatena',
    slug: 'la-matatena',
    lat: 20.6736,
    lng: -103.3672,
    address: 'Colonia Americana, Guadalajara',
    tags: ['Eurogames', 'Familiar', 'Café', 'Pokémon'],
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
  }
]

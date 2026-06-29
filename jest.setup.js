import '@testing-library/jest-dom'
import React from 'react'

// Mock next/navigation globally
const mockPushGlobal = jest.fn()
const mockRefreshGlobal = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPushGlobal,
    refresh: mockRefreshGlobal,
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Polyfill Request, Response, Headers in JSDOM
if (typeof global.TextEncoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}

if (typeof global.ReadableStream === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ReadableStream } = require('node:stream/web')
  global.ReadableStream = ReadableStream
}

if (typeof global.MessagePort === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MessagePort } = require('node:worker_threads')
  global.MessagePort = MessagePort
}

if (typeof global.Request === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Request, Response, Headers } = require('undici')
  global.Request = Request
  global.Response = Response
  global.Headers = Headers
}



// Mock next/dynamic globally to render dynamic components synchronously in Jest
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    // Create a mock component that will render the dynamic component synchronously
    const DynamicComponent = (props) => {
      // Filter out non-DOM props to prevent React warnings in test logs
      const domProps = {}
      for (const [key, value] of Object.entries(props)) {
        if (typeof value !== 'function' && key !== 'venues' && key !== 'selectedVenue') {
          domProps[key] = value
        }
      }
      return React.createElement('div', { 'data-testid': 'mock-map-container', ...domProps })
    }
    
    DynamicComponent.displayName = 'DynamicComponent'
    return DynamicComponent
  },
}))

// Mock the client-side Supabase client globally to return mock venues matching the initial dataset
jest.mock('@/utils/supabase/client', () => {
  const mockMOCK_VENUES = [
    {
      id: '1',
      name: 'Orcs Stories',
      lat: 19.4165,
      lng: -99.1620,
      venue_tags: [
        { tags: { name: 'Eurogames' } },
        { tags: { name: 'TCGs' } },
        { tags: { name: 'Café' } }
      ],
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
      discord: 'https://discord.gg/orcsstories',
      logo_url: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=150&h=150&fit=crop',
      verified: true,
      venue_games: [
        { id: 'g1', name: 'Scythe', thumbnail: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=150&h=150&fit=crop', min_players: 1, max_players: 5, playing_time: 115 },
        { id: 'g7', name: 'Terraforming Mars', thumbnail: 'https://cf.geekdo-images.com/thumb/tfm.jpg', min_players: 1, max_players: 5, playing_time: 120 },
        { id: 'g8', name: 'Catan', thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop', min_players: 3, max_players: 4, playing_time: 75 }
      ]
    },
    {
      id: '2',
      name: 'El Duende',
      lat: 19.3750,
      lng: -99.1780,
      venue_tags: [
        { tags: { name: 'TCGs' } },
        { tags: { name: 'Magic: The Gathering' } },
        { tags: { name: 'Torneos' } }
      ],
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
      verified: true,
      venue_games: [
        { id: 'g2', name: 'Magic: The Gathering', thumbnail: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=150&h=150&fit=crop', min_players: 2, max_players: 4, playing_time: 45 },
        { id: 'g3', name: 'Keyforge', thumbnail: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=150&h=150&fit=crop', min_players: 2, max_players: 2, playing_time: 30 }
      ]
    },
    {
      id: '3',
      name: 'Ravenfolks',
      lat: 19.4184,
      lng: -99.1627,
      venue_tags: [
        { tags: { name: 'Eurogames' } },
        { tags: { name: 'Café' } },
        { tags: { name: 'Ludoteca' } }
      ],
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
      verified: true,
      venue_games: [
        { id: 'g4', name: 'Catan', thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop', min_players: 3, max_players: 4, playing_time: 75 },
        { id: 'g5', name: 'Carcassonne', thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop', min_players: 2, max_players: 5, playing_time: 45 },
        { id: 'g6', name: 'Dixit', thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop', min_players: 3, max_players: 12, playing_time: 30 }
      ]
    }
  ]

  let currentTable = ''
  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ error: null }),
    delete: jest.fn().mockResolvedValue({ error: null }),
    then: jest.fn(function(onFulfilled) {
      let resolvedValue = { data: [], error: null }
      if (currentTable === 'venues') {
        resolvedValue = { data: mockMOCK_VENUES, error: null }
      }
      return Promise.resolve(resolvedValue).then(onFulfilled)
    })
  }

  const mockSupabase = {
    from: jest.fn().mockImplementation((table) => {
      currentTable = table
      return mockQueryBuilder
    }),
    insert: jest.fn().mockResolvedValue({ error: null }),
    delete: jest.fn().mockResolvedValue({ error: null })
  }

  global.mockSupabaseInstance = mockSupabase
  return {
    createClient: () => global.mockSupabaseInstance
  }
})

// Mock the server-side Supabase client globally
jest.mock('@/utils/supabase/server', () => {
  let currentTable = ''
  const mockMOCK_VENUES = [
    {
      id: '1',
      name: 'Orcs Stories',
      lat: 19.4165,
      lng: -99.1620,
      venue_tags: [
        { tags: { name: 'Eurogames' } },
        { tags: { name: 'TCGs' } },
        { tags: { name: 'Café' } }
      ],
      schedule: {},
      description: 'Café de especialidad con una increíble ludoteca de juegos de mesa y comunidad activa de TCGs.',
      type: 'cafe,tienda',
      instagram: 'orcs_stories',
      discord: 'https://discord.gg/orcsstories',
      logo_url: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=150&h=150&fit=crop',
      verified: true,
      venue_games: [
        { id: 'g1', name: 'Scythe', thumbnail: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=150&h=150&fit=crop', min_players: 1, max_players: 5, playing_time: 115 },
        { id: 'g7', name: 'Terraforming Mars', thumbnail: 'https://cf.geekdo-images.com/thumb/tfm.jpg', min_players: 1, max_players: 5, playing_time: 120 },
        { id: 'g8', name: 'Catan', thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop', min_players: 3, max_players: 4, playing_time: 75 }
      ]
    }
  ]

  const mockQueryBuilderServer = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ error: null }),
    delete: jest.fn().mockResolvedValue({ error: null }),
    then: jest.fn(function(onFulfilled) {
      let resolvedValue = { data: [], error: null }
      if (currentTable === 'venues') {
        resolvedValue = { data: mockMOCK_VENUES, error: null }
      }
      return Promise.resolve(resolvedValue).then(onFulfilled)
    })
  }

  const mockSupabaseServer = {
    from: jest.fn().mockImplementation((table) => {
      currentTable = table
      return mockQueryBuilderServer
    }),
    insert: jest.fn().mockResolvedValue({ error: null }),
    delete: jest.fn().mockResolvedValue({ error: null })
  }

  global.mockSupabaseServerInstance = mockSupabaseServer
  return {
    createClient: () => Promise.resolve(global.mockSupabaseServerInstance)
  }
})

// Mock next-auth globally to prevent ESM import syntax issues with the jose package
jest.mock('next-auth', () => {
  const mockNextAuth = jest.fn().mockReturnValue({
    GET: jest.fn(),
    POST: jest.fn(),
  })
  return {
    __esModule: true,
    default: mockNextAuth,
    getServerSession: jest.fn().mockResolvedValue({
      user: {
        name: 'Player One',
        email: 'player@example.com',
        role: 'player'
      }
    })
  }
})

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        name: 'Player One',
        email: 'player@example.com',
        role: 'player'
      }
    },
    status: 'authenticated'
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children
}))

// Mock platform admin server actions
jest.mock('@/app/actions/admin', () => ({
  approveVenue: jest.fn().mockResolvedValue({ success: true }),
  rejectVenue: jest.fn().mockResolvedValue({ success: true })
}), { virtual: true })

// Mock BGG and Reviews server actions
const mockSyncBggCollection = jest.fn().mockResolvedValue({ success: true, count: 2 })
global.mockSyncBggCollection = mockSyncBggCollection
jest.mock('@/app/actions/bgg', () => ({
  __esModule: true,
  syncBggCollection: jest.fn().mockImplementation((venueId, bggUsername) => global.mockSyncBggCollection(venueId, bggUsername)),
}))

const mockSubmitReview = jest.fn().mockResolvedValue({ success: true })
global.mockSubmitReview = mockSubmitReview
jest.mock('@/app/actions/reviews', () => ({
  submitReview: (venueId, rating, comment, vibeTags) => mockSubmitReview(venueId, rating, comment, vibeTags),
}), { virtual: true })

// Mock next/navigation globally to prevent "invariant expected app router to be mounted" crashes
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Polyfill window.matchMedia for JSDOM
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}




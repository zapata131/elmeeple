// Extend Jest with custom matchers from testing-library
import '@testing-library/jest-dom'
import React from 'react'

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
      type: 'hibrido',
      instagram: 'orcs_stories',
      discord: 'https://discord.gg/orcsstories',
      logo_url: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=150&h=150&fit=crop',
      verified: true
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
      verified: true
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
      verified: true
    }
  ]

  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockResolvedValue({
      data: mockMOCK_VENUES,
      error: null
    })
  }

  return {
    createClient: () => mockSupabase
  }
})

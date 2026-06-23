/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { syncBggCollection } from '@/app/actions/bgg'
import { submitReview } from '@/app/actions/reviews'
import OwnerDashboard from '@/app/dashboard/page'
import InteractiveMap from '@/components/InteractiveMap'
import QuickViewCard from '@/components/QuickViewCard'

// Unmock the server actions so we can test their real implementations in this test suite
jest.unmock('@/app/actions/bgg')
jest.unmock('@/app/actions/reviews')

// Mock next/navigation
const mockPush = jest.fn()
const mockRefresh = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  usePathname: () => '/dashboard',
}))

// Mock Leaflet/map components to avoid canvas/DOM errors in JSDOM
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-map">{children}</div>,
  TileLayer: () => <div />,
  Marker: () => <div />,
  useMap: () => ({ setView: jest.fn() }),
  useMapEvents: () => null,
}))

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockResolvedValue({
    user: {
      name: 'Player One',
      email: 'player@example.com',
      role: 'player',
    },
  }),
}))

const COMPLIANT_EMPTY_SCHEDULE = {
  mon: null,
  tue: null,
  wed: null,
  thu: null,
  fri: null,
  sat: null,
  sun: null
}

describe('Milestone 3: BGG Sync Ludoteca & Community Reviews', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global as any).fetch = jest.fn()
  })

  // 1. BoardGameGeek Synchronization Server Action
  describe('BGG Sync Server Action', () => {
    const mockBggXml = `
      <items totalitems="2">
        <item objectid="13" subtype="boardgame">
          <name sortindex="1">Catan</name>
          <thumbnail>https://cf.geekdo-images.com/thumb/catan.jpg</thumbnail>
          <stats minplayers="3" maxplayers="4" playingtime="90"></stats>
        </item>
        <item objectid="167791" subtype="boardgame">
          <name sortindex="1">Terraforming Mars</name>
          <thumbnail>https://cf.geekdo-images.com/thumb/tfm.jpg</thumbnail>
          <stats minplayers="1" maxplayers="5" playingtime="120"></stats>
        </item>
      </items>
    `

    it('correctly fetches BGG XML, parses it, and bulk upserts games into Supabase', async () => {
      // Mock global fetch to return the XML
      const spyFetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockBggXml),
      } as Response)
      ;(global as any).fetch = spyFetch

      // Mock Supabase client
      const mockUpsert = jest.fn().mockResolvedValue({ error: null })
      const mockEq = jest.fn().mockResolvedValue({ error: null })
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq })
      
      ;(global as any).mockSupabaseServerInstance.from = jest.fn().mockImplementation((table: string) => {
        if (table === 'venue_games') {
          return { upsert: mockUpsert }
        }
        if (table === 'venues') {
          return { update: mockUpdate }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { id: 'venue-123', owner_email: 'owner@example.com' }, error: null })
        }
      })

      const res = await syncBggCollection('venue-123', 'testuser')

      expect(res.success).toBe(true)
      expect(spyFetch).toHaveBeenCalledWith(
        'https://boardgamegeek.com/xmlapi2/collection?username=testuser&own=1',
        { headers: {} }
      )
      
      // Verify upsert contains both parsed games
      expect(mockUpsert).toHaveBeenCalledWith([
        {
          venue_id: 'venue-123',
          bgg_id: 13,
          name: 'Catan',
          thumbnail: 'https://cf.geekdo-images.com/thumb/catan.jpg',
          min_players: 3,
          max_players: 4,
          playing_time: 90,
        },
        {
          venue_id: 'venue-123',
          bgg_id: 167791,
          name: 'Terraforming Mars',
          thumbnail: 'https://cf.geekdo-images.com/thumb/tfm.jpg',
          min_players: 1,
          max_players: 5,
          playing_time: 120,
        }
      ], { onConflict: 'venue_id,bgg_id' })
    })
  })

  // 2. Reviews Server Action
  describe('Reviews Server Action', () => {
    it('validates rating range, checks authentication, and writes review to Supabase', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      ;(global as any).mockSupabaseServerInstance.from = jest.fn().mockImplementation((table: string) => {
        if (table === 'reviews') {
          return { insert: mockInsert }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
        }
      })

      // Test a valid review
      const res = await submitReview('venue-123', 5, '¡Excelente lugar!', ['Eurogames', 'Comida'])
      expect(res.success).toBe(true)
      expect(mockInsert).toHaveBeenCalledWith({
        user_email: 'player@example.com',
        venue_id: 'venue-123',
        rating: 5,
        comment: '¡Excelente lugar!',
        vibe_tags: ['Eurogames', 'Comida'],
      })

      // Test invalid rating (too high)
      const resHigh = await submitReview('venue-123', 6, 'Too high rating', [])
      expect(resHigh.success).toBe(false)
      expect(resHigh.error).toContain('Calificación no válida')

      // Test invalid rating (too low)
      const resLow = await submitReview('venue-123', 0, 'Too low rating', [])
      expect(resLow.success).toBe(false)
      expect(resLow.error).toContain('Calificación no válida')
    })
  })

  // 3. Owner Dashboard integration
  describe('Owner Dashboard UI & BGG Sync Integration', () => {
    it('renders the BGG sync panel and displays the visual cover arts grid of imported games', async () => {
      const mockVenue = {
        id: 'venue-owner-1',
        name: 'My Board Game Café',
        owner_email: 'owner@example.com',
        verification_status: 'approved',
        bgg_username: 'mybgguser'
      }

      const mockGames = [
        { id: 'g-1', name: 'Catan', thumbnail: 'https://cf.geekdo-images.com/thumb/catan.jpg' },
        { id: 'g-2', name: 'Terraforming Mars', thumbnail: 'https://cf.geekdo-images.com/thumb/tfm.jpg' }
      ]

      // Mock Supabase select responses
      ;(global as any).mockSupabaseServerInstance.from = jest.fn().mockImplementation((table: string) => {
        if (table === 'venues') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ data: [mockVenue], error: null })
          } as any
        }
        if (table === 'venue_games') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ data: mockGames, error: null })
          } as any
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: [], error: null })
        } as any
      })

      // Render the Dashboard (async Server Component)
      const dashboardNode = await OwnerDashboard({ searchParams: { email: 'owner@example.com' } })
      render(dashboardNode)

      // Verify sync panel elements exist
      expect(screen.getByText(/Sincronizar con BoardGameGeek/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Usuario de BGG/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Sincronizar/i })).toBeInTheDocument()

      // Verify the cover arts grid displays the imported games
      expect(screen.getByText('Catan')).toBeInTheDocument()
      expect(screen.getByText('Terraforming Mars')).toBeInTheDocument()
      const images = screen.getAllByRole('img')
      expect(images.some(img => img.getAttribute('src') === 'https://cf.geekdo-images.com/thumb/catan.jpg')).toBe(true)
      expect(images.some(img => img.getAttribute('src') === 'https://cf.geekdo-images.com/thumb/tfm.jpg')).toBe(true)
    })
  })

  // 4. Homepage Search & Filter
  describe('Homepage Search Bar Filter', () => {
    it('filters venues by game title and highlights matched venues', async () => {
      const mockVenues = [
        {
          id: 'venue-1',
          name: 'Orcs Stories',
          lat: 19.4165,
          lng: -99.1620,
          verified: true,
          verification_status: 'approved',
          schedule: COMPLIANT_EMPTY_SCHEDULE,
          venue_tags: [],
          venue_games: [{ name: 'Catan' }],
          reviews: []
        },
        {
          id: 'venue-2',
          name: 'El Duende',
          lat: 19.3750,
          lng: -99.1780,
          verified: true,
          verification_status: 'approved',
          schedule: COMPLIANT_EMPTY_SCHEDULE,
          venue_tags: [],
          venue_games: [{ name: 'Magic: The Gathering' }],
          reviews: []
        }
      ]

      // Mock client-side Supabase query to return these venues with games
      ;(global as any).mockSupabaseInstance.from = jest.fn().mockImplementation((table: string) => {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          then: jest.fn(function(onFulfilled) {
            return Promise.resolve({ data: mockVenues, error: null }).then(onFulfilled)
          })
        } as any
      })

      render(<InteractiveMap />)
      const user = userEvent.setup()

      // Wait for venues to load
      await screen.findByText('Orcs Stories')

      // Type game title 'Catan' in the search bar
      const searchInput = screen.getByPlaceholderText(/Buscar locales/i)
      await user.type(searchInput, 'Catan')

      // Orcs Stories has Catan, so it should remain visible or marked. El Duende does not, so it should be filtered out.
      expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
      expect(screen.queryByText('El Duende')).not.toBeInTheDocument()
    })
  })

  // 5. Quick View Card tabs
  describe('Quick View Card tabs (Ludoteca & Reviews)', () => {
    const mockVenue = {
      id: 'venue-123',
      name: 'Orcs Stories',
      lat: 19.4165,
      lng: -99.1620,
      tags: ['Eurogames'],
      schedule: COMPLIANT_EMPTY_SCHEDULE,
      address: 'Roma Norte',
      description: 'A cozy gaming spot.'
    }

    const mockGames = [
      { id: 'g-1', name: 'Catan', thumbnail: 'https://cf.geekdo-images.com/thumb/catan.jpg', min_players: 3, max_players: 4, playing_time: 90 }
    ]

    const mockReviews = [
      { id: 'r-1', user_email: 'player@example.com', rating: 5, comment: 'Amazing vibes', vibe_tags: ['Eurogames', 'Comida'], created_at: '2026-06-23T12:00:00Z' }
    ]

    beforeEach(() => {
      // Mock Supabase queries inside QuickViewCard
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        then: jest.fn(function(onFulfilled) {
          return Promise.resolve({ data: [], error: null }).then(onFulfilled)
        })
      }

      ;(global as any).mockSupabaseInstance.from = jest.fn().mockImplementation((table: string) => {
        if (table === 'venue_games') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ data: mockGames, error: null })
          } as any
        }
        if (table === 'reviews') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockReviews, error: null })
          } as any
        }
        return mockQueryBuilder
      })
    })

    it('renders the scrollable cover arts gallery in the Ludoteca tab', async () => {
      render(<QuickViewCard venue={mockVenue} onClose={jest.fn()} />)
      const user = userEvent.setup()

      // Click the Ludoteca tab
      const ludotecaTab = await screen.findByRole('button', { name: /Ludoteca/i })
      await user.click(ludotecaTab)

      // Verify the game Catan cover is rendered
      expect(screen.getByText('Catan')).toBeInTheDocument()
      expect(screen.getByText('3-4 jug. | 90 min')).toBeInTheDocument()
      const cover = screen.getByRole('img', { name: /Catan/i })
      expect(cover).toHaveAttribute('src', 'https://cf.geekdo-images.com/thumb/catan.jpg')
    })

    it('renders reviews feed, rating stars, write form, and vibe progress bars in the Reseñas tab', async () => {
      render(<QuickViewCard venue={mockVenue} onClose={jest.fn()} />)
      const user = userEvent.setup()

      // Click the Reseñas tab
      const reviewsTab = await screen.findByRole('button', { name: /Reseñas/i })
      await user.click(reviewsTab)

      // Verify reviews feed content
      expect(await screen.findByText('Amazing vibes')).toBeInTheDocument()
      expect(screen.getByText('player@example.com')).toBeInTheDocument()

      // Verify average stars display
      expect(screen.getByText(/Calificación Promedio/i)).toBeInTheDocument()
      expect(screen.getByText('5.0 / 5.0')).toBeInTheDocument()

      // Verify vibe tags summary progress bars
      expect(screen.getAllByText('Eurogames').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Comida').length).toBeGreaterThan(0)

      // Verify the write review form components
      expect(screen.getByPlaceholderText(/Escribe tu reseña aquí/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Enviar Reseña/i })).toBeInTheDocument()
    })
  })
})

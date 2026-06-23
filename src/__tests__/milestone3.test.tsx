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

      // Toggle to game search mode
      const gamesToggle = screen.getByRole('button', { name: /buscar juegos/i })
      await user.click(gamesToggle)

      // Type game title 'Catan' in the search bar
      const searchInput = screen.getByPlaceholderText(/buscar juegos/i)
      await user.type(searchInput, 'Catan')

      // Orcs Stories has Catan, so it should remain visible or marked. El Duende does not, so it should be filtered out.
      expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
      expect(screen.queryByText('El Duende')).not.toBeInTheDocument()
    })
  })
})

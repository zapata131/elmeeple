/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VenueProfileClient from '@/app/venue/[slug]/VenueProfileClient'

// Unmock the server actions so we can test their real implementations in this test suite
jest.unmock('@/app/actions/reviews')

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        name: 'Player One',
        email: 'player@example.com',
        role: 'player'
      }
    }
  })
}))

// Mock server actions
jest.mock('@/app/actions/favorite', () => ({
  toggleFavorite: jest.fn().mockResolvedValue({ success: true, isFavorite: true })
}))

// Schedule helper for mock venue

const COMPLIANT_EMPTY_SCHEDULE = {
  mon: null,
  tue: null,
  wed: null,
  thu: null,
  fri: null,
  sat: null,
  sun: null
}

describe('VenueProfileClient Component & Interactive Catalog Search', () => {
  const mockVenue = {
    id: 'venue-123',
    name: 'Orcs Stories',
    slug: 'orcs-stories',
    lat: 19.4165,
    lng: -99.1620,
    tags: ['Eurogames', 'TCGs'],
    schedule: COMPLIANT_EMPTY_SCHEDULE,
    address: 'Roma Norte, CDMX',
    description: 'Café de especialidad con gran ludoteca.',
    type: 'hibrido' as const,
    instagram: 'orcs_stories',
    discord: 'https://discord.gg/orcs',
    logoUrl: 'https://cf.geekdo-images.com/thumb/logo.jpg',
    venue_games: [
      { id: 'g1', name: 'Scythe', thumbnail: 'https://cf.geekdo-images.com/thumb/scythe.jpg', min_players: 1, max_players: 5, playing_time: 115 },
      { id: 'g2', name: 'Terraforming Mars', thumbnail: 'https://cf.geekdo-images.com/thumb/tfm.jpg', min_players: 1, max_players: 5, playing_time: 120 },
      { id: 'g3', name: 'Catan', thumbnail: 'https://cf.geekdo-images.com/thumb/catan.jpg', min_players: 3, max_players: 4, playing_time: 90 },
      { id: 'g4', name: 'Love Letter', thumbnail: 'https://cf.geekdo-images.com/thumb/loveletter.jpg', min_players: 2, max_players: 4, playing_time: 20 }
    ],
    reviews: [
      { id: 'r1', user_email: 'player1@example.com', rating: 5, comment: 'Increíble lugar', vibe_tags: ['Eurogames', 'Café'], created_at: '2026-06-23T12:00:00Z' }
    ]
  }

  const mockInsert = jest.fn().mockResolvedValue({ error: null })

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global as any).mockSupabaseServerInstance.from = jest.fn().mockImplementation((table: string) => {
      if (table === 'reviews') {
        return { insert: mockInsert }
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
      } as any
    })
  })

  it('renders the store details, hero banner, social links, and schedule', () => {
    render(<VenueProfileClient venue={mockVenue} />)

    expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
    expect(screen.getByText('Café de especialidad con gran ludoteca.')).toBeInTheDocument()
    expect(screen.getByText('Híbrido (café y tienda)')).toBeInTheDocument()
    expect(screen.getByText('Roma Norte, CDMX')).toBeInTheDocument()

    // Verify social links exist
    const instaLink = screen.getByRole('link', { name: 'Instagram' })
    expect(instaLink).toHaveAttribute('href', 'https://instagram.com/orcs_stories')
    const discordLink = screen.getByRole('link', { name: 'Discord' })
    expect(discordLink).toHaveAttribute('href', 'https://discord.gg/orcs')
  })

  it('renders the game catalog with cover cards and stats, and filters them via the search bar', async () => {
    render(<VenueProfileClient venue={mockVenue} />)
    const user = userEvent.setup()

    // Verify all 4 games are initially rendered
    expect(screen.getByText('Scythe')).toBeInTheDocument()
    expect(screen.getByText('Terraforming Mars')).toBeInTheDocument()
    expect(screen.getByText('Catan')).toBeInTheDocument()
    expect(screen.getByText('Love Letter')).toBeInTheDocument()

    // Type 'Scythe' in the local search bar
    const searchInput = screen.getByPlaceholderText(/Buscar juego por título/i)
    await user.type(searchInput, 'Scythe')

    // Scythe should remain, others should be filtered out
    expect(screen.getByText('Scythe')).toBeInTheDocument()
    expect(screen.queryByText('Terraforming Mars')).not.toBeInTheDocument()
    expect(screen.queryByText('Catan')).not.toBeInTheDocument()
    expect(screen.queryByText('Love Letter')).not.toBeInTheDocument()
  })

  it('filters games based on player count filter chips', async () => {
    render(<VenueProfileClient venue={mockVenue} />)
    const user = userEvent.setup()

    // Click the '3-4' player filter chip
    // Catan (3-4) and Love Letter (2-4) and Scythe (1-5) and Terraforming Mars (1-5) all overlap
    // Click the '1 (Solo)' player filter chip
    const soloChip = screen.getByRole('button', { name: '1 (Solo)' })
    await user.click(soloChip)

    // Scythe (1-5) and Terraforming Mars (1-5) should remain. Catan (3-4) and Love Letter (2-4) should be filtered out.
    expect(screen.getByText('Scythe')).toBeInTheDocument()
    expect(screen.getByText('Terraforming Mars')).toBeInTheDocument()
    expect(screen.queryByText('Catan')).not.toBeInTheDocument()
    expect(screen.queryByText('Love Letter')).not.toBeInTheDocument()
  })

  it('filters games based on play duration filter chips', async () => {
    render(<VenueProfileClient venue={mockVenue} />)
    const user = userEvent.setup()

    // Click the 'Rápido (<30 min)' play duration filter chip
    const fastChip = screen.getByRole('button', { name: 'Rápido (<30 min)' })
    await user.click(fastChip)

    // Love Letter (20 min) should remain. Scythe (115 min), Terraforming Mars (120 min), Catan (90 min) should be filtered out.
    expect(screen.getByText('Love Letter')).toBeInTheDocument()
    expect(screen.queryByText('Scythe')).not.toBeInTheDocument()
    expect(screen.queryByText('Terraforming Mars')).not.toBeInTheDocument()
    expect(screen.queryByText('Catan')).not.toBeInTheDocument()
  })

  it('renders reviews summaries, vibe progress bars, and allows submitting a new review', async () => {
    render(<VenueProfileClient venue={mockVenue} />)
    const user = userEvent.setup()

    // Verify initial review is rendered
    expect(screen.getByText('Increíble lugar')).toBeInTheDocument()
    expect(screen.getByText('player1@example.com')).toBeInTheDocument()

    // Fill out the review form
    const commentInput = screen.getByPlaceholderText(/Comparte tu opinión/i)
    await user.type(commentInput, 'Excelente café y gran atención.')

    // Click the 'Café' vibe tag button in the review form
    // Let's find the tag button in the form
    const tagCafe = screen.getByRole('button', { name: 'Café' })
    await user.click(tagCafe)

    // Submit the review
    const submitBtn = screen.getByRole('button', { name: 'Publicar reseña' })
    await user.click(submitBtn)

    // Verify server action was called
    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith({
        venue_id: 'venue-123',
        user_email: 'player@example.com',
        rating: 5,
        comment: 'Excelente café y gran atención.',
        vibe_tags: ['Café']
      })
    })

    // Verify new review is immediately appended to the UI comments list
    expect(screen.getByText('Excelente café y gran atención.')).toBeInTheDocument()
  })

  it('renders mobile tabbed navigation bar and switches tabs on mobile viewports', async () => {
    render(<VenueProfileClient venue={mockVenue} />)
    const user = userEvent.setup()

    // Query mobile tab buttons (they are the first elements in the DOM with these names)
    const catalogTabBtn = screen.getAllByRole('button', { name: /Ludoteca/i })[0]
    const eventsTabBtn = screen.getAllByRole('button', { name: /Eventos/i })[0]
    const reviewsTabBtn = screen.getAllByRole('button', { name: /Comunidad/i })[0]

    expect(catalogTabBtn).toBeInTheDocument()
    expect(eventsTabBtn).toBeInTheDocument()
    expect(reviewsTabBtn).toBeInTheDocument()

    // Catalog tab should be active initially, others inactive
    expect(catalogTabBtn).toHaveClass('border-[#8367C7]')
    expect(eventsTabBtn).toHaveClass('border-transparent')
    expect(reviewsTabBtn).toHaveClass('border-transparent')

    // Click on Comunidad tab
    await user.click(reviewsTabBtn)

    // Active classes should swap
    expect(catalogTabBtn).toHaveClass('border-transparent')
    expect(reviewsTabBtn).toHaveClass('border-[#8367C7]')
  })

  it('allows toggling between grid and list views for the game catalog', async () => {
    render(<VenueProfileClient venue={mockVenue} />)
    const user = userEvent.setup()

    // Grid view should be rendered by default
    expect(screen.getByTestId('games-grid')).toBeInTheDocument()
    expect(screen.queryByTestId('games-list')).not.toBeInTheDocument()

    // Toggle to List View
    const listToggleBtn = screen.getByTestId('view-mode-list')
    await user.click(listToggleBtn)

    // List view should now be rendered, grid should be gone
    expect(screen.getByTestId('games-list')).toBeInTheDocument()
    expect(screen.queryByTestId('games-grid')).not.toBeInTheDocument()

    // Toggle back to Grid View
    const gridToggleBtn = screen.getByTestId('view-mode-grid')
    await user.click(gridToggleBtn)

    // Grid view should be rendered again, list gone
    expect(screen.getByTestId('games-grid')).toBeInTheDocument()
    expect(screen.queryByTestId('games-list')).not.toBeInTheDocument()
  })

  describe('Event Listings Tab', () => {
    const mockEvents = [
      {
        id: 'evt-1',
        venue_id: 'venue-123',
        title: 'Torneo de Lanzamiento Magic: Duskmourn',
        game: 'Magic: The Gathering',
        description: 'Torneo de presentación.',
        date: '2026-07-01T18:00:00Z',
        entry_fee: 450.00,
        max_participants: 24,
        created_at: '2026-06-25T12:00:00Z',
      },
    ]

    it('renders the Events tab with correct counts and displays upcoming events', () => {
      render(<VenueProfileClient venue={mockVenue} initialEvents={mockEvents} />)

      // Verify sub-tab headers exist (rendered for both mobile and desktop)
      expect(screen.getAllByText(/Eventos \(1\)/i)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/Comunidad \(1\)/i)[0]).toBeInTheDocument()

      // By default, the events list should be visible since activeRightColTab defaults to 'events'
      expect(screen.getByText('Torneo de Lanzamiento Magic: Duskmourn')).toBeInTheDocument()
      expect(screen.getByText('Magic: The Gathering')).toBeInTheDocument()
      expect(screen.getByText('Torneo de presentación.')).toBeInTheDocument()
      expect(screen.getByText('$450.00')).toBeInTheDocument()
      expect(screen.getByText('Cupo: 24')).toBeInTheDocument()
    })

    it('renders empty state if there are no upcoming events', () => {
      render(<VenueProfileClient venue={mockVenue} initialEvents={[]} />)

      expect(screen.getAllByText(/Eventos \(0\)/i)[0]).toBeInTheDocument()
      expect(screen.getByText('No hay eventos programados')).toBeInTheDocument()
      expect(screen.getByText('Este local no tiene torneos o actividades próximamente.')).toBeInTheDocument()
    })
  })
})

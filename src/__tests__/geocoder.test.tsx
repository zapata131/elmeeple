import '@testing-library/jest-dom'
import { render, screen, act, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '@/app/page'

// Share mock functions to inspect calls
const mockFlyTo = jest.fn()
const mockSetView = jest.fn()

// Override next/dynamic to render Map synchronously
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Map = require('../components/Map').default
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function MockDynamicMap(props: any) {
      return <Map {...props} />
    }
  },
}))

// Mock react-leaflet
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="mock-tile-layer" />,
  ZoomControl: () => <div data-testid="mock-zoom-control" />,
  Marker: ({ position, eventHandlers }: { position: [number, number]; eventHandlers?: { click?: () => void } }) => (
    <button
      data-testid={`mock-marker-${position[0]}-${position[1]}`}
      onClick={eventHandlers?.click}
      type="button"
    >
      Marker at {position[0]}, {position[1]}
    </button>
  ),
  useMap: () => ({
    setView: mockSetView,
    flyTo: mockFlyTo,
  }),
  Tooltip: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-tooltip">{children}</div>,
  useMapEvents: () => ({
    setView: jest.fn(),
    flyTo: jest.fn(),
    getBounds: () => ({
      getSouthWest: () => ({ lat: 19.30, lng: -99.22 }),
      getNorthEast: () => ({ lat: 19.50, lng: -99.10 }),
    }),
    getZoom: () => 13,
  }),
}))

const mockLocationSuggestions = [
  {
    place_id: 1,
    display_name: 'Roma Norte, Ciudad de México, México',
    lat: '19.4150',
    lon: '-99.1650',
  },
]

describe('Unified Smart Search & Autocomplete Suggestions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders a single search input with unified placeholder and no separate location input', async () => {
    render(<Home />)
    
    // Wait for the venues list to load
    await screen.findByText('Orcs Stories')

    const searchInput = screen.getByPlaceholderText('Buscar locales, juegos, direcciones...')
    expect(searchInput).toBeInTheDocument()

    // The old "Buscar dirección o zona..." input should NOT be present
    expect(screen.queryByPlaceholderText('Buscar dirección o zona...')).not.toBeInTheDocument()
  })

  it('queries Nominatim API and displays categorized suggestions (Locations, Venues, Games) after debounce', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockLocationSuggestions,
    })

    render(<Home />)
    await screen.findByText('Orcs Stories')

    const searchInput = screen.getByPlaceholderText('Buscar locales, juegos, direcciones...')
    
    // Type "Roma" which matches:
    // - Nominatim location: "Roma Norte..."
    // - Venue: "Orcs Stories" (in Roma Norte) - wait, it matches "Roma Norte" in the address, but does it match venue name?
    // Let's type "Catan" which matches:
    // - Game: "Catan" (available in Orcs Stories and Ravenfolks)
    await user.type(searchInput, 'Catan')

    // Before debounce, fetch should not be called
    expect(global.fetch).not.toHaveBeenCalled()

    // Fast-forward debounce time (500ms)
    act(() => {
      jest.advanceTimersByTime(500)
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://nominatim.openstreetmap.org/search')
      )
    })

    // Dropdown should be visible with categorized suggestions
    // "Catan" should be under "Juegos" category
    expect(screen.getByText('Juegos')).toBeInTheDocument()
    expect(screen.getByText('Catan')).toBeInTheDocument()
  })

  it('triggers map navigation and updates search query when selecting a location suggestion', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockLocationSuggestions,
    })

    render(<Home />)
    await screen.findByText('Orcs Stories')

    const searchInput = screen.getByPlaceholderText('Buscar locales, juegos, direcciones...')
    await user.type(searchInput, 'Roma')

    act(() => {
      jest.advanceTimersByTime(500)
    })

    const locationSuggestion = await screen.findByText('Roma Norte, Ciudad de México, México')
    await user.click(locationSuggestion)

    // The map should flyTo the coordinates
    expect(mockFlyTo).toHaveBeenCalledWith([19.4150, -99.1650], 13, {
      animate: true,
      duration: 1.5,
    })

    // The search input should be updated with the location name
    expect(searchInput).toHaveValue('Roma Norte, Ciudad de México, México')

    // Dropdown should be closed
    expect(screen.queryByText('Ubicaciones')).not.toBeInTheDocument()
  })

  it('selects a venue and opens Quick View Card when selecting a venue suggestion', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    })

    render(<Home />)
    await screen.findByText('Orcs Stories')

    const searchInput = screen.getByPlaceholderText('Buscar locales, juegos, direcciones...')
    await user.type(searchInput, 'Orcs')

    act(() => {
      jest.advanceTimersByTime(500)
    })

    // "Orcs Stories" should appear as a venue suggestion under "Locales"
    expect(screen.getByText('Locales')).toBeInTheDocument()
    const dropdown = screen.getByTestId('search-suggestions')
    const venueSuggestion = within(dropdown).getByRole('button', { name: /orcs stories/i })
    await user.click(venueSuggestion)

    // Quick View Card should be opened
    expect(await screen.findByTestId('quick-view-card')).toBeInTheDocument()

    // Input should be updated with venue name
    expect(searchInput).toHaveValue('Orcs Stories')

    // Dropdown should be closed
    expect(screen.queryByText('Locales')).not.toBeInTheDocument()
  })

  it('filters list and shows game badge when selecting a game suggestion', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    })

    render(<Home />)
    await screen.findByText('Orcs Stories')

    const searchInput = screen.getByPlaceholderText('Buscar locales, juegos, direcciones...')
    await user.type(searchInput, 'Catan')

    act(() => {
      jest.advanceTimersByTime(500)
    })

    const dropdown = screen.getByTestId('search-suggestions')
    const gameSuggestion = within(dropdown).getByRole('button', { name: /^catan$/i })
    await user.click(gameSuggestion)

    // Input should be updated with game name
    expect(searchInput).toHaveValue('Catan')

    // List should show Catan badge
    const badges = screen.getAllByText('Tiene Catan')
    expect(badges.length).toBe(2)

    // Dropdown should be closed
    expect(screen.queryByText('Juegos')).not.toBeInTheDocument()
  })
})

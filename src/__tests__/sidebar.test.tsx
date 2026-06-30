import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '@/app/page'

// Override the global next/dynamic mock to render the Map component synchronously in this test
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    // Synchronously require the Map component using a relative path so Jest resolves it correctly
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Map = require('../components/Map').default
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function MockDynamicMap(props: any) {
      return <Map {...props} />
    }
  },
}))

// Mock react-leaflet so that it doesn't break in JSDOM, and expose interactive markers
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
    setView: jest.fn(),
    flyTo: jest.fn(),
    getZoom: () => 15,
  }),
  Tooltip: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-tooltip">{children}</div>,
  useMapEvents: () => ({
    setView: jest.fn(),
    flyTo: jest.fn(),
    getBounds: () => ({
      getSouthWest: () => ({ lat: 19.30, lng: -99.22 }),
      getNorthEast: () => ({ lat: 19.50, lng: -99.10 }),
    }),
    getZoom: () => 15,
  }),
}))

describe('Left Sidebar Directory Layout', () => {
  it('renders the sidebar with a search input and category chips', () => {
    render(<Home />)
    
    // Check search input exists
    const searchInput = screen.getByPlaceholderText(/buscar locales/i)
    expect(searchInput).toBeInTheDocument()

    // Check category chips exist
    expect(screen.getByRole('button', { name: /todos/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cafés/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tiendas/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /comunidades/i })).toBeInTheDocument()
  })

  it('renders a scrollable list of matching venues', async () => {
    render(<Home />)

    // Check the venue list container exists
    const venueList = screen.getByTestId('venue-list')
    expect(venueList).toBeInTheDocument()

    // Check default venues are rendered in the list after loading
    expect(await screen.findByText('Orcs Stories')).toBeInTheDocument()
    expect(await screen.findByText('El Duende')).toBeInTheDocument()
    expect(await screen.findByText('Ravenfolks')).toBeInTheDocument()
  })

  it('filters the list of venues when typing in the search bar', async () => {
    render(<Home />)
    const user = userEvent.setup()
    const searchInput = screen.getByPlaceholderText(/buscar locales/i)

    // Wait for initial venues to load first
    await screen.findByText('Orcs Stories')

    // Type "Orcs" in search bar
    await user.type(searchInput, 'Orcs')

    // Only "Orcs Stories" should match
    expect(screen.getByRole('button', { name: /seleccionar orcs stories/i })).toBeInTheDocument()
    expect(screen.queryByText('El Duende')).not.toBeInTheDocument()
    expect(screen.queryByText('Ravenfolks')).not.toBeInTheDocument()

    // Clear search and verify all show up again
    await user.clear(searchInput)
    expect(await screen.findByText('Orcs Stories')).toBeInTheDocument()
    expect(screen.getByText('El Duende')).toBeInTheDocument()
    expect(screen.getByText('Ravenfolks')).toBeInTheDocument()

    // Type "Roma Norte" (address/tag search)
    await user.type(searchInput, 'Roma Norte')
    expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
    expect(screen.getByText('Ravenfolks')).toBeInTheDocument()
    expect(screen.queryByText('El Duende')).not.toBeInTheDocument()
  })

  it('filters the list of venues when clicking a category chip', async () => {
    render(<Home />)
    const user = userEvent.setup()

    // Wait for initial venues to load first
    await screen.findByText('Orcs Stories')

    // Click "Tiendas" chip
    const tiendasChip = screen.getByRole('button', { name: /tiendas/i })
    await user.click(tiendasChip)

    // "El Duende" (type === 'tienda') and "Orcs Stories" (type === 'cafe,tienda') should show up
    expect(screen.getByText('El Duende')).toBeInTheDocument()
    expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
    expect(screen.queryByText('Ravenfolks')).not.toBeInTheDocument()

    // Click "Cafés" chip
    const cafesChip = screen.getByRole('button', { name: /cafés/i })
    await user.click(cafesChip)

    // "Ravenfolks" (type === 'cafe') and "Orcs Stories" (type === 'cafe,tienda') should show up
    expect(screen.getByText('Ravenfolks')).toBeInTheDocument()
    expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
    expect(screen.queryByText('El Duende')).not.toBeInTheDocument()

    // Click "Todos" chip
    const todosChip = screen.getByRole('button', { name: /todos/i })
    await user.click(todosChip)

    // All should show up
    expect(await screen.findByText('Orcs Stories')).toBeInTheDocument()
    expect(screen.getByText('El Duende')).toBeInTheDocument()
    expect(screen.getByText('Ravenfolks')).toBeInTheDocument()
  })

  it('selects a venue and opens its Quick View Card when clicking a venue card in the sidebar', async () => {
    render(<Home />)
    const user = userEvent.setup()

    // Find the venue card button or clickable card in the list (wait for it to load)
    const ravenfolksCard = await screen.findByRole('button', { name: /seleccionar ravenfolks/i })
    await user.click(ravenfolksCard)

    // Verify Quick View Card is rendered with Ravenfolks details
    expect(await screen.findByTestId('quick-view-card')).toBeInTheDocument()
    expect(screen.getAllByText('Ravenfolks')).toHaveLength(2) // One in list, one in Quick View Card
  })

  it('filters the list of venues by distance when selecting a radius filter chip', async () => {
    // Mock navigator.geolocation
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementation((success) =>
        success({
          coords: {
            latitude: 19.4165, // Coords of Orcs Stories
            longitude: -99.1620,
          },
        })
      ),
    }
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    })

    render(<Home />)
    const user = userEvent.setup()

    // Wait for initial venues to load
    expect(await screen.findByText('Orcs Stories')).toBeInTheDocument()
    expect(screen.getByText('El Duende')).toBeInTheDocument()
    expect(screen.getByText('Ravenfolks')).toBeInTheDocument()

    // Check radius filter chips exist
    expect(screen.getByRole('button', { name: '2 km' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '5 km' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '10 km' })).toBeInTheDocument()

    // Click '2 km' chip
    const twoKmChip = screen.getByRole('button', { name: '2 km' })
    await user.click(twoKmChip)

    // Orcs Stories (0 km) and Ravenfolks (0.2 km) should be visible.
    // El Duende (4.9 km) should be filtered out.
    expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
    expect(screen.getByText('Ravenfolks')).toBeInTheDocument()
    expect(screen.queryByText('El Duende')).not.toBeInTheDocument()

    // Click '5 km' chip
    const fiveKmChip = screen.getByRole('button', { name: '5 km' })
    await user.click(fiveKmChip)

    // All three CDMX venues should be visible
    expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
    expect(screen.getByText('Ravenfolks')).toBeInTheDocument()
    expect(screen.getByText('El Duende')).toBeInTheDocument()

    // Clean up mock
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      writable: true,
      configurable: true,
    })
  })

  it('renders a community without physical coordinates on the map at its next upcoming event location', async () => {
    render(<Home />)

    // Wait for the community "Club de Rol La Torre" to load in the sidebar list
    expect(await screen.findByText('Club de Rol La Torre')).toBeInTheDocument()

    // The community has lat: null, lng: null. But its next upcoming event (evt-4) is hosted at venue_id: "1" (Orcs Stories).
    // Orcs Stories has lat: 19.4165, lng: -99.1620.
    // So the map should render a marker at [19.4165, -99.1620] representing the community!
    const markers = screen.getAllByTestId('mock-marker-19.4165--99.162')
    expect(markers.length).toBe(2) // One for Orcs Stories, one for Club de Rol La Torre
  })

  it('excludes a community from the map if it has no upcoming events, but keeps it in the sidebar list', async () => {
    const activeCommunity = {
      id: '5',
      name: 'Club de Rol La Torre',
      lat: null,
      lng: null,
      type: 'comunidad',
      venue_tags: [],
      events: [{ id: 'evt-4', venue_id: '1', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() }]
    }
    const inactiveCommunity = {
      id: '6',
      name: 'Comunidad Inactiva',
      lat: null,
      lng: null,
      type: 'comunidad',
      venue_tags: [],
      events: []
    }
    const physicalStore = {
      id: '1',
      name: 'Orcs Stories',
      lat: 19.4165,
      lng: -99.1620,
      type: 'cafe',
      venue_tags: [],
      events: []
    }

    const customMockVenues = [physicalStore, activeCommunity, inactiveCommunity]
    
    const originalInstance = (global as any).mockSupabaseInstance
    ;(global as any).mockSupabaseInstance = {
      ...originalInstance,
      from: jest.fn().mockImplementation((table) => {
        if (table === 'venues') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            then: jest.fn((onFulfilled) => onFulfilled({ data: customMockVenues, error: null }))
          }
        }
        return originalInstance.from(table)
      })
    }

    render(<Home />)

    // Both should be in the sidebar
    expect(await screen.findByText('Club de Rol La Torre')).toBeInTheDocument()
    expect(screen.getByText('Comunidad Inactiva')).toBeInTheDocument()

    // Active community should have a marker at Orcs Stories' coordinates
    const activeMarkers = screen.getAllByTestId('mock-marker-19.4165--99.162')
    expect(activeMarkers.length).toBe(2) // One for Orcs Stories, one for active community

    // Inactive community has no events, so it should NOT have a marker.
    expect(screen.queryByTestId('mock-marker-null-null')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mock-marker-undefined-undefined')).not.toBeInTheDocument()

    // Restore original mock
    ;(global as any).mockSupabaseInstance = originalInstance
  })

  it('filters the list of venues and displays "Tiene [Juego]" badge when searching for a game', async () => {
    render(<Home />)
    const user = userEvent.setup()
    const searchInput = screen.getByPlaceholderText(/buscar locales/i)

    // Wait for initial venues to load
    await screen.findByText('Orcs Stories')

    // Type "Scythe" (a game in Orcs Stories)
    await user.type(searchInput, 'Scythe')

    // Only "Orcs Stories" should match
    expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
    expect(screen.queryByText('El Duende')).not.toBeInTheDocument()
    expect(screen.queryByText('Ravenfolks')).not.toBeInTheDocument()

    // It should display the "Ludoteca y Venta: Scythe" badge
    expect(screen.getByText('Ludoteca y Venta: Scythe')).toBeInTheDocument()
  })

  it('filters the list of venues when searching by game alternate names', async () => {
    render(<Home />)
    const user = userEvent.setup()
    const searchInput = screen.getByPlaceholderText(/buscar locales/i)

    // Wait for initial venues to load
    await screen.findByText('Orcs Stories')

    // Type "Colonos" (alternate name for Catan: "Catan, Los Colonos de Catan")
    await user.type(searchInput, 'Colonos')

    // Both "Orcs Stories" and "Ravenfolks" have Catan
    expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
    expect(screen.getByText('Ravenfolks')).toBeInTheDocument()
    expect(screen.queryByText('El Duende')).not.toBeInTheDocument()

    // It should display the correct badges based on venue types
    expect(screen.getByText('Ludoteca y Venta: Catan')).toBeInTheDocument()
    expect(screen.getByText('Para jugar: Catan')).toBeInTheDocument()
  })
})

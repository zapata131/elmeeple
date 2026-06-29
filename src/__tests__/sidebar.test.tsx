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
    expect(screen.getByRole('button', { name: /híbridos/i })).toBeInTheDocument()
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
    expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
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

    // Only "El Duende" should show up (type === 'tienda')
    expect(screen.getByText('El Duende')).toBeInTheDocument()
    expect(screen.queryByText('Orcs Stories')).not.toBeInTheDocument()
    expect(screen.queryByText('Ravenfolks')).not.toBeInTheDocument()

    // Click "Cafés" chip
    const cafesChip = screen.getByRole('button', { name: /cafés/i })
    await user.click(cafesChip)

    // Only "Ravenfolks" should show up (type === 'cafe')
    expect(screen.getByText('Ravenfolks')).toBeInTheDocument()
    expect(screen.queryByText('Orcs Stories')).not.toBeInTheDocument()
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
})

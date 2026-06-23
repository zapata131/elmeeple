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

  it('renders a scrollable list of matching venues', () => {
    render(<Home />)

    // Check the venue list container exists
    const venueList = screen.getByTestId('venue-list')
    expect(venueList).toBeInTheDocument()

    // Check default venues are rendered in the list
    expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
    expect(screen.getByText('El Duende')).toBeInTheDocument()
    expect(screen.getByText('Ravenfolks')).toBeInTheDocument()
  })

  it('filters the list of venues when typing in the search bar', async () => {
    render(<Home />)
    const user = userEvent.setup()
    const searchInput = screen.getByPlaceholderText(/buscar locales/i)

    // Type "Orcs" in search bar
    await user.type(searchInput, 'Orcs')

    // Only "Orcs Stories" should match
    expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
    expect(screen.queryByText('El Duende')).not.toBeInTheDocument()
    expect(screen.queryByText('Ravenfolks')).not.toBeInTheDocument()

    // Clear search and verify all show up again
    await user.clear(searchInput)
    expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
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
    expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
    expect(screen.getByText('El Duende')).toBeInTheDocument()
    expect(screen.getByText('Ravenfolks')).toBeInTheDocument()
  })

  it('selects a venue and opens its Quick View Card when clicking a venue card in the sidebar', async () => {
    render(<Home />)
    const user = userEvent.setup()

    // Find the venue card button or clickable card in the list
    const ravenfolksCard = screen.getByRole('button', { name: /seleccionar ravenfolks/i })
    await user.click(ravenfolksCard)

    // Verify Quick View Card is rendered with Ravenfolks details
    expect(screen.getByTestId('quick-view-card')).toBeInTheDocument()
    expect(screen.getAllByText('Ravenfolks')).toHaveLength(2) // One in list, one in Quick View Card (or similar)
  })
})

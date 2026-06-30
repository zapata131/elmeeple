import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '@/app/page'

// Mock next/dynamic to render the Map component synchronously in Jest
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

// Mock react-leaflet and expose markers for testing
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

describe('Global Game Search in Unified Smart Search', () => {
  it('filters venues correctly by game name and displays the game match badge', async () => {
    render(<Home />)
    const user = userEvent.setup()
    
    // Wait for the venues to render
    await screen.findByText('Orcs Stories')
    
    const searchInput = screen.getByPlaceholderText(/buscar locales/i)

    // Type a game name available only in "Orcs Stories" (Scythe)
    await user.type(searchInput, 'Scythe')

    // Only Orcs Stories has "Scythe" in the mock data catalog
    expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
    expect(screen.queryByText('El Duende')).not.toBeInTheDocument()
    expect(screen.queryByText('Ravenfolks')).not.toBeInTheDocument()

    // It must render the custom meeple game match badge (without raw emojis, e.g., "Ludoteca y Venta: Scythe")
    const matchBadge = screen.getByText(/ludoteca y venta: scythe/i)
    expect(matchBadge).toBeInTheDocument()
    expect(matchBadge.textContent).not.toMatch(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/) // Assert no emojis

    // Clear search and verify all venues show up again
    await user.clear(searchInput)
    expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
    expect(screen.getByText('El Duende')).toBeInTheDocument()
    expect(screen.getByText('Ravenfolks')).toBeInTheDocument()
    expect(screen.queryByText('Ludoteca y Venta: Scythe')).not.toBeInTheDocument()
  })

  it('filters venues by game alternate names in the unified search', async () => {
    render(<Home />)
    const user = userEvent.setup()
    
    await screen.findByText('Orcs Stories')
    
    const searchInput = screen.getByPlaceholderText(/buscar locales/i)

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

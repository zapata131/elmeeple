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
}))

describe('Global Game Search & Mode Toggle', () => {
  it('renders the search mode toggle with "Buscar Locales" and "Buscar Juegos"', async () => {
    render(<Home />)
    
    // Wait for the list to load
    await screen.findByText('Orcs Stories')

    // Verify search mode toggle options exist
    const venuesToggle = screen.getByRole('button', { name: /buscar locales/i })
    const gamesToggle = screen.getByRole('button', { name: /buscar juegos/i })
    
    expect(venuesToggle).toBeInTheDocument()
    expect(gamesToggle).toBeInTheDocument()
    
    // Default mode should be "Buscar Locales" (active class styling)
    expect(venuesToggle).toHaveClass('bg-[#8367C7]')
    expect(gamesToggle).not.toHaveClass('bg-[#8367C7]')
  })

  it('toggles search modes on click', async () => {
    render(<Home />)
    const user = userEvent.setup()
    
    await screen.findByText('Orcs Stories')

    const venuesToggle = screen.getByRole('button', { name: /buscar locales/i })
    const gamesToggle = screen.getByRole('button', { name: /buscar juegos/i })

    // Click "Buscar Juegos"
    await user.click(gamesToggle)
    expect(gamesToggle).toHaveClass('bg-[#8367C7]')
    expect(venuesToggle).not.toHaveClass('bg-[#8367C7]')

    // Click "Buscar Locales" back
    await user.click(venuesToggle)
    expect(venuesToggle).toHaveClass('bg-[#8367C7]')
    expect(gamesToggle).not.toHaveClass('bg-[#8367C7]')
  })

  it('filters venues correctly in "Buscar Juegos" mode and displays the game match badge', async () => {
    render(<Home />)
    const user = userEvent.setup()
    
    // Wait for the venues to render
    await screen.findByText('Orcs Stories')
    
    const searchInput = screen.getByPlaceholderText(/buscar locales/i)
    const gamesToggle = screen.getByRole('button', { name: /buscar juegos/i })

    // Switch to game search mode
    await user.click(gamesToggle)

    // Type a game name available only in "Orcs Stories" (Scythe)
    await user.type(searchInput, 'Scythe')

    // Only Orcs Stories has "Scythe" in the mock data catalog
    expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
    expect(screen.queryByText('El Duende')).not.toBeInTheDocument()
    expect(screen.queryByText('Ravenfolks')).not.toBeInTheDocument()

    // It must render the custom meeple game match badge (without raw emojis, e.g., "Tiene Scythe")
    const matchBadge = screen.getByText(/tiene scythe/i)
    expect(matchBadge).toBeInTheDocument()
    expect(matchBadge.textContent).not.toMatch(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/) // Assert no emojis

    // Clear search and verify all venues show up again
    await user.clear(searchInput)
    expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
    expect(screen.getByText('El Duende')).toBeInTheDocument()
    expect(screen.getByText('Ravenfolks')).toBeInTheDocument()
    expect(screen.queryByText(/tiene/i)).not.toBeInTheDocument()
  })

  it('does not filter by game name in "Buscar Locales" mode', async () => {
    render(<Home />)
    const user = userEvent.setup()
    
    await screen.findByText('Orcs Stories')
    
    const searchInput = screen.getByPlaceholderText(/buscar locales/i)
    const venuesToggle = screen.getByRole('button', { name: /buscar locales/i })

    // Verify we are in venues mode
    expect(venuesToggle).toHaveClass('bg-[#8367C7]')

    // Type "Scythe" (a game name). Since we are in venue search mode, this should NOT match game catalog names.
    await user.type(searchInput, 'Scythe')

    // None of the venues have "Scythe" in their venue name/address/tags, so nothing should match
    expect(screen.queryByText('Orcs Stories')).not.toBeInTheDocument()
    expect(screen.queryByText('El Duende')).not.toBeInTheDocument()
    expect(screen.queryByText('Ravenfolks')).not.toBeInTheDocument()
    expect(screen.getByText(/no se encontraron resultados/i)).toBeInTheDocument()
  })
})

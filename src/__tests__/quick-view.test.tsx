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
  Marker: ({ position, eventHandlers }: { position: [number, number]; eventHandlers?: { click?: () => void } }) => (
    <button
      data-testid={`mock-marker-${position[0]}-${position[1]}`}
      onClick={eventHandlers?.click}
      type="button"
    >
      Marker at {position[0]}, {position[1]}
    </button>
  ),
}))

describe('Quick View Card Integration', () => {
  it('does not display the Quick View Card by default', () => {
    render(<Home />)
    expect(screen.queryByTestId('quick-view-card')).not.toBeInTheDocument()
  })

  it('renders the markers on the map for the default venues in CDMX', () => {
    render(<Home />)
    // "Orcs Stories" (CDMX Roma Norte): 19.4165, -99.1620
    expect(screen.getByTestId('mock-marker-19.4165--99.162')).toBeInTheDocument()
    // "El Duende" (CDMX Coyoacán): 19.3750, -99.1780
    expect(screen.getByTestId('mock-marker-19.375--99.178')).toBeInTheDocument()
    // "Ravenfolks" (CDMX Roma Norte): 19.4184, -99.1627
    expect(screen.getByTestId('mock-marker-19.4184--99.1627')).toBeInTheDocument()
  })

  it('opens the Quick View Card with correct details when a marker is clicked', async () => {
    render(<Home />)
    const user = userEvent.setup()

    // Click the marker for "Orcs Stories"
    const orcsMarker = screen.getByTestId('mock-marker-19.4165--99.162')
    await user.click(orcsMarker)

    // Check that the card is now visible
    const card = screen.getByTestId('quick-view-card')
    expect(card).toBeInTheDocument()

    // Check that it contains the venue details
    expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
    expect(screen.getByText('Roma Norte, CDMX')).toBeInTheDocument()
    expect(screen.getByText('Mar - Dom: 14:00 - 22:00')).toBeInTheDocument()
    expect(screen.getByText('Híbrido (Café y Tienda)')).toBeInTheDocument()
    expect(screen.getByAltText('Logo Orcs Stories')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /visit-instagram/i })).toHaveAttribute('href', 'https://instagram.com/orcs_stories')
    expect(screen.getByRole('link', { name: /visit-discord/i })).toHaveAttribute('href', 'https://discord.gg/orcsstories')
    expect(screen.getByText('Eurogames')).toBeInTheDocument()
    expect(screen.getByText('TCGs')).toBeInTheDocument()
    expect(screen.getByText('Café')).toBeInTheDocument()
  })

  it('closes the Quick View Card when the close button is clicked', async () => {
    render(<Home />)
    const user = userEvent.setup()

    // Click the marker to open it
    const orcsMarker = screen.getByTestId('mock-marker-19.4165--99.162')
    await user.click(orcsMarker)
    expect(screen.getByTestId('quick-view-card')).toBeInTheDocument()

    // Click the close button
    const closeButton = screen.getByRole('button', { name: /close-card/i })
    await user.click(closeButton)

    // Check that the card is removed
    expect(screen.queryByTestId('quick-view-card')).not.toBeInTheDocument()
  })
})

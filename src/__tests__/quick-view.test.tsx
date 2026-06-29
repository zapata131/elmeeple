import { render, screen, within } from '@testing-library/react'
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

describe('Quick View Card Integration', () => {
  it('does not display the Quick View Card by default', () => {
    render(<Home />)
    expect(screen.queryByTestId('quick-view-card')).not.toBeInTheDocument()
  })

  it('renders the markers on the map for the default venues in CDMX', async () => {
    render(<Home />)
    // "Orcs Stories" (CDMX Roma Norte): 19.4165, -99.1620
    const orcsMarkers = await screen.findAllByTestId('mock-marker-19.4165--99.162')
    expect(orcsMarkers.length).toBeGreaterThan(0)
    // "El Duende" (CDMX Coyoacán): 19.3750, -99.1780
    expect(await screen.findByTestId('mock-marker-19.375--99.178')).toBeInTheDocument()
    // "Ravenfolks" (CDMX Roma Norte): 19.4184, -99.1627
    expect(await screen.findByTestId('mock-marker-19.4184--99.1627')).toBeInTheDocument()
  })

  it('opens the Quick View Card with correct details when a marker is clicked', async () => {
    render(<Home />)
    const user = userEvent.setup()

    // Click the marker for "Orcs Stories"
    const orcsMarkers = await screen.findAllByTestId('mock-marker-19.4165--99.162')
    await user.click(orcsMarkers[0])

    // Check that the card is now visible
    const card = screen.getByTestId('quick-view-card')
    expect(card).toBeInTheDocument()

    // Scope queries inside the Quick View Card to prevent conflicts with the sidebar
    const cardContent = within(card)

    // Check that it contains the venue details
    expect(cardContent.getByText('Orcs Stories')).toBeInTheDocument()
    expect(cardContent.getByText('Roma Norte, CDMX')).toBeInTheDocument()
    expect(cardContent.getByText('Mar - Dom: 14:00 - 22:00')).toBeInTheDocument()
    expect(cardContent.getByText('Café de juegos • Tienda de juegos y TCG')).toBeInTheDocument()
    expect(cardContent.getByAltText('Logo Orcs Stories')).toBeInTheDocument()
    expect(cardContent.getByRole('link', { name: /visit-instagram/i })).toHaveAttribute('href', 'https://instagram.com/orcs_stories')
    expect(cardContent.getByText('Eurogames')).toBeInTheDocument()
    expect(cardContent.getByText('TCGs')).toBeInTheDocument()
    expect(cardContent.getByText('Café')).toBeInTheDocument()
  })

  it('closes the Quick View Card when the close button is clicked', async () => {
    render(<Home />)
    const user = userEvent.setup()

    // Click the marker to open it
    const orcsMarkers = await screen.findAllByTestId('mock-marker-19.4165--99.162')
    await user.click(orcsMarkers[0])
    expect(await screen.findByTestId('quick-view-card')).toBeInTheDocument()

    // Click the close button
    const closeButton = screen.getByRole('button', { name: /close-card/i })
    await user.click(closeButton)

    // Check that the card is removed
    expect(screen.queryByTestId('quick-view-card')).not.toBeInTheDocument()
  })
})

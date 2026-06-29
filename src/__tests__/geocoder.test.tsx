import '@testing-library/jest-dom'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '@/app/page'
import LocationSearch from '@/components/LocationSearch'

// Share mock functions to inspect calls
const mockFlyTo = jest.fn()
const mockSetView = jest.fn()

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

const mockSuggestions = [
  {
    place_id: 1,
    display_name: 'Roma Norte, Ciudad de México, México',
    lat: '19.4150',
    lon: '-99.1650',
  },
  {
    place_id: 2,
    display_name: 'Roma Sur, Ciudad de México, México',
    lat: '19.3050',
    lon: '-99.1650',
  },
]

describe('Location Geocoder Component (Unit)', () => {
  let mockOnSelectLocation: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockOnSelectLocation = jest.fn()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders the location search input', () => {
    render(<LocationSearch onSelectLocation={mockOnSelectLocation} />)
    expect(screen.getByPlaceholderText(/buscar dirección o zona/i)).toBeInTheDocument()
  })

  it('queries Nominatim API and displays suggestions after debounce', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuggestions,
    })

    render(<LocationSearch onSelectLocation={mockOnSelectLocation} />)
    const input = screen.getByPlaceholderText(/buscar dirección o zona/i)

    await user.type(input, 'Roma')

    // Before debounce timer fires, fetch should not be called
    expect(global.fetch).not.toHaveBeenCalled()

    // Fast-forward debounce time (e.g. 500ms)
    act(() => {
      jest.advanceTimersByTime(500)
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://nominatim.openstreetmap.org/search')
      )
    })

    // Suggestions should be rendered
    const suggestion1 = await screen.findByText('Roma Norte, Ciudad de México, México')
    const suggestion2 = await screen.findByText('Roma Sur, Ciudad de México, México')
    expect(suggestion1).toBeInTheDocument()
    expect(suggestion2).toBeInTheDocument()
  })

  it('triggers onSelectLocation when a suggestion is clicked and clears suggestions', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuggestions,
    })

    render(<LocationSearch onSelectLocation={mockOnSelectLocation} />)
    const input = screen.getByPlaceholderText(/buscar dirección o zona/i)

    await user.type(input, 'Roma')
    act(() => {
      jest.advanceTimersByTime(500)
    })

    const suggestion1 = await screen.findByText('Roma Norte, Ciudad de México, México')
    await user.click(suggestion1)

    // Verify callback was called with correct coordinates and display name
    expect(mockOnSelectLocation).toHaveBeenCalledWith(19.4150, -99.1650, 'Roma Norte, Ciudad de México, México')

    // Suggestions should be cleared
    expect(screen.queryByText('Roma Norte, Ciudad de México, México')).not.toBeInTheDocument()
  })

  it('does not query if search term is less than 3 characters', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<LocationSearch onSelectLocation={mockOnSelectLocation} />)
    const input = screen.getByPlaceholderText(/buscar dirección o zona/i)

    await user.type(input, 'Ro')
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(global.fetch).not.toHaveBeenCalled()
  })
})

describe('Homepage Location Search Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders the Location Search input inside the Left Sidebar', () => {
    render(<Home />)
    const input = screen.getByPlaceholderText(/buscar dirección o zona/i)
    expect(input).toBeInTheDocument()
    // It should be within the sidebar layout
    const sidebar = screen.getByTestId('venue-list').parentElement
    expect(sidebar).toContainElement(input)
  })

  it('integrates with the map to flyTo the searched location when clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuggestions,
    })

    render(<Home />)
    const input = screen.getByPlaceholderText(/buscar dirección o zona/i)

    await user.type(input, 'Roma')
    act(() => {
      jest.advanceTimersByTime(500)
    })

    const suggestion1 = await screen.findByText('Roma Norte, Ciudad de México, México')
    await user.click(suggestion1)

    // The Map component's controller should listen to mapCenter changes and trigger map.flyTo()
    expect(mockFlyTo).toHaveBeenCalledWith([19.4150, -99.1650], 13, {
      animate: true,
      duration: 1.5,
    })
  })
})

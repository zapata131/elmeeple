import { render, screen } from '@testing-library/react'
import Home from '@/app/page'
import Map from '@/components/Map'

// Mock react-leaflet so that it doesn't break in JSDOM
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="mock-tile-layer" />,
  ZoomControl: () => <div data-testid="mock-zoom-control" />,
  Marker: () => <div data-testid="mock-marker" />,
}))

describe('Map Component', () => {
  it('renders the map container and tile layer', () => {
    render(<Map />)
    expect(screen.getByTestId('mock-map-container')).toBeInTheDocument()
    expect(screen.getByTestId('mock-tile-layer')).toBeInTheDocument()
  })
})

describe('Home Page with Map Integration', () => {
  it('renders the Map component on the home page', () => {
    render(<Home />)
    expect(screen.getByTestId('mock-map-container')).toBeInTheDocument()
  })

  it('renders the floating brand card with El Meeple and tagline', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: /El Meeple/i })).toBeInTheDocument()
    expect(screen.getByText(/¿Dónde jugamos hoy\?/i)).toBeInTheDocument()
  })
})

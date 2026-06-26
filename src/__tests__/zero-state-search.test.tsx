import React from 'react'
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

describe('Zero State Search Card', () => {
  it('displays the interactive zero-state overlay card when search has empty results', async () => {
    render(<Home />)
    const user = userEvent.setup()

    // Wait for the venues list to load
    await screen.findByText('Orcs Stories')

    const searchInput = screen.getByPlaceholderText(/buscar locales/i)
    
    // Search for a non-existent game/venue
    await user.type(searchInput, 'NonExistentGame123')

    // Verify zero-state card is rendered in the sidebar or venue-list container
    const zeroStateCard = screen.getByTestId('zero-state-search')
    expect(zeroStateCard).toBeInTheDocument()

    // Assert that no emojis are used in the text
    expect(zeroStateCard.textContent).not.toMatch(/🔍|🧐|❌|⚠️|🤷/)

    // Assert key message content
    expect(screen.getByText(/no se encontraron resultados/i)).toBeInTheDocument()
    expect(screen.getByText(/intenta limpiar tus filtros/i)).toBeInTheDocument()

    // Assert active interactive elements
    const clearButton = screen.getByRole('button', { name: /limpiar filtros/i })
    expect(clearButton).toBeInTheDocument()

    // Click clear filters button
    await user.click(clearButton)

    // Verify search input is cleared and all default venues are restored
    expect(searchInput).toHaveValue('')
    expect(screen.getByText('Orcs Stories')).toBeInTheDocument()
    expect(screen.getByText('El Duende')).toBeInTheDocument()
    expect(screen.getByText('Ravenfolks')).toBeInTheDocument()
  })
})

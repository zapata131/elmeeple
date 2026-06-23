import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OnboardingPage from '@/app/onboarding/page'
import React from 'react'

// Override next/dynamic to render OnboardingMap synchronously in Jest
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const OnboardingMap = require('../components/OnboardingMap').default
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function MockDynamicOnboardingMap(props: any) {
      return <OnboardingMap {...props} />
    }
  },
}))

// Mock react-leaflet hooks and components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="mock-tile-layer" />,
  Marker: ({ position }: { position: [number, number] }) => (
    <div data-testid={`mock-marker-${position[0]}-${position[1]}`} />
  ),
  useMap: () => ({
    setView: jest.fn(),
    getZoom: jest.fn().mockReturnValue(12)
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useMapEvents: (events: { click?: (e: any) => void }) => {
    React.useEffect(() => {
      if (events.click) {
        // Expose a global helper to trigger map clicks in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(globalThis as any).triggerMapClick = (lat: number, lng: number) => {
          events.click!({ latlng: { lat, lng } })
        }
      }
    }, [events])
    return null
  }
}))

// Mock server action
const mockCreateVenue = jest.fn().mockResolvedValue({
  success: true,
  venueId: 'mock-123'
})

jest.mock('../app/actions/venue', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createVenue: (data: any) => mockCreateVenue(data)
}))

// Mock Geolocation and Fetch APIs
const mockGetCurrentPosition = jest.fn().mockImplementation((success) =>
  success({
    coords: {
      latitude: 19.4155,
      longitude: -99.1622
    }
  })
)

const mockFetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve([
    { lat: '19.412300', lon: '-99.165400', display_name: 'Chihuahua 142, Roma Nte., CDMX' }
  ])
})

describe('Enhanced Owner Onboarding Flow', () => {
  beforeEach(() => {
    mockCreateVenue.mockClear()
    mockGetCurrentPosition.mockClear()
    mockFetch.mockClear()
    
    // Setup globals
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: mockGetCurrentPosition
      },
      writable: true,
      configurable: true
    })
    global.fetch = mockFetch
  })

  it('renders Step 1 (Owner Account) initially', () => {
    render(<OnboardingPage />)
    
    expect(screen.getByRole('heading', { name: /Paso 1: Tu Cuenta/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Nombre del Propietario/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Siguiente/i })).toBeInTheDocument()
  })

  it('navigates step-by-step through the onboarding flow and submits successfully', async () => {
    render(<OnboardingPage />)
    const user = userEvent.setup()

    // --- STEP 1: Owner Details ---
    await user.type(screen.getByLabelText(/Nombre del Propietario/i), 'Jose Zapata')
    await user.type(screen.getByLabelText(/Correo Electrónico/i), 'jose@elmeeple.com')
    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // --- STEP 2: Venue Details ---
    expect(screen.getByRole('heading', { name: /Paso 2: Datos del Local/i })).toBeInTheDocument()
    await user.type(screen.getByLabelText(/Nombre del Local/i), 'Meeple Oasis CDMX')
    await user.type(screen.getByLabelText(/Descripción/i), 'Un oasis de juegos de mesa en la Roma.')
    
    // Select Venue Type
    const typeSelect = screen.getByLabelText(/Tipo de Local/i)
    await user.selectOptions(typeSelect, 'hibrido')

    // Set Social Links and Logo
    await user.type(screen.getByLabelText(/Usuario de Instagram/i), 'meeple_oasis')
    await user.type(screen.getByLabelText(/Enlace de Discord/i), 'https://discord.gg/meepleoasis')
    await user.type(screen.getByLabelText(/URL del Logo/i), 'https://elmeeple.com/logo-oasis.png')

    // Set Structured Schedule (e.g. open Tue & Wed 14:00 - 22:00, others closed)
    const tueCheckbox = screen.getByLabelText(/Martes/i)
    await user.click(tueCheckbox)
    const tueOpen = screen.getByLabelText(/tue-open/i)
    const tueClose = screen.getByLabelText(/tue-close/i)
    fireEvent.change(tueOpen, { target: { value: '14:00' } })
    fireEvent.change(tueClose, { target: { value: '22:00' } })

    const wedCheckbox = screen.getByLabelText(/Miércoles/i)
    await user.click(wedCheckbox)
    const wedOpen = screen.getByLabelText(/wed-open/i)
    const wedClose = screen.getByLabelText(/wed-close/i)
    fireEvent.change(wedOpen, { target: { value: '14:00' } })
    fireEvent.change(wedClose, { target: { value: '22:00' } })

    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // --- STEP 3: Map Location Pin ---
    expect(screen.getByRole('heading', { name: /Paso 3: Ubicar en el Mapa/i })).toBeInTheDocument()
    expect(screen.getByTestId('mock-map-container')).toBeInTheDocument()

    const latInput = screen.getByLabelText(/Latitud/i) as HTMLInputElement
    const lngInput = screen.getByLabelText(/Longitud/i) as HTMLInputElement
    expect(latInput.value).toBe('')
    expect(lngInput.value).toBe('')

    // Test Geolocation Button
    const geoBtn = screen.getByRole('button', { name: /📍 Usar mi ubicación/i })
    await user.click(geoBtn)
    expect(mockGetCurrentPosition).toHaveBeenCalled()
    expect(latInput.value).toBe('19.4155')
    expect(lngInput.value).toBe('-99.1622')

    // Test Address Search
    const searchInput = screen.getByPlaceholderText(/Escribe una dirección/i)
    await user.type(searchInput, 'Chihuahua 142, Roma Nte')
    const searchBtn = screen.getByRole('button', { name: /Buscar/i })
    await user.click(searchBtn)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('nominatim.openstreetmap.org/search?format=json&q=Chihuahua%20142%2C%20Roma%20Nte')
    )
    // Should update inputs to search result coords
    expect(latInput.value).toBe('19.4123')
    expect(lngInput.value).toBe('-99.1654')

    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // --- STEP 4: Specialties/Tags ---
    expect(screen.getByRole('heading', { name: /Paso 4: Especialidades/i })).toBeInTheDocument()
    
    // Select Eurogames and TCGs tags
    const euroCheckbox = screen.getByLabelText(/Eurogames/i)
    const tcgCheckbox = screen.getByLabelText(/TCGs/i)
    await user.click(euroCheckbox)
    await user.click(tcgCheckbox)

    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // --- STEP 5: Summary & Submit ---
    expect(screen.getByRole('heading', { name: /Paso 5: Confirmar Datos/i })).toBeInTheDocument()
    
    // Check that entered details are displayed in summary
    expect(screen.getByText('Jose Zapata')).toBeInTheDocument()
    expect(screen.getByText('jose@elmeeple.com')).toBeInTheDocument()
    expect(screen.getByText('Meeple Oasis CDMX')).toBeInTheDocument()
    expect(screen.getByText('Híbrido (Café y Tienda)')).toBeInTheDocument()
    expect(screen.getByText(/meeple_oasis/i)).toBeInTheDocument()
    expect(screen.getByText(/discord.gg\/meepleoasis/i)).toBeInTheDocument()
    expect(screen.getByText(/Mar - Mié: 14:00 - 22:00/i)).toBeInTheDocument()
    expect(screen.getByText(/19.4123/)).toBeInTheDocument()
    expect(screen.getByText(/-99.1654/)).toBeInTheDocument()
    expect(screen.getByText('Eurogames')).toBeInTheDocument()
    expect(screen.getByText('TCGs')).toBeInTheDocument()

    // Click submit
    const submitBtn = screen.getByRole('button', { name: /Confirmar y Registrar/i })
    await user.click(submitBtn)

    // Verify server action was called with correct data structure
    expect(mockCreateVenue).toHaveBeenCalledWith({
      ownerName: 'Jose Zapata',
      ownerEmail: 'jose@elmeeple.com',
      name: 'Meeple Oasis CDMX',
      description: 'Un oasis de juegos de mesa en la Roma.',
      type: 'hibrido',
      instagram: 'meeple_oasis',
      discord: 'https://discord.gg/meepleoasis',
      logoUrl: 'https://elmeeple.com/logo-oasis.png',
      schedule: {
        mon: null,
        tue: { open: '14:00', close: '22:00' },
        wed: { open: '14:00', close: '22:00' },
        thu: null,
        fri: null,
        sat: null,
        sun: null
      },
      lat: 19.4123,
      lng: -99.1654,
      tags: ['Eurogames', 'TCGs']
    })

    // Verify success state renders
    expect(screen.getByText(/¡Registro Completado con Éxito!/i)).toBeInTheDocument()
  })
})

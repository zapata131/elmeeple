import { render, screen, act } from '@testing-library/react'
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

describe('Owner Onboarding Flow', () => {
  beforeEach(() => {
    mockCreateVenue.mockClear()
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
    await user.type(screen.getByLabelText(/Horario de Servicio/i), 'Mar - Dom: 13:00 - 22:00')
    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // --- STEP 3: Map Location Pin ---
    expect(screen.getByRole('heading', { name: /Paso 3: Ubicar en el Mapa/i })).toBeInTheDocument()
    expect(screen.getByTestId('mock-map-container')).toBeInTheDocument()

    // Inputs should be initially empty
    const latInput = screen.getByLabelText(/Latitud/i) as HTMLInputElement
    const lngInput = screen.getByLabelText(/Longitud/i) as HTMLInputElement
    expect(latInput.value).toBe('')
    expect(lngInput.value).toBe('')

    // Simulate clicking the map at CDMX coordinates inside act() to flush updates
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(globalThis as any).triggerMapClick(19.4123, -99.1654)
    })

    // Coordinates inputs should update
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
    expect(screen.getByText(/Mar - Dom: 13:00 - 22:00/i)).toBeInTheDocument()
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
      schedule: 'Mar - Dom: 13:00 - 22:00',
      lat: 19.4123,
      lng: -99.1654,
      tags: ['Eurogames', 'TCGs']
    })

    // Verify success state renders
    expect(screen.getByText(/¡Registro Completado con Éxito!/i)).toBeInTheDocument()
    expect(screen.getByText(/Tu local está en espera de aprobación/i)).toBeInTheDocument()
  })

  it('allows user to navigate back to previous steps and retain form state', async () => {
    render(<OnboardingPage />)
    const user = userEvent.setup()

    // Step 1 -> fill -> Next
    await user.type(screen.getByLabelText(/Nombre del Propietario/i), 'Jose Zapata')
    await user.type(screen.getByLabelText(/Correo Electrónico/i), 'jose@elmeeple.com')
    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 2 -> check Back
    expect(screen.getByRole('heading', { name: /Paso 2: Datos del Local/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Atrás/i }))

    // Verify we are back to Step 1 and data is retained
    expect(screen.getByRole('heading', { name: /Paso 1: Tu Cuenta/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Nombre del Propietario/i)).toHaveValue('Jose Zapata')
    expect(screen.getByLabelText(/Correo Electrónico/i)).toHaveValue('jose@elmeeple.com')
  })
})

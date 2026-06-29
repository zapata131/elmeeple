import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OnboardingPage from '@/app/onboarding/page'
import React from 'react'
import { useSession } from 'next-auth/react'

const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: jest.fn()
  }),
  usePathname: () => '/'
}))

// Mock Leaflet and map events since they rely on browser window APIs
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

describe('Optimized 5-Step Owner Onboarding Flow', () => {
  beforeAll(() => {
    // Mock FileReader prototype for JSDOM
    const mockFileReader = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readAsDataURL: jest.fn().mockImplementation(function(this: any) {
        if (this.onload) {
          this.onload({ target: { result: 'data:image/jpeg;base64,mockcroppedlogo' } })
        }
      })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader as any)

    // Mock Image prototype in JSDOM to trigger onload instantly
    Object.defineProperty(global.Image.prototype, 'src', {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      set(_src) {
        if (this.onload) {
          setTimeout(() => this.onload(), 0)
        }
      }
    })

    // Mock Canvas creation to prevent DOM exceptions in JSDOM
    const originalCreateElement = document.createElement.bind(document)
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: () => ({
            drawImage: jest.fn()
          }),
          toDataURL: () => 'data:image/jpeg;base64,mockcroppedlogo'
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
      }
      return originalCreateElement(tagName)
    })
  })

  beforeEach(() => {
    mockCreateVenue.mockClear()
    mockGetCurrentPosition.mockClear()
    mockFetch.mockClear()
    mockPush.mockClear()
    mockReplace.mockClear()
    
    // Reset useSession mock to authenticated for each test by default
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: 'Jose Zapata',
          email: 'jose@elmeeple.com',
          role: 'partner'
        }
      },
      status: 'authenticated'
    })
    
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

  it('renders Step 1 (Datos del local) with collapsible session details banner and store inputs initially', async () => {
    render(<OnboardingPage />)
    const user = userEvent.setup()
    
    // Step heading (Sentence Case)
    expect(screen.getByRole('heading', { name: /Paso 1: datos del local/i })).toBeInTheDocument()
    
    // Session Banner elements
    expect(screen.getByText('Jose Zapata')).toBeInTheDocument()
    expect(screen.getByText('jose@elmeeple.com')).toBeInTheDocument()
    expect(screen.getByText('Cuenta vinculada')).toBeInTheDocument()
    
    // Check collapsible banner functionality
    const toggleBannerBtn = screen.getByRole('button', { name: /ocultar datos/i })
    expect(toggleBannerBtn).toBeInTheDocument()
    
    // Collapse
    await user.click(toggleBannerBtn)
    expect(screen.queryByText('Jose Zapata')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mostrar datos/i })).toBeInTheDocument()
    
    // Expand
    await user.click(screen.getByRole('button', { name: /mostrar datos/i }))
    expect(screen.getByText('Jose Zapata')).toBeInTheDocument()

    // Store Inputs should be present in Step 1
    expect(screen.getByLabelText(/Nombre del local/i)).toBeInTheDocument()
    expect(screen.getByText(/Tipo de local/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Usuario de Instagram/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Subir imagen de logo/i)).toBeInTheDocument()
  })

  it('navigates step-by-step through the 5-step funnel, allows editing from summary, and submits successfully', async () => {
    render(<OnboardingPage />)
    const user = userEvent.setup()

    // --- STEP 1: Datos del local ---
    expect(screen.getByRole('heading', { name: /Paso 1: datos del local/i })).toBeInTheDocument()
    await user.type(screen.getByLabelText(/Nombre del local/i), 'Meeple Oasis CDMX')
    await user.type(screen.getByLabelText(/Descripción/i), 'Un oasis de juegos de mesa en la Roma.')
    
    // Select Venue Type (Café is checked by default, so we also check Tienda to select both)
    await user.click(screen.getByLabelText(/Tienda de juegos y TCG/i))

    // Set Social Links
    await user.type(screen.getByLabelText(/Usuario de Instagram/i), 'meeple_oasis')

    // Upload Logo and check humanized status copy
    const file = new File(['logo-content'], 'logo-oasis.png', { type: 'image/png' })
    const fileInput = screen.getByLabelText(/Subir imagen de logo/i)
    await user.upload(fileInput, file)
    await screen.findByText(/¡Tu logo se ve genial! Se ha ajustado automáticamente para lucir perfecto/i)

    // Select Tuesday as active day
    const tueCheckbox = screen.getByLabelText(/Martes/i)
    await user.click(tueCheckbox)
    
    const nextBtn = screen.getByRole('button', { name: /Siguiente/i })
    await user.click(nextBtn)

    // --- STEP 2: Ubicar en el mapa ---
    expect(screen.getByRole('heading', { name: /Paso 2: ubicar en el mapa/i })).toBeInTheDocument()
    
    // GPS Geolocation
    const geoBtn = screen.getByRole('button', { name: /Usar mi ubicación actual/i })
    await user.click(geoBtn)
    
    const latInput = screen.getByLabelText(/Latitud/i) as HTMLInputElement
    const lngInput = screen.getByLabelText(/Longitud/i) as HTMLInputElement
    expect(latInput.value).toBe('19.4155')
    expect(lngInput.value).toBe('-99.1622')

    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // --- STEP 3: Especialidades ---
    expect(screen.getByRole('heading', { name: /Paso 3: especialidades/i })).toBeInTheDocument()
    const tagEuro = screen.getByLabelText(/Eurogames/i)
    await user.click(tagEuro)

    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // --- STEP 4: Confirmar datos (Summary) ---
    expect(screen.getByRole('heading', { name: /Paso 4: confirmar datos/i })).toBeInTheDocument()
    
    // Verify details are rendered
    expect(screen.getByText('Meeple Oasis CDMX')).toBeInTheDocument()
    expect(screen.getByText(/Café de juegos/i)).toBeInTheDocument()
    expect(screen.getByText(/Tienda de juegos/i)).toBeInTheDocument()
    expect(screen.getByText('19.4155, -99.1622')).toBeInTheDocument()
    expect(screen.getByText('Eurogames')).toBeInTheDocument()

    // Test Jump-to-Edit: Click [Editar] for "Ubicación en el mapa"
    const editMapBtn = screen.getByTestId('edit-step-2')
    await user.click(editMapBtn)
    
    // Should immediately go back to Step 2
    expect(screen.getByRole('heading', { name: /Paso 2: ubicar en el mapa/i })).toBeInTheDocument()
    
    // Navigate forward to Step 4 again
    await user.click(screen.getByRole('button', { name: /Siguiente/i })) // Step 2 -> 3
    await user.click(screen.getByRole('button', { name: /Siguiente/i })) // Step 3 -> 4
    
    expect(screen.getByRole('heading', { name: /Paso 4: confirmar datos/i })).toBeInTheDocument()

    // Click Siguiente on Summary to go to Step 5
    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // --- STEP 5: Verificación de propiedad ---
    expect(screen.getByRole('heading', { name: /Paso 5: verificación de propiedad/i })).toBeInTheDocument()
    
    await user.type(screen.getByLabelText(/Identificación fiscal/i), 'RFC-ZAPJ900101-1A1')
    
    // Type optional comment for reviewer
    await user.type(screen.getByLabelText(/Comentarios para el revisor/i), 'Comprobante temporal, el definitivo se emite el lunes.')

    const permitFile = new File(['permit-content'], 'permit.png', { type: 'image/png' })
    const permitInput = screen.getByLabelText(/Permiso de operación/i)
    await user.upload(permitInput, permitFile)

    // Check humanized status copy for operating permit
    await screen.findByText(/¡Permiso cargado correctamente! Lo hemos optimizado para que el equipo lo revise/i)

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Confirmar y Registrar/i })
    await user.click(submitBtn)

    // Verify server action was called
    expect(mockCreateVenue).toHaveBeenCalledWith(expect.objectContaining({
      ownerName: 'Jose Zapata',
      ownerEmail: 'jose@elmeeple.com',
      name: 'Meeple Oasis CDMX',
      businessTaxId: 'RFC-ZAPJ900101-1A1',
      verificationProof: 'data:image/jpeg;base64,mockcroppedlogo',
      tags: ['Eurogames'],
      reviewerComment: 'Comprobante temporal, el definitivo se emite el lunes.'
    }))

    // Success screen
    expect(screen.getByRole('heading', { name: /¡Registro completado con éxito!/i })).toBeInTheDocument()
  })

  it('allows a pure community to complete onboarding without specifying a map location', async () => {
    render(<OnboardingPage />)
    const user = userEvent.setup()

    // --- STEP 1: Datos del local ---
    expect(screen.getByRole('heading', { name: /Paso 1: datos del local/i })).toBeInTheDocument()
    await user.type(screen.getByLabelText(/Nombre del local/i), 'Club de Rol La Torre')
    await user.type(screen.getByLabelText(/Descripción/i), 'Comunidad de rol.')
    
    // Select Comunidad
    await user.click(screen.getByLabelText(/Café de juegos/i)) // Uncheck Café
    await user.click(screen.getByLabelText(/Club y comunidad/i)) // Check Comunidad

    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // --- STEP 2: Ubicar en el mapa ---
    expect(screen.getByRole('heading', { name: /Paso 2: ubicar en el mapa/i })).toBeInTheDocument()
    
    // Since it's a pure community, the coordinates are optional. The "Siguiente" button should NOT be disabled.
    const nextBtnStep2 = screen.getByRole('button', { name: /Siguiente/i })
    expect(nextBtnStep2).not.toBeDisabled()
    await user.click(nextBtnStep2)

    // --- STEP 3: Especialidades ---
    expect(screen.getByRole('heading', { name: /Paso 3: especialidades/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // --- STEP 4: Confirmar datos (Summary) ---
    expect(screen.getByRole('heading', { name: /Paso 4: confirmar datos/i })).toBeInTheDocument()
    expect(screen.getByText('Ubicación en el mapa')).toBeInTheDocument()
    expect(screen.getByText('Ubicación variable (Comunidad)')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // --- STEP 5: Verificación de propiedad ---
    expect(screen.getByRole('heading', { name: /Paso 5: verificación de propiedad/i })).toBeInTheDocument()
    await user.type(screen.getByLabelText(/Identificación fiscal/i), 'RFC-TORRE-123')
    
    const permitFile = new File(['permit-content'], 'permit.png', { type: 'image/png' })
    const permitInput = screen.getByLabelText(/Permiso de operación/i)
    await user.upload(permitInput, permitFile)

    const submitBtn = screen.getByRole('button', { name: /Confirmar y Registrar/i })
    await user.click(submitBtn)

    // Verify server action was called with undefined lat/lng
    expect(mockCreateVenue).toHaveBeenCalledWith(expect.objectContaining({
      ownerName: 'Jose Zapata',
      ownerEmail: 'jose@elmeeple.com',
      name: 'Club de Rol La Torre',
      type: 'comunidad',
      lat: undefined,
      lng: undefined
    }))
  })

  it('redirects to login page if the user is unauthenticated', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    })

    render(<OnboardingPage />)
    expect(mockReplace).toHaveBeenCalledWith('/login?callbackUrl=/onboarding')
  })
})

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// 1. Mock React Leaflet and Map components
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
  useMapEvents: () => null
}))

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
}))

// 2. Mock Server Actions for UI tests
const mockCreateVenue = jest.fn()
jest.mock('../app/actions/venue', () => ({
  createVenue: (data: any) => mockCreateVenue(data)
}))

const mockApproveVenue = jest.fn().mockResolvedValue({ success: true })
const mockRejectVenue = jest.fn().mockResolvedValue({ success: true })
jest.mock('../app/actions/admin', () => ({
  approveVenue: (id: string) => mockApproveVenue(id),
  rejectVenue: (id: string, reason: string) => mockRejectVenue(id, reason)
}))

// Mock Supabase Server Client for Server Actions Unit Tests
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
};

(global as any).mockSupabaseClient = mockSupabaseClient;

jest.mock('../utils/supabase/server', () => ({
  createClient: jest.fn().mockImplementation(() => Promise.resolve((global as any).mockSupabaseClient))
}))

// Import components and actions
import OnboardingPage from '@/app/onboarding/page'
import OwnerDashboard from '@/app/dashboard/page'
import PlatformAdminDashboard from '@/app/admin/page'

// Mock Geolocation API
const mockGetCurrentPosition = jest.fn().mockImplementation((success) =>
  success({
    coords: {
      latitude: 19.4155,
      longitude: -99.1622
    }
  })
)

describe('Owner Onboarding - Step 6 Ownership Verification', () => {
  beforeAll(() => {
    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn().mockImplementation(function(this: any) {
        if (this.onload) {
          this.onload({ target: { result: 'data:image/jpeg;base64,mockpermitbase64image' } })
        }
      })
    }
    jest.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader as any)

    // Mock Image
    Object.defineProperty(global.Image.prototype, 'src', {
      set(src) {
        if (this.onload) {
          setTimeout(() => this.onload(), 0)
        }
      }
    })

    // Mock Canvas for compression
    const originalCreateElement = document.createElement.bind(document)
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: () => ({
            drawImage: jest.fn()
          }),
          toDataURL: () => 'data:image/jpeg;base64,mockpermitbase64image'
        } as any
      }
      return originalCreateElement(tagName)
    })
  })

  beforeEach(() => {
    mockCreateVenue.mockClear()
    mockCreateVenue.mockResolvedValue({ success: true, venueId: 'mock-venue-123' })

    // Setup navigator.geolocation
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: mockGetCurrentPosition
      },
      writable: true,
      configurable: true
    })
  })

  it('navigates to step 6, renders Tax ID and file upload inputs, validates them, and submits successfully', async () => {
    render(<OnboardingPage />)
    const user = userEvent.setup()

    // Step 1 -> Step 2
    await user.type(screen.getByLabelText(/Nombre del Propietario/i), 'Jose Zapata')
    await user.type(screen.getByLabelText(/Correo Electrónico/i), 'jose@elmeeple.com')
    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 2 -> Step 3
    await user.type(screen.getByLabelText(/Nombre del Local/i), 'Meeple Oasis CDMX')
    await user.type(screen.getByLabelText(/Descripción/i), 'Un oasis de juegos de mesa en la Roma.')
    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 3 -> Step 4
    const gpsBtn = screen.getByRole('button', { name: /Usar mi ubicación/i })
    await user.click(gpsBtn)
    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 4 -> Step 5
    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 5 -> Step 6 (Summary page has next button)
    expect(screen.getByRole('heading', { name: /Paso 5: Confirmar Datos/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 6: Ownership Verification
    expect(screen.getByRole('heading', { name: /Paso 6: Verificación de Propiedad/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Identificación Fiscal/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Permiso de Operación/i)).toBeInTheDocument()

    // Fill Tax ID and upload file
    await user.type(screen.getByLabelText(/Identificación Fiscal/i), 'RFC-ZAPJ900101-1A1')
    
    const file = new File(['permit-content'], 'permit.png', { type: 'image/png' })
    const fileInput = screen.getByLabelText(/Permiso de Operación/i)
    await user.upload(fileInput, file)

    await screen.findByText(/Documento cargado y comprimido/i)

    // Click final submit
    const submitBtn = screen.getByRole('button', { name: /Confirmar y Registrar/i })
    await user.click(submitBtn)

    expect(mockCreateVenue).toHaveBeenCalledWith(expect.objectContaining({
      ownerName: 'Jose Zapata',
      ownerEmail: 'jose@elmeeple.com',
      name: 'Meeple Oasis CDMX',
      businessTaxId: 'RFC-ZAPJ900101-1A1',
      verificationProof: 'data:image/jpeg;base64,mockpermitbase64image'
    }))
  })
})

describe('Owner Dashboard (/dashboard)', () => {
  const mockOwnerVenues = [
    {
      id: 'venue-1',
      name: 'Meeple Oasis Roma',
      verification_status: 'approved',
      business_tax_id: 'RFC-111',
      verified: true
    },
    {
      id: 'venue-2',
      name: 'Meeple Oasis Condesa',
      verification_status: 'pending',
      business_tax_id: 'RFC-222',
      verified: false
    },
    {
      id: 'venue-3',
      name: 'Meeple Oasis Centro',
      verification_status: 'rejected',
      rejection_reason: 'Documentación ilegible',
      business_tax_id: 'RFC-333',
      verified: false
    }
  ]

  it('renders owner profile, quick action button, and list of venues with status badges', async () => {
    mockSupabaseClient.from.mockReturnThis()
    mockSupabaseClient.select.mockReturnThis()
    mockSupabaseClient.eq.mockResolvedValue({
      data: mockOwnerVenues,
      error: null
    })

    // Await the Server Component as a function to resolve async data fetching
    const dashboardJSX = await OwnerDashboard({ searchParams: { email: 'jose@elmeeple.com' } })
    render(dashboardJSX)

    // Verify profile section
    expect(screen.getByText(/jose@elmeeple.com/i)).toBeInTheDocument()
    expect(screen.getByText(/Portal del Propietario/i)).toBeInTheDocument()

    // Verify quick action button
    expect(screen.getByRole('link', { name: /Registrar Nuevo Local/i })).toBeInTheDocument()

    // Verify list of locales
    expect(screen.getByText('Meeple Oasis Roma')).toBeInTheDocument()
    expect(screen.getByText('Meeple Oasis Condesa')).toBeInTheDocument()
    expect(screen.getByText('Meeple Oasis Centro')).toBeInTheDocument()

    // Verify status badges
    expect(screen.getByText('Aprobado')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText('Rechazado')).toBeInTheDocument()
    expect(screen.getByText(/Motivo: Documentación ilegible/i)).toBeInTheDocument()
  })
})

describe('Platform Admin Dashboard (/admin)', () => {
  const mockPendingVenues = [
    {
      id: 'pending-1',
      name: 'Ludoteca Secreta',
      owner_name: 'Ana Gómez',
      owner_email: 'ana@ludoteca.com',
      business_tax_id: 'RFC-ANA90',
      verification_proof: 'data:image/jpeg;base64,pendingpermitimage1',
      verification_status: 'pending'
    }
  ]

  beforeEach(() => {
    mockApproveVenue.mockClear()
    mockRejectVenue.mockClear()
  })

  it('renders stats, audit table of pending venues, permit details modal, and actions', async () => {
    mockSupabaseClient.from.mockReturnThis()
    mockSupabaseClient.select.mockResolvedValue({
      data: mockPendingVenues,
      error: null
    })

    // Await the Server Component as a function to resolve async data fetching
    const adminJSX = await PlatformAdminDashboard()
    render(adminJSX)

    // Verify stats
    expect(screen.getByText(/Panel de Control/i)).toBeInTheDocument()

    
    // Verify audit table shows the pending venue
    expect(screen.getByText('Ludoteca Secreta')).toBeInTheDocument()
    expect(screen.getByText('Ana Gómez')).toBeInTheDocument()
    expect(screen.getByText('RFC-ANA90')).toBeInTheDocument()

    // Click on "Ver Detalles" to open modal
    const detailsBtn = screen.getByRole('button', { name: /Ver Detalles/i })
    await fireEvent.click(detailsBtn)

    // Modal details
    expect(screen.getByText(/Permiso de Operación/i)).toBeInTheDocument()
    const permitImg = screen.getByAltText('Permiso de Operación') as HTMLImageElement
    expect(permitImg.src).toContain('pendingpermitimage1')

    // Approve Action
    const approveBtn = screen.getByRole('button', { name: /Aprobar/i })
    await fireEvent.click(approveBtn)
    expect(mockApproveVenue).toHaveBeenCalledWith('pending-1')

    // Reject Action
    // Open details again
    await fireEvent.click(detailsBtn)
    const rejectBtn = screen.getByRole('button', { name: /Rechazar/i })
    await fireEvent.click(rejectBtn)
    
    // Reject reason input prompt/modal
    const reasonInput = screen.getByPlaceholderText(/Motivo del rechazo/i)
    await fireEvent.change(reasonInput, { target: { value: 'Comprobante no válido' } })
    
    const confirmRejectBtn = screen.getByRole('button', { name: /Confirmar Rechazo/i })
    await fireEvent.click(confirmRejectBtn)
    
    expect(mockRejectVenue).toHaveBeenCalledWith('pending-1', 'Comprobante no válido')
  })
})

describe('Server Actions - Admin Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('approveVenue updates verification_status to approved and verified to true', async () => {
    // Import the actual server action bypassing the global jest mock
    const { approveVenue } = jest.requireActual('../app/actions/admin')
    
    mockSupabaseClient.update.mockReturnThis()
    mockSupabaseClient.eq.mockResolvedValue({ error: null })

    const result = await approveVenue('venue-123')

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('venues')
    expect(mockSupabaseClient.update).toHaveBeenCalledWith({
      verification_status: 'approved',
      verified: true
    })
    expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'venue-123')
    expect(result.success).toBe(true)
  })

  it('rejectVenue updates verification_status to rejected and sets rejection_reason', async () => {
    // Import the actual server action bypassing the global jest mock
    const { rejectVenue } = jest.requireActual('../app/actions/admin')

    mockSupabaseClient.update.mockReturnThis()
    mockSupabaseClient.eq.mockResolvedValue({ error: null })

    const result = await rejectVenue('venue-123', 'Documento borroso')

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('venues')
    expect(mockSupabaseClient.update).toHaveBeenCalledWith({
      verification_status: 'rejected',
      verified: false,
      rejection_reason: 'Documento borroso'
    })
    expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'venue-123')
    expect(result.success).toBe(true)
  })
})

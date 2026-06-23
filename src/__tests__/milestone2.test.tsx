import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { middleware } from '@/middleware'
import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import OnboardingPage from '@/app/onboarding/page'
import PlayerProfilePage from '@/app/profile/page'
import OwnerDashboard from '@/app/dashboard/page'
import AdminDashboardClient from '@/app/admin/AdminDashboardClient'
import QuickViewCard, { Venue } from '@/components/QuickViewCard'

// Mock next/navigation
const mockPush = jest.fn()
const mockRefresh = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  usePathname: () => '/profile',
}))

// Mock next-auth/react and next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        name: 'Player One',
        email: 'player@example.com',
        role: 'player',
      },
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockResolvedValue({
    user: {
      name: 'Player One',
      email: 'player@example.com',
      role: 'player',
    },
  }),
}))

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}))


// Define a local chainable mock Supabase client and store it globally to override the global mock instances
const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  then: jest.fn(function(onFulfilled) {
    return Promise.resolve({ data: [], error: null }).then(onFulfilled)
  })
}

const mockSupabase = {
  from: jest.fn().mockImplementation(() => {
    return mockQueryBuilder
  }),
  insert: jest.fn().mockResolvedValue({ error: null }),
  delete: jest.fn().mockResolvedValue({ error: null })
}
;(global as unknown as { mockSupabaseInstance: typeof mockSupabase }).mockSupabaseInstance = mockSupabase
;(global as unknown as { mockSupabaseServerInstance: typeof mockSupabase }).mockSupabaseServerInstance = mockSupabase



// Mock Leaflet/map components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-map">{children}</div>,
  TileLayer: () => <div />,
  Marker: () => <div />,
  useMap: () => ({ setView: jest.fn() }),
  useMapEvents: () => null,
}))

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    const MockComponent = () => <div data-testid="mock-map-container" />
    MockComponent.displayName = 'MockComponent'
    return MockComponent
  },
}))

// Mock Server Actions
const mockCreateVenue = jest.fn().mockResolvedValue({ success: true, venueId: 'venue-123' })
jest.mock('@/app/actions/venue', () => ({
  createVenue: (data: unknown) => mockCreateVenue(data),
}))

const mockCreateAnnouncement = jest.fn().mockResolvedValue({ success: true })
jest.mock('@/app/actions/announcement', () => ({
  createAnnouncement: (data: unknown) => mockCreateAnnouncement(data),
}))


const mockToggleFavorite = jest.fn().mockResolvedValue({ success: true, isFavorite: true })
jest.mock('@/app/actions/favorite', () => ({
  toggleFavorite: (venueId: string) => mockToggleFavorite(venueId),
}), { virtual: true })

describe('Milestone 2: Auth, Profiles, TCG tags, Dashboards, Bulletin Board', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock navigator.geolocation
    const mockGetCurrentPosition = jest.fn().mockImplementation((success) =>
      success({
        coords: {
          latitude: 19.4155,
          longitude: -99.1622
        }
      })
    )
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: mockGetCurrentPosition
      },
      writable: true,
      configurable: true
    })
  })


  // 1. Route Protection Middleware
  describe('Route Protection Middleware', () => {
    it('redirects unauthenticated users to /login for protected routes', async () => {
      ;(getToken as jest.Mock).mockResolvedValue(null)

      const req = new NextRequest(new URL('http://localhost:3000/dashboard'))
      const res = await middleware(req)

      expect(res).toBeDefined()
      expect(res?.status).toBe(307)
      expect(res?.headers.get('location')).toContain('/login')
    })

    it('allows authenticated users to access protected routes', async () => {
      ;(getToken as jest.Mock).mockResolvedValue({ email: 'user@example.com' })

      const req = new NextRequest(new URL('http://localhost:3000/dashboard'))
      const res = await middleware(req)

      expect(res?.status).not.toBe(307)
    })
  })

  // 2. Onboarding Wizard: Contact Inputs & TCG subtags
  describe('Onboarding Wizard Extensions', () => {
    it('validates and submits step 2 contact inputs and step 4 TCG subtags / badges', async () => {
      render(<OnboardingPage />)
      const user = userEvent.setup()

      // --- STEP 1: Details ---
      await user.type(screen.getByLabelText(/Nombre del Propietario/i), 'Jose Owner')
      await user.type(screen.getByLabelText(/Correo Electrónico/i), 'owner@example.com')
      await user.click(screen.getByRole('button', { name: /Siguiente/i }))

      // --- STEP 2: Venue Details with new Contact Email & Contact Phone ---
      expect(screen.getByLabelText(/Correo de Contacto Público/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Teléfono de Contacto/i)).toBeInTheDocument()

      await user.type(screen.getByLabelText(/Nombre del Local/i), 'Meeple TCG Haven')
      await user.selectOptions(screen.getByLabelText(/Tipo de Local/i), 'tienda')
      await user.type(screen.getByLabelText(/Descripción/i), 'La mejor tienda TCG de la ciudad.')
      await user.type(screen.getByLabelText(/Correo de Contacto Público/i), 'contacto@meepletcg.com')
      await user.type(screen.getByLabelText(/Teléfono de Contacto/i), '+525512345678')

      await user.click(screen.getByRole('button', { name: /Siguiente/i }))

      // --- STEP 3: Map (auto-mocked coordinates) ---
      // Use geolocation to set mock coordinates
      const geoBtn = screen.getByRole('button', { name: /Usar mi ubicación/i })
      await user.click(geoBtn)
      await user.click(screen.getByRole('button', { name: /Siguiente/i }))

      // --- STEP 4: Specialties (TCG subtags and badges) ---

      expect(screen.getByLabelText(/Magic/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Yu-Gi-Oh/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Pokémon/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Lorcana/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/One Piece/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Torneos Oficiales/i)).toBeInTheDocument()

      // Check some of them
      await user.click(screen.getByLabelText(/Magic/i))
      await user.click(screen.getByLabelText(/Pokémon/i))
      await user.click(screen.getByLabelText(/Torneos Oficiales/i))

      await user.click(screen.getByRole('button', { name: /Siguiente/i }))

      // --- STEP 5: Summary ---
      expect(screen.getByText('contacto@meepletcg.com')).toBeInTheDocument()
      expect(screen.getByText('+525512345678')).toBeInTheDocument()
      expect(screen.getByText('Magic')).toBeInTheDocument()
      expect(screen.getByText('Pokémon')).toBeInTheDocument()
      expect(screen.getByText('Torneos Oficiales')).toBeInTheDocument()
    })
  })

  // 3. Player Profile Portal
  describe('Player Profile Portal', () => {
    it('renders profile details, favorite stores, and reviews', async () => {
      // Mock Supabase responses for profile details, favorites and reviews
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'favorites') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
              data: [
                {
                  venues: {
                    id: 'venue-1',
                    name: 'Orcs Stories',
                    type: 'hibrido',
                    logo_url: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09',
                  },
                },
              ],
              error: null,
            }),
          } as unknown
        }
        if (table === 'reviews' || table === 'venue_reviews') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
              data: [
                {
                  id: 'review-1',
                  content: 'Excelente ambiente y buen servicio.',
                  rating: 5,
                  created_at: '2026-06-23T12:00:00Z',
                  venues: { name: 'Orcs Stories' },
                },
              ],
              error: null,
            }),
          } as unknown
        }
        return mockQueryBuilder
      })

      // Since profile is an async server component, we render it
      const result = await PlayerProfilePage()
      render(result)

      expect(screen.getByText('Player One')).toBeInTheDocument()
      expect(screen.getByText('player@example.com')).toBeInTheDocument()
      expect(screen.getByText('Rol: player')).toBeInTheDocument()

      // Favorites
      expect(screen.getAllByText('Orcs Stories').length).toBeGreaterThan(0)

      // Reviews
      expect(screen.getByText(/Excelente ambiente y buen servicio/i)).toBeInTheDocument()
      expect(screen.getByText('★ 5/5')).toBeInTheDocument()
    })
  })


  // 4. Owner Dashboard & Announcements Bulletin
  describe('Owner Dashboard & Announcements', () => {
    it('allows posting announcements and shows them in the store Quick View Card', async () => {
      // Render dashboard
      // Fetch venues owned by owner
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'venues') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
              data: [{ id: 'venue-owner-1', name: 'My TCG Store', owner_email: 'owner@example.com', verification_status: 'approved' }],
              error: null,
            }),

          } as unknown
        }
        return mockQueryBuilder
      })

      const dashboardNode = await OwnerDashboard({ searchParams: { email: 'owner@example.com' } })
      render(dashboardNode)


      expect(screen.getByText('My TCG Store')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /Publicar Anuncio/i })).toBeInTheDocument()

      // Write announcement
      const titleInput = screen.getByLabelText(/Título del Anuncio/i)
      const contentInput = screen.getByLabelText(/Contenido del Anuncio/i)
      const submitBtn = screen.getByRole('button', { name: /Publicar/i })

      await userEvent.type(titleInput, 'Torneo Especial Lorcana')
      await userEvent.type(contentInput, 'Este sábado a las 16:00 tendremos torneo de Lorcana con pool extra.')
      
      // Fire submit
      fireEvent.click(submitBtn)

      await waitFor(() => {
        expect(mockCreateAnnouncement).toHaveBeenCalledWith({
          venueId: 'venue-owner-1',
          title: 'Torneo Especial Lorcana',
          content: 'Este sábado a las 16:00 tendremos torneo de Lorcana con pool extra.',
        })
      })

      // Check Quick View Card rendering announcements
      const mockVenue = {
        id: 'venue-owner-1',
        name: 'My TCG Store',
        type: 'tienda' as const,
        description: 'La mejor tienda.',
        schedule: {},
        lat: 19.4,
        lng: -99.1,
        contact_email: 'owner@example.com',
        contact_phone: '+525512345678',
      }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'announcements') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: [
                {
                  id: 'ann-1',
                  title: 'Torneo Especial Lorcana',
                  content: 'Este sábado a las 16:00 tendremos torneo de Lorcana con pool extra.',
                  created_at: '2026-06-23T15:00:00Z',
                },
              ],
              error: null,
            }),
          } as unknown
        }
        return mockQueryBuilder
      })

      render(<QuickViewCard venue={mockVenue as unknown as Venue} onClose={jest.fn()} />)

      await screen.findByText('Torneo Especial Lorcana')
      expect(screen.getByText('Este sábado a las 16:00 tendremos torneo de Lorcana con pool extra.')).toBeInTheDocument()
    })
  })

  // 5. Platform Admin Dashboard: Contact info & messaging links
  describe('Platform Admin Dashboard', () => {
    it('renders contact info and pre-formatted email/WhatsApp links', () => {
      const mockVenues = [
        {
          id: 'venue-1',
          name: 'Orcs Stories',
          owner_name: 'Admin',
          owner_email: 'admin@orcsstories.com',
          business_tax_id: 'RFC-123456-1A',
          verification_proof: 'data:image/jpeg;base64,mockcroppedlogo',
          verification_status: 'pending',
          verified: false,
          contact_email: 'public@orcsstories.com',
          contact_phone: '+525599998888',
        },
      ]

      render(<AdminDashboardClient initialVenues={mockVenues} />)

      // Open details modal
      const detailsBtn = screen.getByRole('button', { name: /Ver Detalles/i })
      fireEvent.click(detailsBtn)

      // Check contact info is displayed in the modal
      expect(screen.getByText('public@orcsstories.com')).toBeInTheDocument()
      expect(screen.getByText('+525599998888')).toBeInTheDocument()

      // Check mailto and whatsapp links
      const mailLink = screen.getByRole('link', { name: /Enviar Correo/i }) as HTMLAnchorElement
      const waLink = screen.getByRole('link', { name: /WhatsApp/i }) as HTMLAnchorElement

      expect(mailLink.href).toContain('mailto:public@orcsstories.com')
      expect(waLink.href).toContain('https://wa.me/525599998888')
    })
  })
})

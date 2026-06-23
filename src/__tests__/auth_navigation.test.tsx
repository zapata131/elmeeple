import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterPage from '@/app/register/page'
import Navbar from '@/components/Navbar'
import { registerUser } from '@/app/actions/register'
import { useSession, signIn } from 'next-auth/react'

// Mock next-auth/react hooks and actions
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn()
}))

// Mock register server action
jest.mock('@/app/actions/register', () => ({
  registerUser: jest.fn(),
  hashPassword: jest.fn()
}))

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: jest.fn()
  }),
  usePathname: () => '/'
}))

describe('User Registration & Floating Navigation Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ==========================================
  // 1. DEDICATED REGISTRATION PAGE TESTS
  // ==========================================
  describe('Registration Page (/register)', () => {
    it('renders the registration form with inputs and role selector', () => {
      ;(useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' })
      render(<RegisterPage />)

      expect(screen.getByLabelText(/Nombre Completo/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Jugador/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Socio/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Crear Cuenta/i })).toBeInTheDocument()
    })

    it('successfully registers a Player and redirects to homepage', async () => {
      ;(useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' })
      ;(registerUser as jest.Mock).mockResolvedValue({ success: true })
      ;(signIn as jest.Mock).mockResolvedValue({ error: null })

      render(<RegisterPage />)
      const user = userEvent.setup()

      // Fill in inputs
      await user.type(screen.getByLabelText(/Nombre Completo/i), 'José Player')
      await user.type(screen.getByLabelText(/Correo Electrónico/i), 'player@elmeeple.com')
      await user.type(screen.getByLabelText(/Contraseña/i), 'secret123')

      // Role is 'player' (Jugador) by default. Click submit.
      await user.click(screen.getByRole('button', { name: /Crear Cuenta/i }))

      expect(registerUser).toHaveBeenCalledWith({
        name: 'José Player',
        email: 'player@elmeeple.com',
        password: 'secret123',
        role: 'player'
      })

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'player@elmeeple.com',
          password: 'secret123',
          redirect: false
        })
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('successfully registers a Partner and redirects to onboarding', async () => {
      ;(useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' })
      ;(registerUser as jest.Mock).mockResolvedValue({ success: true })
      ;(signIn as jest.Mock).mockResolvedValue({ error: null })

      render(<RegisterPage />)
      const user = userEvent.setup()

      // Fill in inputs
      await user.type(screen.getByLabelText(/Nombre Completo/i), 'Luis Partner')
      await user.type(screen.getByLabelText(/Correo Electrónico/i), 'partner@elmeeple.com')
      await user.type(screen.getByLabelText(/Contraseña/i), 'secret123')

      // Select Partner role
      const partnerBtn = screen.getByRole('button', { name: /Socio/i })
      await user.click(partnerBtn)

      // Submit form
      await user.click(screen.getByRole('button', { name: /Crear Cuenta/i }))

      expect(registerUser).toHaveBeenCalledWith({
        name: 'Luis Partner',
        email: 'partner@elmeeple.com',
        password: 'secret123',
        role: 'partner'
      })

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'partner@elmeeple.com',
          password: 'secret123',
          redirect: false
        })
        expect(mockPush).toHaveBeenCalledWith('/onboarding')
      })
    })
  })

  // ==========================================
  // 2. FLOATING NAVBAR & AUTH STATE TESTS
  // ==========================================
  describe('Floating Navbar Component', () => {
    it('renders guest state with Login link', () => {
      // Mock unauthenticated guest
      ;(useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' })
      render(<Navbar />)

      // Should show 'Iniciar Sesión / Registrarse'
      expect(screen.getByText('Iniciar Sesión / Registrarse')).toBeInTheDocument()
    })

    it('renders logged-in Player state with avatar and simple dropdown options', async () => {
      // Mock authenticated player
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: { name: 'Pedro Player', email: 'pedro@example.com' }
        },
        status: 'authenticated'
      })

      render(<Navbar />)
      const user = userEvent.setup()

      // Avatar with initials
      const avatarBtn = screen.getByLabelText('User Menu')
      expect(avatarBtn).toBeInTheDocument()
      expect(screen.getByText('PP')).toBeInTheDocument()

      // Open dropdown
      await user.click(avatarBtn)

      // Check dropdown options
      expect(screen.getByText('Mi Perfil')).toBeInTheDocument()
      // Should NOT show 'Mi Panel de Socio' or 'Administración'
      expect(screen.queryByText('Mi Panel de Socio')).not.toBeInTheDocument()
      expect(screen.queryByText('Administración')).not.toBeInTheDocument()
      expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument()
    })

    it('renders logged-in Partner state and includes Partner Panel in dropdown', async () => {
      // Mock authenticated partner
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: { name: 'Socio Owner', email: 'socio@example.com', role: 'partner' }
        },
        status: 'authenticated'
      })

      render(<Navbar />)
      const user = userEvent.setup()

      // Open dropdown
      const avatarBtn = screen.getByLabelText('User Menu')
      await user.click(avatarBtn)

      // Should show 'Mi Panel de Socio' but NOT 'Administración'
      expect(screen.getByText('Mi Perfil')).toBeInTheDocument()
      expect(screen.getByText('Mi Panel de Socio')).toBeInTheDocument()
      expect(screen.queryByText('Administración')).not.toBeInTheDocument()
    })

    it('renders logged-in Admin state and includes Admin Panel in dropdown', async () => {
      // Mock authenticated admin
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: { name: 'Admin Boss', email: 'admin@example.com', role: 'admin' }
        },
        status: 'authenticated'
      })

      render(<Navbar />)
      const user = userEvent.setup()

      // Open dropdown
      const avatarBtn = screen.getByLabelText('User Menu')
      await user.click(avatarBtn)

      // Should show 'Administración' but NOT 'Mi Panel de Socio'
      expect(screen.getByText('Mi Perfil')).toBeInTheDocument()
      expect(screen.getByText('Administración')).toBeInTheDocument()
      expect(screen.queryByText('Mi Panel de Socio')).not.toBeInTheDocument()
    })

  })
})

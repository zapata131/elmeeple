import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Navbar from '@/components/Navbar'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signOut: jest.fn(),
}))

describe('Theme Toggle & Dark Mode', () => {
  beforeEach(() => {
    // Clear localStorage and html classes
    localStorage.clear()
    document.documentElement.className = ''
    jest.clearAllMocks()
  })

  it('renders the theme toggle button', () => {
    render(<Navbar />)
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
  })

  it('toggles dark mode class on documentElement and updates localStorage', async () => {
    render(<Navbar />)
    const user = userEvent.setup()
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i })

    // Initially, no dark class
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    // Click toggle
    await user.click(toggleButton)

    // Should add 'dark' class and set localStorage
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')

    // Click again
    await user.click(toggleButton)

    // Should remove 'dark' class and set localStorage
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('reads initial theme from localStorage on mount', () => {
    localStorage.setItem('theme', 'dark')
    // Simulate the inline script setting the class on html
    document.documentElement.classList.add('dark')

    render(<Navbar />)

    // Should keep dark class
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})

import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home Page', () => {
  it('renders the main heading "El Meeple"', () => {
    render(<Home />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('El Meeple')
  })

  it('renders the tagline "¿Dónde jugamos hoy?"', () => {
    render(<Home />)
    const tagline = screen.getByText(/¿Dónde jugamos hoy\?/i)
    expect(tagline).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home Page', () => {
  it('renders the brand title in the Navbar', () => {
    render(<Home />)
    expect(screen.getByText('El Meeple')).toBeInTheDocument()
  })

  it('renders the map search controls and category chips', () => {
    render(<Home />)
    expect(screen.getByPlaceholderText('Buscar locales...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cafés' })).toBeInTheDocument()
  })
})

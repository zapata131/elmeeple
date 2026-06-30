import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'
import Map from '@/components/Map'

describe('Map Component', () => {
  it('renders the map container and tile layer', () => {
    render(<Map />)
    expect(screen.getByTestId('mock-map-container')).toBeInTheDocument()
    expect(screen.getByTestId('mock-tile-layer')).toBeInTheDocument()
  })
})

describe('Home Page with Map Integration', () => {
  it('renders the Map component on the home page', () => {
    render(<Home />)
    expect(screen.getByTestId('mock-map-container')).toBeInTheDocument()
  })

  it('renders the floating Navbar and search controls', () => {
    render(<Home />)
    expect(screen.getByText('El Meeple')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Buscar locales, juegos, direcciones...')).toBeInTheDocument()
  })
})

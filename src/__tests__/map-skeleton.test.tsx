import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import MapSkeleton from '@/components/MapSkeleton'

describe('MapSkeleton Component', () => {
  it('renders the map skeleton container', () => {
    render(<MapSkeleton />)
    expect(screen.getByTestId('map-skeleton')).toBeInTheDocument()
  })

  it('renders the stylized street grid blocks', () => {
    render(<MapSkeleton />)
    const gridBlocks = screen.getAllByTestId('skeleton-grid-block')
    expect(gridBlocks.length).toBeGreaterThan(0)
  })

  it('renders pulsing marker indicators representing venues', () => {
    render(<MapSkeleton />)
    const pins = screen.getAllByTestId('skeleton-pin')
    expect(pins.length).toBeGreaterThan(0)
    pins.forEach(pin => {
      expect(pin).toHaveClass('animate-pulse')
    })
  })

  it('renders a floating search bar placeholder', () => {
    render(<MapSkeleton />)
    expect(screen.getByTestId('skeleton-search-bar')).toBeInTheDocument()
  })
})

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventManager from '@/app/dashboard/EventManager'
import { getEvents, createEvent, deleteEvent } from '@/app/actions/events'

// Mock server actions
jest.mock('@/app/actions/events', () => ({
  getEvents: jest.fn(),
  createEvent: jest.fn(),
  deleteEvent: jest.fn(),
}))

describe('EventManager Component (Owner Dashboard)', () => {
  const venueId = 'venue-123'
  
  const mockEvents = [
    {
      id: 'evt-1',
      title: 'Torneo Semanal MTG',
      game: 'Magic: The Gathering',
      date: '2026-07-05T18:00:00.000Z',
      entry_fee: 100,
      max_participants: 16,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getEvents as jest.Mock).mockResolvedValue({ success: true, data: mockEvents })
  })

  it('renders the event list and handles empty states', async () => {
    ;(getEvents as jest.Mock).mockResolvedValueOnce({ success: true, data: [] })
    render(<EventManager venueId={venueId} />)

    expect(screen.getByText('Cargando eventos...')).toBeInTheDocument()
    
    expect(await screen.findByText('No tienes eventos programados.')).toBeInTheDocument()
  })

  it('lists existing events correctly', async () => {
    render(<EventManager venueId={venueId} />)

    expect(await screen.findByText('Torneo Semanal MTG')).toBeInTheDocument()
    expect(screen.getByText('Magic: The Gathering')).toBeInTheDocument()
  })

  it('toggles the creation form and submits a new event successfully', async () => {
    ;(createEvent as jest.Mock).mockResolvedValue({ success: true })
    render(<EventManager venueId={venueId} />)
    const user = userEvent.setup()

    // Click "+ Nuevo" to open form
    const newBtn = screen.getByRole('button', { name: '+ Nuevo' })
    await user.click(newBtn)

    // Form should be visible
    expect(screen.getByLabelText('Título del Evento')).toBeInTheDocument()

    // Fill form
    await user.type(screen.getByLabelText('Título del Evento'), 'Torneo Lorcana')
    await user.type(screen.getByLabelText('Juego / Categoría'), 'Lorcana')
    
    // Set date (must match format for datetime-local in JSDOM, which is YYYY-MM-DDTHH:mm)
    fireEvent.change(screen.getByLabelText('Fecha y Hora'), { target: { value: '2026-07-10T19:00' } })
    
    // Set fee and limit
    fireEvent.change(screen.getByLabelText('Costo de Inscripción ($)'), { target: { value: '150' } })
    await user.type(screen.getByPlaceholderText('Sin límite'), '32')

    // Submit
    const submitBtn = screen.getByRole('button', { name: 'Crear Evento' })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(createEvent).toHaveBeenCalledWith(
        venueId,
        'Torneo Lorcana',
        'Lorcana',
        '',
        expect.any(String), // ISO Date string
        150,
        32
      )
    })

    // Check success message and form closed
    expect(await screen.findByText('¡Evento creado con éxito!')).toBeInTheDocument()
  })

  it('calls deleteEvent when clicking the delete button', async () => {
    window.confirm = jest.fn(() => true)
    ;(deleteEvent as jest.Mock).mockResolvedValue({ success: true })
    
    render(<EventManager venueId={venueId} />)
    const user = userEvent.setup()

    // Wait for events to load
    expect(await screen.findByText('Torneo Semanal MTG')).toBeInTheDocument()

    // Click delete
    const deleteBtn = screen.getByRole('button', { name: 'Eliminar evento' })
    await user.click(deleteBtn)

    expect(window.confirm).toHaveBeenCalled()
    expect(deleteEvent).toHaveBeenCalledWith('evt-1', venueId)
  })
})

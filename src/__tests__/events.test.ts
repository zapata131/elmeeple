/* eslint-disable @typescript-eslint/no-explicit-any */
import { getEvents, createEvent, deleteEvent } from '@/app/actions/events'
import { createClient } from '@/utils/supabase/server'
import { getServerSession } from 'next-auth'

// Mock Supabase server client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}))

// Mock NextAuth getServerSession
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

describe('Events Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getEvents', () => {
    it('fetches events for a given venue sorted by date', async () => {
      const mockEvents = [
        { id: 'evt-1', title: 'Tournament 1', date: '2026-07-01T18:00:00Z' },
        { id: 'evt-2', title: 'Tournament 2', date: '2026-07-02T18:00:00Z' },
      ]

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockEvents, error: null }),
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await getEvents('venue-123')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockEvents)

      expect(mockSupabase.from).toHaveBeenCalledWith('events')
      expect(mockSupabase.eq).toHaveBeenCalledWith('venue_id', 'venue-123')
      expect(mockSupabase.order).toHaveBeenCalledWith('date', { ascending: true })
    })

    it('returns error if query fails', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: { message: 'Query failed' } }),
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await getEvents('venue-123')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Query failed')
    })
  })

  describe('createEvent', () => {
    it('returns error if user is not authenticated', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const result = await createEvent('venue-123', 'Title', 'Game', 'Desc', '2026-07-01T18:00:00Z', 100)
      expect(result.success).toBe(false)
      expect(result.error).toContain('iniciar sesión')
    })

    it('returns error if user is not the owner of the venue', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'wrong@example.com' },
      })

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await createEvent('venue-123', 'Title', 'Game', 'Desc', '2026-07-01T18:00:00Z', 100)
      expect(result.success).toBe(false)
      expect(result.error).toContain('No tiene permisos')
    })

    it('creates event successfully if owner checks pass', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'owner@example.com' },
      })

      const mockVenue = { id: 'venue-123', owner_email: 'owner@example.com' }

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockVenue, error: null }),
        insert: jest.fn().mockResolvedValue({ error: null }),
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await createEvent('venue-123', 'Tournament 1', 'Magic', 'Desc', '2026-07-01T18:00:00Z', 150.50, 16)
      expect(result.success).toBe(true)

      expect(mockSupabase.insert).toHaveBeenCalledWith({
        venue_id: 'venue-123',
        title: 'Tournament 1',
        game: 'Magic',
        description: 'Desc',
        date: '2026-07-01T18:00:00Z',
        entry_fee: 150.50,
        max_participants: 16,
      })
    })
  })

  describe('deleteEvent', () => {
    it('deletes event successfully if ownership checks pass', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'owner@example.com' },
      })

      const mockVenue = { id: 'venue-123', owner_email: 'owner@example.com' }

      const mockDeleteEq = jest.fn().mockResolvedValue({ error: null })
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockVenue, error: null }),
        delete: jest.fn().mockReturnValue({
          eq: mockDeleteEq,
        }),
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await deleteEvent('evt-999', 'venue-123')
      expect(result.success).toBe(true)

      expect(mockSupabase.delete).toHaveBeenCalled()
      expect(mockDeleteEq).toHaveBeenLastCalledWith('id', 'evt-999')
    })
  })
})

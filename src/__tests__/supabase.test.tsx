import { createVenue, OnboardingData } from '@/app/actions/venue'
import { createClient } from '@/utils/supabase/server'

// Mock the Supabase server client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}))

describe('Supabase Integration Tests', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabaseClient: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Create a mock Supabase client with chainable methods
    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabaseClient)
  })

  describe('createVenue Server Action', () => {
    const mockOnboardingData: OnboardingData = {
      ownerName: 'Test Owner',
      ownerEmail: 'owner@test.com',
      name: 'Test Venue',
      description: 'A great place to play board games.',
      schedule: {
        mon: null,
        tue: { open: '12:00', close: '22:00' },
        wed: { open: '12:00', close: '22:00' },
        thu: { open: '12:00', close: '22:00' },
        fri: { open: '12:00', close: '22:00' },
        sat: { open: '12:00', close: '22:00' },
        sun: { open: '12:00', close: '22:00' },
      },
      lat: 19.4326,
      lng: -99.1332,
      tags: ['Eurogames', 'TCGs'],
      type: 'cafe',
      instagram: 'test_instagram',
      discord: 'https://discord.gg/test',
      logoUrl: 'data:image/jpeg;base64,test-image-data',
    }

    it('should successfully insert a new venue and map its tags', async () => {
      // Mock venue insert response
      const mockInsertedVenue = { id: 'new-venue-uuid', name: 'Test Venue' }
      mockSupabaseClient.insert.mockImplementation(() => {
        // Return a select chain mock
        return {
          select: jest.fn().mockResolvedValue({
            data: [mockInsertedVenue],
            error: null,
          }),
        }
      })

      // Mock tags select response
      mockSupabaseClient.select.mockImplementation(() => {
        return {
          in: jest.fn().mockResolvedValue({
            data: [
              { id: 'tag-1-uuid', name: 'Eurogames' },
              { id: 'tag-2-uuid', name: 'TCGs' },
            ],
            error: null,
          })
        }
      })

      // Call the Server Action
      const result = await createVenue(mockOnboardingData)

      // Assertions
      expect(createClient).toHaveBeenCalled()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('venues')
      expect(result.success).toBe(true)
      expect(result.venueId).toBe('new-venue-uuid')
    })

    it('should return error response when database insertion fails', async () => {
      // Mock failure on venues insert
      mockSupabaseClient.insert.mockImplementation(() => {
        return {
          select: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error occurred' },
          }),
        }
      })

      const result = await createVenue(mockOnboardingData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Database error occurred')
    })
  })
})

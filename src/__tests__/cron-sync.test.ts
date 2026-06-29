/* eslint-disable @typescript-eslint/no-explicit-any */
import { GET } from '@/app/api/cron/sync/route'
import { createClient } from '@/utils/supabase/server'
import { NextRequest } from 'next/server'

// Mock Supabase server client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}))

import { syncBggCollection } from '@/app/actions/bgg'

describe('CRON BGG Sync API Route', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv, CRON_SECRET: 'test-cron-secret' }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns 401 Unauthorized if the Authorization header is missing or incorrect', async () => {
    const reqWithoutHeader = new NextRequest('http://localhost:3000/api/cron/sync')
    const response1 = await GET(reqWithoutHeader)
    expect(response1.status).toBe(401)
    const json1 = await response1.json()
    expect(json1.error).toBe('No autorizado')

    const reqWithBadHeader = new NextRequest('http://localhost:3000/api/cron/sync', {
      headers: {
        Authorization: 'Bearer wrong-secret',
      },
    })
    const response2 = await GET(reqWithBadHeader)
    expect(response2.status).toBe(401)
  })

  it('returns 500 if the database query fails', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      or: jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    const req = new NextRequest('http://localhost:3000/api/cron/sync', {
      headers: {
        Authorization: 'Bearer test-cron-secret',
      },
    })

    const response = await GET(req)
    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json.error).toContain('Database error')
  })

  it('successfully fetches eligible venues and triggers sync for each', async () => {
    const mockVenues = [
      { id: 'v-1', name: 'Orcs Stories', bgg_username: 'zapata131' },
      { id: 'v-2', name: 'La Matatena', bgg_username: 'matatena_gdl' },
    ]

    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      or: jest.fn().mockResolvedValue({ data: mockVenues, error: null }),
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    // Mock syncBggCollection results
    ;(syncBggCollection as jest.Mock)
      .mockResolvedValueOnce({ success: true, count: 42 })
      .mockResolvedValueOnce({ success: false, error: 'BGG API Error' })

    const req = new NextRequest('http://localhost:3000/api/cron/sync', {
      headers: {
        Authorization: 'Bearer test-cron-secret',
      },
    })

    const response = await GET(req)
    expect(response.status).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.processed).toHaveLength(2)
    expect(json.processed[0]).toEqual({
      venueId: 'v-1',
      name: 'Orcs Stories',
      status: 'success',
      count: 42,
    })
    expect(json.processed[1]).toEqual({
      venueId: 'v-2',
      name: 'La Matatena',
      status: 'failed',
      error: 'BGG API Error',
    })

    expect(syncBggCollection).toHaveBeenCalledTimes(2)
    expect(syncBggCollection).toHaveBeenNthCalledWith(1, 'v-1', 'zapata131')
    expect(syncBggCollection).toHaveBeenNthCalledWith(2, 'v-2', 'matatena_gdl')
  })
})

import { WasteService } from '../waste-service'
import { mockCompanies, mockWasteData, createMockSupabaseClient } from '@/__tests__/mocks/supabase.mock'

// Mock the Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: null, // Start with null to test the null case
}))

describe('WasteService', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  describe('getAllCompanies', () => {
    it('returns error response when supabase is not configured', async () => {
      // Ensure supabase is null
      const supabaseModule = await import('@/lib/supabase')
      ;(supabaseModule as any).supabase = null

      const result = await WasteService.getAllCompanies()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database not configured')
      expect(result.data.data).toEqual([])
    })
  })

  describe('getDashboardData', () => {
    it('returns default data when supabase is not configured', async () => {
      // Ensure supabase is null
      const supabaseModule = await import('@/lib/supabase')
      ;(supabaseModule as any).supabase = null

      const result = await WasteService.getDashboardData()

      expect(result.success).toBe(true)
      expect(result.data.companies).toEqual([])
      expect(result.data.analytics).toBeDefined()
      expect(typeof result.data.analytics.totalWaste).toBe('number')
    })
  })

  describe('getAnalytics', () => {
    it('returns default analytics when supabase is not configured', async () => {
      // Ensure supabase is null
      const supabaseModule = await import('@/lib/supabase')
      ;(supabaseModule as any).supabase = null

      const result = await WasteService.getAnalytics()

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(typeof result.data.totalWaste).toBe('number')
    })
  })

  describe('getCompanyById', () => {
    it('returns error when supabase is not configured', async () => {
      // Ensure supabase is null
      const supabaseModule = await import('@/lib/supabase')
      ;(supabaseModule as any).supabase = null

      const result = await WasteService.getCompanyById('test-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database not configured')
    })
  })

  describe('getWasteStreams', () => {
    it('returns empty data when supabase is not configured', async () => {
      // Ensure supabase is null
      const supabaseModule = await import('@/lib/supabase')
      ;(supabaseModule as any).supabase = null

      const result = await WasteService.getWasteStreams()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database not configured')
    })
  })
})
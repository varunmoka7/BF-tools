import { WasteData, Company } from '@/types/waste'

// Mock data for testing
export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Test Company 1',
    industry: 'Manufacturing',
    size: 'large',
    location: 'New York',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Test Company 2',
    industry: 'Technology',
    size: 'medium',
    location: 'San Francisco',
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'Test Company 3',
    industry: 'Healthcare',
    size: 'small',
    location: 'Boston',
    created_at: '2024-01-03T00:00:00Z',
  },
]

export const mockWasteData: WasteData[] = [
  {
    id: '1',
    company_id: '1',
    waste_type: 'Organic',
    quantity: 100,
    unit: 'kg',
    date: '2024-01-01',
    location: 'New York',
    disposal_method: 'recycling',
    cost: 50,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    company_id: '1',
    waste_type: 'Plastic',
    quantity: 75,
    unit: 'kg',
    date: '2024-01-02',
    location: 'New York',
    disposal_method: 'landfill',
    cost: 30,
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    company_id: '2',
    waste_type: 'Electronic',
    quantity: 25,
    unit: 'kg',
    date: '2024-01-03',
    location: 'San Francisco',
    disposal_method: 'recycling',
    cost: 100,
    created_at: '2024-01-03T00:00:00Z',
  },
]

// Mock Supabase client
export const createMockSupabaseClient = () => {
  const mockSelect = jest.fn().mockReturnThis()
  const mockEq = jest.fn().mockReturnThis()
  const mockOrder = jest.fn().mockReturnThis()
  const mockFrom = jest.fn().mockReturnThis()

  const mockClient = {
    from: mockFrom,
    select: mockSelect,
    eq: mockEq,
    order: mockOrder,
  }

  // Set up default responses
  mockFrom.mockImplementation((table: string) => {
    const chainable = {
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
    }

    // Configure select behavior
    mockSelect.mockImplementation(() => {
      const selectChain = {
        order: mockOrder,
        eq: mockEq,
      }

      // Configure order behavior
      mockOrder.mockImplementation(() => {
        if (table === 'companies') {
          return Promise.resolve({ data: mockCompanies, error: null })
        } else if (table === 'waste_data') {
          return Promise.resolve({ data: mockWasteData, error: null })
        }
        return Promise.resolve({ data: [], error: null })
      })

      // Configure eq behavior (for filtered queries)
      mockEq.mockImplementation((column: string, value: string) => {
        if (table === 'waste_data' && column === 'company_id') {
          const filteredData = mockWasteData.filter(item => item.company_id === value)
          return Promise.resolve({ data: filteredData, error: null })
        }
        return Promise.resolve({ data: [], error: null })
      })

      return selectChain
    })

    return chainable
  })

  return mockClient
}

// Mock the Supabase module
export const mockSupabase = createMockSupabaseClient()

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

export default mockSupabase
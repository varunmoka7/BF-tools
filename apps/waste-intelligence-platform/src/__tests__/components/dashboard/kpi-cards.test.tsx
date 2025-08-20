import { render, screen, waitFor } from '@testing-library/react'
import { KPICards } from '@/components/dashboard/kpi-cards'

// Mock the utils
jest.mock('@/lib/utils', () => ({
  formatNumber: (num: number) => num.toLocaleString(),
  formatCurrency: (num: number) => `$${num.toLocaleString()}`,
  formatPercentage: (num: number) => `${num.toFixed(1)}%`
}))

describe('KPICards', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  const mockCompaniesData = [
    {
      id: '1',
      name: 'Company 1',
      annualVolume: 100000,
      recyclingRate: 75,
      complianceScore: 90,
      revenue: 1000000
    },
    {
      id: '2',
      name: 'Company 2',
      annualVolume: 50000,
      recyclingRate: 65,
      complianceScore: 85,
      revenue: 500000
    }
  ]

  it('displays loading state initially', () => {
    global.fetch = jest.fn(() => new Promise(() => {})) // Never resolves
    
    render(<KPICards />)
    expect(screen.getByText('Loading KPIs...')).toBeInTheDocument()
  })

  it('fetches and displays KPI data successfully', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockCompaniesData })
    })

    render(<KPICards />)

    await waitFor(() => {
      expect(screen.getByText('Total Waste Volume')).toBeInTheDocument()
      expect(screen.getByText('Recycling Rate')).toBeInTheDocument()
      expect(screen.getByText('Active Companies')).toBeInTheDocument()
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
      expect(screen.getByText('Compliance Score')).toBeInTheDocument()
      expect(screen.getByText('Carbon Footprint')).toBeInTheDocument()
    })
  })

  it('calculates KPI metrics correctly', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockCompaniesData })
    })

    render(<KPICards />)

    await waitFor(() => {
      // Total volume: 100000 + 50000 = 150000
      expect(screen.getByText('150,000 tons')).toBeInTheDocument()
      
      // Average recycling rate: (75 + 65) / 2 = 70
      expect(screen.getByText('70.0%')).toBeInTheDocument()
      
      // Active companies count: 2
      expect(screen.getByText('2')).toBeInTheDocument()
      
      // Total revenue: 1000000 + 500000 = 1500000
      expect(screen.getByText('$1,500,000')).toBeInTheDocument()
      
      // Average compliance score: (90 + 85) / 2 = 87.5
      expect(screen.getByText('87.50/100')).toBeInTheDocument()
    })
  })

  it('handles empty data gracefully', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] })
    })

    // Mock console.warn to avoid noise in test output
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

    render(<KPICards />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('No companies data received')
    })

    consoleSpy.mockRestore()
  })

  it('handles API errors with fallback data', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('API Error'))

    // Mock console.error to avoid noise in test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    render(<KPICards />)

    await waitFor(() => {
      expect(screen.getByText('Total Waste Volume')).toBeInTheDocument()
      expect(screen.getByText('700,000 tons')).toBeInTheDocument() // Fallback data
      expect(screen.getByText('70.8%')).toBeInTheDocument() // Fallback recycling rate
      expect(screen.getByText('1,247')).toBeInTheDocument() // Fallback companies count
    })

    consoleSpy.mockRestore()
  })

  it('handles old API structure (direct array response)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCompaniesData) // Direct array, not wrapped in data
    })

    render(<KPICards />)

    await waitFor(() => {
      expect(screen.getByText('150,000 tons')).toBeInTheDocument()
      expect(screen.getByText('70.0%')).toBeInTheDocument()
    })
  })

  it('displays all KPI cards with proper icons and trends', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockCompaniesData })
    })

    render(<KPICards />)

    await waitFor(() => {
      // Check that all trend indicators are present
      const trendElements = screen.getAllByText(/from last month/)
      expect(trendElements).toHaveLength(6)
      
      // Check for trend values
      expect(screen.getByText('+12.5% from last month')).toBeInTheDocument()
      expect(screen.getByText('+3.2% from last month')).toBeInTheDocument()
      expect(screen.getByText('+8.1% from last month')).toBeInTheDocument()
      expect(screen.getByText('+15.3% from last month')).toBeInTheDocument()
      expect(screen.getByText('+2.1% from last month')).toBeInTheDocument()
      expect(screen.getByText('-5.8% from last month')).toBeInTheDocument()
    })
  })

  it('has proper responsive grid layout', () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockCompaniesData })
    })

    const { container } = render(<KPICards />)
    
    const gridContainer = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6')
    expect(gridContainer).toBeInTheDocument()
  })

  it('applies hover effects to cards', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockCompaniesData })
    })

    const { container } = render(<KPICards />)

    await waitFor(() => {
      const cards = container.querySelectorAll('.hover\\:shadow-md.transition-shadow')
      expect(cards.length).toBeGreaterThan(0)
    })
  })
})
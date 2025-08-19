import { render, screen, waitFor } from '@/__tests__/utils/test-utils'
import { act } from '@testing-library/react'
import DashboardOverview from '../page'
import { WasteService } from '@/services/waste-service'
import '@/__tests__/mocks/supabase.mock'

// Mock the WasteService
jest.mock('@/services/waste-service')
const mockWasteService = WasteService as jest.Mocked<typeof WasteService>

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/dashboard',
}))

describe('Dashboard Overview Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', async () => {
    // Make the service return a promise that doesn't resolve immediately
    mockWasteService.getDashboardData.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )

    await act(async () => {
      render(<DashboardOverview />)
    })

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument()
  })

  it('renders dashboard with successful data load', async () => {
    const mockData = {
      success: true,
      data: {
        companies: [
          {
            id: '1',
            name: 'Test Company',
            industry: 'Manufacturing',
            size: 'large' as const,
            location: 'New York',
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        wasteStreams: [
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
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
        analytics: {
          totalWaste: 125000,
          wasteReduction: 15.2,
          costSavings: 45000,
          recyclingRate: 67.8,
          carbonFootprint: 62.5,
        },
      },
    }

    mockWasteService.getDashboardData.mockResolvedValue(mockData)

    await act(async () => {
      render(<DashboardOverview />)
    })

    await waitFor(() => {
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument()
    })

    // Check if metrics cards are rendered
    expect(screen.getByText('Total Waste')).toBeInTheDocument()
    expect(screen.getByText('Cost Savings')).toBeInTheDocument()
    expect(screen.getByText('Recycling Rate')).toBeInTheDocument()
    expect(screen.getByText('Carbon Footprint')).toBeInTheDocument()

    // Check if analytics values are displayed
    expect(screen.getByText('125,000 kg')).toBeInTheDocument()
    expect(screen.getByText('$45,000')).toBeInTheDocument()
    expect(screen.getByText('67.8%')).toBeInTheDocument()
    expect(screen.getByText('62.5 CO2e')).toBeInTheDocument()
  })

  it('renders error state when data loading fails', async () => {
    mockWasteService.getDashboardData.mockRejectedValue(new Error('API Error'))

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    await act(async () => {
      render(<DashboardOverview />)
    })

    await waitFor(() => {
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument()
    })

    // Should fallback to mock data when error occurs
    expect(screen.getByText('125,000 kg')).toBeInTheDocument()
    expect(consoleSpy).toHaveBeenCalledWith('Error loading dashboard data:', new Error('API Error'))

    consoleSpy.mockRestore()
  })

  it('displays getting started information', async () => {
    const mockData = {
      companies: [],
      wasteData: [],
      analytics: {
        totalWaste: 125000,
        wasteReduction: 15.2,
        costSavings: 45000,
        recyclingRate: 67.8,
        carbonFootprint: 62.5,
      },
    }

    mockWasteService.getDashboardData.mockResolvedValue(mockData)

    await act(async () => {
      render(<DashboardOverview />)
    })

    await waitFor(() => {
      expect(screen.getByText('Getting Started')).toBeInTheDocument()
    })

    expect(screen.getByText('Welcome to your Waste Management BI Dashboard!')).toBeInTheDocument()
    expect(screen.getByText('Configure your Supabase connection in .env.local')).toBeInTheDocument()
  })

  it('handles service call correctly', async () => {
    const mockData = {
      companies: [],
      wasteData: [],
      analytics: {
        totalWaste: 125000,
        wasteReduction: 15.2,
        costSavings: 45000,
        recyclingRate: 67.8,
        carbonFootprint: 62.5,
      },
    }

    mockWasteService.getDashboardData.mockResolvedValue(mockData)

    await act(async () => {
      render(<DashboardOverview />)
    })

    await waitFor(() => {
      expect(mockWasteService.getDashboardData).toHaveBeenCalledTimes(1)
    })

    expect(mockWasteService.getDashboardData).toHaveBeenCalledWith()
  })

  it('renders proper semantic structure', async () => {
    const mockData = {
      companies: [],
      wasteData: [],
      analytics: {
        totalWaste: 125000,
        wasteReduction: 15.2,
        costSavings: 45000,
        recyclingRate: 67.8,
        carbonFootprint: 62.5,
      },
    }

    mockWasteService.getDashboardData.mockResolvedValue(mockData)

    await act(async () => {
      render(<DashboardOverview />)
    })

    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument() // Header from DashboardLayout
      expect(screen.getByRole('main')).toBeInTheDocument() // Main content from DashboardLayout
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument() // Dashboard Overview
    })
  })
})
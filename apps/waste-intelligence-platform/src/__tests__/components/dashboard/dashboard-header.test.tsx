import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

// Mock the toast hook
const mockToast = jest.fn()
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast
  })
}))

// Mock document methods for file download
const mockCreateElement = jest.fn(() => ({
  click: jest.fn(),
  setAttribute: jest.fn(),
  style: { visibility: '' }
}))
const mockAppendChild = jest.fn()
const mockRemoveChild = jest.fn()

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement
})
Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild
})
Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild
})

describe('DashboardHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset fetch mock
    global.fetch = jest.fn()
  })

  it('renders the dashboard title and description', () => {
    render(<DashboardHeader />)
    
    expect(screen.getByText('Waste Intelligence Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Monitor global waste management operations and compliance metrics')).toBeInTheDocument()
  })

  it('renders refresh and export buttons', () => {
    render(<DashboardHeader />)
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    const exportButton = screen.getByRole('button', { name: /export/i })
    
    expect(refreshButton).toBeInTheDocument()
    expect(exportButton).toBeInTheDocument()
  })

  it('handles refresh button click', async () => {
    const mockReload = jest.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    })

    const user = userEvent.setup()
    render(<DashboardHeader />)
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    await user.click(refreshButton)
    
    expect(mockReload).toHaveBeenCalledTimes(1)
  })

  it('handles successful data export', async () => {
    const mockData = [
      {
        name: 'Test Company',
        country: 'USA',
        region: 'North America',
        wasteType: 'Mixed',
        annualVolume: 1000,
        recyclingRate: 75,
        complianceScore: 90,
        certifications: ['ISO 14001', 'LEED']
      }
    ]

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockData })
    })

    const user = userEvent.setup()
    render(<DashboardHeader />)
    
    const exportButton = screen.getByRole('button', { name: /export/i })
    await user.click(exportButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Exporting data...',
        description: 'Please wait while we prepare your CSV file.',
      })
    })

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Export successful',
        description: 'Your CSV file has been downloaded successfully.',
        variant: 'success',
      })
    })
  })

  it('handles export with no data', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] })
    })

    const user = userEvent.setup()
    render(<DashboardHeader />)
    
    const exportButton = screen.getByRole('button', { name: /export/i })
    await user.click(exportButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'No data to export',
        description: 'There is no data available to export.',
        variant: 'destructive',
      })
    })
  })

  it('handles export API failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500
    })

    const user = userEvent.setup()
    render(<DashboardHeader />)
    
    const exportButton = screen.getByRole('button', { name: /export/i })
    await user.click(exportButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Export failed',
        description: 'There was an error exporting your data. Please try again.',
        variant: 'destructive',
      })
    })
  })

  it('handles network error during export', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

    const user = userEvent.setup()
    render(<DashboardHeader />)
    
    const exportButton = screen.getByRole('button', { name: /export/i })
    await user.click(exportButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Export failed',
        description: 'There was an error exporting your data. Please try again.',
        variant: 'destructive',
      })
    })
  })

  it('has responsive layout classes', () => {
    const { container } = render(<DashboardHeader />)
    
    const headerContainer = container.querySelector('.flex.flex-col.sm\\:flex-row')
    expect(headerContainer).toBeInTheDocument()
    
    const buttonContainer = container.querySelector('.flex.items-center.space-x-3.mt-4.sm\\:mt-0')
    expect(buttonContainer).toBeInTheDocument()
  })
})
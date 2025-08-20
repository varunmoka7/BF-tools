import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

// Mock the dashboard components
jest.mock('@/components/dashboard/dashboard-header', () => ({
  DashboardHeader: () => <div data-testid="dashboard-header">Dashboard Header</div>
}))

jest.mock('@/components/dashboard/kpi-cards', () => ({
  KPICards: () => <div data-testid="kpi-cards">KPI Cards</div>
}))

jest.mock('@/components/charts/charts-section', () => ({
  ChartsSection: () => <div data-testid="charts-section">Charts Section</div>
}))

describe('HomePage', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    jest.clearAllMocks()
  })

  it('renders the main dashboard components', () => {
    render(<HomePage />)
    
    // Check that all main components are present
    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument()
    expect(screen.getByTestId('kpi-cards')).toBeInTheDocument()
    expect(screen.getByTestId('charts-section')).toBeInTheDocument()
  })

  it('has correct layout structure', () => {
    const { container } = render(<HomePage />)
    
    // Check for the main layout classes
    const mainContainer = container.querySelector('.min-h-screen.bg-gray-50')
    expect(mainContainer).toBeInTheDocument()
    
    const innerContainer = container.querySelector('.container.mx-auto.px-4.py-8')
    expect(innerContainer).toBeInTheDocument()
    
    const contentArea = container.querySelector('.mt-8.space-y-8')
    expect(contentArea).toBeInTheDocument()
  })

  it('renders without errors', () => {
    expect(() => render(<HomePage />)).not.toThrow()
  })
})
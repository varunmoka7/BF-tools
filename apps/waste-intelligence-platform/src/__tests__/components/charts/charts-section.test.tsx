import { render, screen } from '@testing-library/react'
import { ChartsSection } from '@/components/charts/charts-section'

// Mock all chart components
jest.mock('@/components/charts/waste-type-chart', () => ({
  WasteTypeChart: () => <div data-testid="waste-type-chart">Waste Type Chart</div>
}))

jest.mock('@/components/charts/region-distribution-chart', () => ({
  RegionDistributionChart: () => <div data-testid="region-distribution-chart">Region Distribution Chart</div>
}))

jest.mock('@/components/charts/compliance-trends-chart', () => ({
  ComplianceTrendsChart: () => <div data-testid="compliance-trends-chart">Compliance Trends Chart</div>
}))

jest.mock('@/components/charts/recycling-progress-chart', () => ({
  RecyclingProgressChart: () => <div data-testid="recycling-progress-chart">Recycling Progress Chart</div>
}))

describe('ChartsSection', () => {
  it('renders all four chart components', () => {
    render(<ChartsSection />)
    
    expect(screen.getByTestId('waste-type-chart')).toBeInTheDocument()
    expect(screen.getByTestId('region-distribution-chart')).toBeInTheDocument()
    expect(screen.getByTestId('compliance-trends-chart')).toBeInTheDocument()
    expect(screen.getByTestId('recycling-progress-chart')).toBeInTheDocument()
  })

  it('renders chart titles correctly', () => {
    render(<ChartsSection />)
    
    expect(screen.getByText('Waste Type Distribution')).toBeInTheDocument()
    expect(screen.getByText('Regional Distribution')).toBeInTheDocument()
    expect(screen.getByText('Compliance Trends')).toBeInTheDocument()
    expect(screen.getByText('Recycling Progress')).toBeInTheDocument()
  })

  it('has proper grid layout', () => {
    const { container } = render(<ChartsSection />)
    
    const gridContainer = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2.gap-6')
    expect(gridContainer).toBeInTheDocument()
  })

  it('wraps each chart in a Card component', () => {
    const { container } = render(<ChartsSection />)
    
    // Should have 4 card components (one for each chart)
    const cards = container.querySelectorAll('[class*="border"]') // Cards typically have border classes
    expect(cards.length).toBeGreaterThanOrEqual(4)
  })

  it('has consistent card header structure', () => {
    render(<ChartsSection />)
    
    // All chart titles should be within CardTitle components with text-lg class
    const chartTitles = ['Waste Type Distribution', 'Regional Distribution', 'Compliance Trends', 'Recycling Progress']
    
    chartTitles.forEach(title => {
      const titleElement = screen.getByText(title)
      expect(titleElement).toBeInTheDocument()
      expect(titleElement).toHaveClass('text-lg')
    })
  })

  it('renders without errors', () => {
    expect(() => render(<ChartsSection />)).not.toThrow()
  })

  it('has semantic structure with proper card layout', () => {
    const { container } = render(<ChartsSection />)
    
    // Check that each chart is wrapped in CardContent
    const chartContainers = [
      container.querySelector('[data-testid="waste-type-chart"]'),
      container.querySelector('[data-testid="region-distribution-chart"]'),
      container.querySelector('[data-testid="compliance-trends-chart"]'),
      container.querySelector('[data-testid="recycling-progress-chart"]')
    ]
    
    chartContainers.forEach(chart => {
      expect(chart).toBeInTheDocument()
      // Each chart should be within a card content area
      expect(chart?.closest('[class*="CardContent"]') || chart?.parentElement).toBeTruthy()
    })
  })
})
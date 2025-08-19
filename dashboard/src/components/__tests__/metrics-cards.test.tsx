import { render, screen, createMockAnalytics } from '@/__tests__/utils/test-utils'
import { MetricsCards } from '../metrics-cards'

describe('MetricsCards', () => {
  it('renders all metric cards with correct titles', () => {
    const mockAnalytics = createMockAnalytics()
    
    render(<MetricsCards analytics={mockAnalytics} />)
    
    expect(screen.getByText('Total Waste')).toBeInTheDocument()
    expect(screen.getByText('Cost Savings')).toBeInTheDocument()
    expect(screen.getByText('Recycling Rate')).toBeInTheDocument()
    expect(screen.getByText('Carbon Footprint')).toBeInTheDocument()
  })

  it('displays formatted total waste value', () => {
    const mockAnalytics = createMockAnalytics({
      totalWaste: 125000,
      wasteReduction: 15.2
    })
    
    render(<MetricsCards analytics={mockAnalytics} />)
    
    expect(screen.getByText('125,000 kg')).toBeInTheDocument()
    expect(screen.getByText('15.2% reduction')).toBeInTheDocument()
  })

  it('displays formatted cost savings value', () => {
    const mockAnalytics = createMockAnalytics({
      costSavings: 45000
    })
    
    render(<MetricsCards analytics={mockAnalytics} />)
    
    expect(screen.getByText('$45,000')).toBeInTheDocument()
  })

  it('displays recycling rate with percentage', () => {
    const mockAnalytics = createMockAnalytics({
      recyclingRate: 67.8
    })
    
    render(<MetricsCards analytics={mockAnalytics} />)
    
    expect(screen.getByText('67.8%')).toBeInTheDocument()
    expect(screen.getByText('+5% from target')).toBeInTheDocument()
  })

  it('displays carbon footprint with CO2e unit', () => {
    const mockAnalytics = createMockAnalytics({
      carbonFootprint: 62.5
    })
    
    render(<MetricsCards analytics={mockAnalytics} />)
    
    expect(screen.getByText('62.5 CO2e')).toBeInTheDocument()
    expect(screen.getByText('-12% this month')).toBeInTheDocument()
  })

  it('handles zero values correctly', () => {
    const mockAnalytics = createMockAnalytics({
      totalWaste: 0,
      costSavings: 0,
      recyclingRate: 0,
      carbonFootprint: 0,
      wasteReduction: 0
    })
    
    render(<MetricsCards analytics={mockAnalytics} />)
    
    expect(screen.getByText('0 kg')).toBeInTheDocument()
    expect(screen.getByText('$0')).toBeInTheDocument()
    expect(screen.getByText('0.0%')).toBeInTheDocument()
    expect(screen.getByText('0.0 CO2e')).toBeInTheDocument()
  })

  it('handles decimal values correctly', () => {
    const mockAnalytics = createMockAnalytics({
      totalWaste: 1234.56,
      costSavings: 7890.12,
      recyclingRate: 45.67,
      carbonFootprint: 123.45,
      wasteReduction: 8.9
    })
    
    render(<MetricsCards analytics={mockAnalytics} />)
    
    expect(screen.getByText('1,235 kg')).toBeInTheDocument() // toLocaleString rounds
    expect(screen.getByText('$7,890')).toBeInTheDocument() // toLocaleString rounds
    expect(screen.getByText('45.7%')).toBeInTheDocument() // toFixed(1)
    expect(screen.getByText('123.5 CO2e')).toBeInTheDocument() // toFixed(1)
    expect(screen.getByText('8.9% reduction')).toBeInTheDocument() // toFixed(1)
  })

  it('renders all badges with positive variant', () => {
    const mockAnalytics = createMockAnalytics()
    
    render(<MetricsCards analytics={mockAnalytics} />)
    
    const badges = screen.getAllByRole('status') // badges have role="status" by default
    expect(badges).toHaveLength(4)
  })

  it('renders cards in correct grid layout structure', () => {
    const mockAnalytics = createMockAnalytics()
    
    render(<MetricsCards analytics={mockAnalytics} />)
    
    const container = screen.getByRole('grid', { hidden: true }) || screen.getByText('Total Waste').closest('.grid')
    expect(container).toHaveClass('grid', 'gap-4', 'md:grid-cols-2', 'lg:grid-cols-4')
  })

  it('has proper accessibility structure', () => {
    const mockAnalytics = createMockAnalytics()
    
    render(<MetricsCards analytics={mockAnalytics} />)
    
    // Each card should have proper header structure
    expect(screen.getByRole('heading', { name: /Total Waste/i, level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Cost Savings/i, level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Recycling Rate/i, level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Carbon Footprint/i, level: 3 })).toBeInTheDocument()
  })
})
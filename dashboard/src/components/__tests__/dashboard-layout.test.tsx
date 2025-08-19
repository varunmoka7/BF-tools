import { render, screen } from '@/__tests__/utils/test-utils'
import { DashboardLayout } from '../dashboard-layout'

describe('DashboardLayout', () => {
  it('renders the layout with header and main content', () => {
    render(
      <DashboardLayout>
        <div data-testid="test-content">Test Content</div>
      </DashboardLayout>
    )
    
    // Check header exists
    expect(screen.getByRole('banner')).toBeInTheDocument()
    
    // Check main content area exists
    expect(screen.getByRole('main')).toBeInTheDocument()
    
    // Check children are rendered
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('displays the correct application title', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )
    
    expect(screen.getByText('Waste Management BI')).toBeInTheDocument()
  })

  it('has proper semantic structure with header and main elements', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )
    
    const header = screen.getByRole('banner')
    const main = screen.getByRole('main')
    
    expect(header).toBeInTheDocument()
    expect(main).toBeInTheDocument()
    
    // Header should contain the title
    expect(header).toContainElement(screen.getByText('Waste Management BI'))
    
    // Main should contain the children
    expect(main).toContainElement(screen.getByText('Test Content'))
  })

  it('applies correct CSS classes for styling', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )
    
    // Check root container has proper background and layout
    const rootContainer = screen.getByText('Waste Management BI').closest('.min-h-screen')
    expect(rootContainer).toHaveClass('min-h-screen', 'bg-gray-50/50')
    
    // Check header styling
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('border-b', 'bg-white')
    
    // Check main content padding
    const main = screen.getByRole('main')
    expect(main).toHaveClass('p-6')
  })

  it('renders logo placeholder element', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )
    
    // Look for the green logo placeholder
    const logoElement = screen.getByText('Waste Management BI').previousElementSibling?.firstElementChild
    expect(logoElement).toHaveClass('h-8', 'w-8', 'rounded-lg', 'bg-green-600')
  })

  it('has proper header height and layout', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )
    
    const headerContent = screen.getByText('Waste Management BI').closest('.flex.h-16')
    expect(headerContent).toHaveClass('flex', 'h-16', 'items-center', 'px-6')
  })

  it('renders multiple children correctly', () => {
    render(
      <DashboardLayout>
        <div data-testid="child-1">First Child</div>
        <div data-testid="child-2">Second Child</div>
        <p data-testid="child-3">Third Child</p>
      </DashboardLayout>
    )
    
    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
    expect(screen.getByTestId('child-3')).toBeInTheDocument()
    
    expect(screen.getByText('First Child')).toBeInTheDocument()
    expect(screen.getByText('Second Child')).toBeInTheDocument()
    expect(screen.getByText('Third Child')).toBeInTheDocument()
  })

  it('handles empty children gracefully', () => {
    render(<DashboardLayout>{null}</DashboardLayout>)
    
    // Layout structure should still be present
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByText('Waste Management BI')).toBeInTheDocument()
  })

  it('maintains consistent spacing and typography', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )
    
    // Check title styling
    const title = screen.getByText('Waste Management BI')
    expect(title).toHaveClass('text-xl', 'font-semibold')
    
    // Check logo and title container spacing
    const logoTitleContainer = title.closest('.flex.items-center.space-x-2')
    expect(logoTitleContainer).toHaveClass('flex', 'items-center', 'space-x-2')
    
    // Check outer container spacing
    const outerContainer = logoTitleContainer?.closest('.flex.items-center.space-x-4')
    expect(outerContainer).toHaveClass('flex', 'items-center', 'space-x-4')
  })

  it('renders as a functional layout component', () => {
    // Test that the component actually functions as a layout wrapper
    const TestComponent = () => (
      <DashboardLayout>
        <h1>Page Title</h1>
        <div>Page content goes here</div>
        <footer>Footer content</footer>
      </DashboardLayout>
    )
    
    render(<TestComponent />)
    
    // All content should be wrapped properly
    expect(screen.getByText('Page Title')).toBeInTheDocument()
    expect(screen.getByText('Page content goes here')).toBeInTheDocument()
    expect(screen.getByText('Footer content')).toBeInTheDocument()
    
    // Layout elements should still be present
    expect(screen.getByText('Waste Management BI')).toBeInTheDocument()
  })
})
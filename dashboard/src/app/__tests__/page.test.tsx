import { render, screen } from '@/__tests__/utils/test-utils'
import Home from '../page'

// Mock Next.js navigation
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}))

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders redirect message', () => {
    render(<Home />)
    expect(screen.getByText('Redirecting to company directory...')).toBeInTheDocument()
  })

  it('redirects to companies page on mount', () => {
    render(<Home />)
    expect(mockReplace).toHaveBeenCalledWith('/companies')
  })

  it('has proper page structure', () => {
    render(<Home />)
    
    // Check if the container has proper styling
    const container = screen.getByText('Redirecting to company directory...').closest('div')
    expect(container).toHaveClass('text-lg', 'text-muted-foreground')
  })
})
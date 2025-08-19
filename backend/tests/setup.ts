/**
 * Test setup configuration
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:'; // Use in-memory database for tests

// Global test configuration
jest.setTimeout(30000);

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  createMockCompany: (overrides = {}) => ({
    id: 'test-company-1',
    company_name: 'Test Company',
    country: 'Germany',
    sector: 'Industrials',
    industry: 'Manufacturing',
    employees: 1000,
    year_of_disclosure: 2024,
    ...overrides
  }),

  createMockWasteData: (overrides = {}) => ({
    total_waste_generated: 10000,
    total_waste_recovered: 7500,
    recovery_rate: 75.0,
    reporting_period: 2024,
    ...overrides
  })
};

export {};
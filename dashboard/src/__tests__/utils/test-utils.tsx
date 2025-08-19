import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { WasteAnalytics, Company, WasteData } from '@/types/waste'

// Custom render function that includes providers
const customRender = (ui: React.ReactElement, options?: RenderOptions) => {
  return render(ui, {
    // Add any providers here if needed in the future
    ...options,
  })
}

// Mock analytics data for testing
export const createMockAnalytics = (overrides: Partial<WasteAnalytics> = {}): WasteAnalytics => ({
  totalWaste: 125000,
  wasteReduction: 15.2,
  costSavings: 45000,
  recyclingRate: 67.8,
  carbonFootprint: 62.5,
  ...overrides,
})

// Mock company data for testing
export const createMockCompany = (overrides: Partial<Company> = {}): Company => ({
  id: '1',
  name: 'Test Company',
  industry: 'Manufacturing',
  size: 'large',
  location: 'New York',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

// Mock waste data for testing
export const createMockWasteData = (overrides: Partial<WasteData> = {}): WasteData => ({
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
  ...overrides,
})

// Helper to wait for loading states
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// This file exports utilities for tests - not a test file itself
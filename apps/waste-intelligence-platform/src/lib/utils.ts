import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

export function getComplianceColor(score: number): string {
  if (score >= 90) return 'text-green-600'
  if (score >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

export function getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up': return '↗'
    case 'down': return '↘'
    default: return '→'
  }
}

export function generateMockCoordinates(country: string): [number, number] {
  // Mock coordinates for common countries in waste management
  const countryCoords: Record<string, [number, number]> = {
    'USA': [39.8283, -98.5795],
    'Germany': [51.1657, 10.4515],
    'Japan': [36.2048, 138.2529],
    'UK': [55.3781, -3.4360],
    'France': [46.2276, 2.2137],
    'Canada': [56.1304, -106.3468],
    'Australia': [-25.2744, 133.7751],
    'Netherlands': [52.1326, 5.2913],
    'Sweden': [60.1282, 18.6435],
    'China': [35.8617, 104.1954]
  }
  
  return countryCoords[country] || [0, 0]
}
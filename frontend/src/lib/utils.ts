import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number, options?: { compact?: boolean; unit?: string; decimals?: number }): string {
  let formatted = num.toString()
  
  if (options?.compact) {
    if (num >= 1000000) {
      formatted = (num / 1000000).toFixed(options.decimals || 1) + 'M'
    } else if (num >= 1000) {
      formatted = (num / 1000).toFixed(options.decimals || 1) + 'K'
    }
  } else if (options?.decimals !== undefined) {
    formatted = num.toFixed(options.decimals)
  }
  
  if (options?.unit) {
    formatted += options.unit
  }
  
  return formatted
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

export function getPerformanceColor(rating: string): string {
  switch (rating.toLowerCase()) {
    case 'excellent':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'good':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'average':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'poor':
      return 'text-red-600 bg-red-50 border-red-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getWasteColorIntensity(wasteValue: number, maxWaste: number): string {
  const intensity = Math.min(wasteValue / maxWaste, 1)
  if (intensity > 0.8) return 'bg-red-500'
  if (intensity > 0.6) return 'bg-orange-500'
  if (intensity > 0.4) return 'bg-yellow-500'
  if (intensity > 0.2) return 'bg-blue-500'
  return 'bg-green-500'
}

export function getTrendIcon(change: number): string {
  if (change > 0) return '↗️'
  if (change < 0) return '↘️'
  return '→'
}
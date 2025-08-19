import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number, options?: {
  decimals?: number
  unit?: string
  compact?: boolean
}): string {
  const { decimals = 0, unit = '', compact = false } = options || {}
  
  if (compact && value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M${unit}`
  } else if (compact && value >= 1000) {
    return `${(value / 1000).toFixed(1)}K${unit}`
  }
  
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}${unit}`
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function getPerformanceColor(rating: 'leader' | 'average' | 'hotspot'): string {
  switch (rating) {
    case 'leader':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'average':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'hotspot':
      return 'text-red-600 bg-red-50 border-red-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getTrendIcon(change: number): string {
  return change > 0 ? '↗' : change < 0 ? '↘' : '→'
}

export function getWasteColorIntensity(recoveryRate: number): string {
  if (recoveryRate >= 80) return '#22c55e' // green-500
  if (recoveryRate >= 60) return '#84cc16' // lime-500  
  if (recoveryRate >= 40) return '#eab308' // yellow-500
  if (recoveryRate >= 20) return '#f97316' // orange-500
  return '#ef4444' // red-500
}
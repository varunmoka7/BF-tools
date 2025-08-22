'use client'

import React, { useMemo } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { useCompanies } from '@/contexts/companies-context'

ChartJS.register(ArcElement, Tooltip, Legend)

// Color scheme for sectors - memoized to prevent recreating on every render
const SECTOR_COLORS = [
  '#FF6B35', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F1948A', '#BDC3C7'
] as const

// Fallback data for error states
const FALLBACK_CHART_DATA = {
  labels: ['Industrials', 'Consumer Cyclical', 'Healthcare', 'Financial Services', 'Basic Materials', 'Technology', 'Utilities', 'Consumer Defensive', 'Real Estate', 'Communication Services', 'Energy', 'Unknown'],
  datasets: [{
    data: [71, 42, 37, 36, 35, 26, 19, 16, 14, 13, 9, 7],
    backgroundColor: SECTOR_COLORS,
    borderColor: SECTOR_COLORS.map(color => color + '80'),
    borderWidth: 2,
  }]
}

export const SectorBreakdownChart = React.memo(() => {
  const { companies, loading, error } = useCompanies()

  // Memoize chart data - ALWAYS call hooks at top level
  const chartData = useMemo(() => {
    if (!companies || companies.length === 0) {
      return FALLBACK_CHART_DATA
    }

    // Calculate sector distribution
    const sectorCounts = companies.reduce((acc, company) => {
      acc[company.sector] = (acc[company.sector] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Sort sectors by company count
    const sortedSectors = Object.entries(sectorCounts)
      .sort(([,a], [,b]) => b - a)
    
    const labels = sortedSectors.map(([sector]) => sector)
    const data = sortedSectors.map(([, count]) => count)
    
    return {
      labels,
      datasets: [{
        data,
        backgroundColor: SECTOR_COLORS.slice(0, labels.length),
        borderColor: SECTOR_COLORS.slice(0, labels.length).map(color => color + '80'),
        borderWidth: 2,
      }]
    }
  }, [companies])

  // Memoize chart options - ALWAYS call hooks at top level
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || ''
            const value = context.parsed
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value} companies (${percentage}%)`
          }
        }
      }
    }
  }), [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Error loading chart data
      </div>
    )
  }

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  )
})

SectorBreakdownChart.displayName = 'SectorBreakdownChart'

'use client'

import React, { useState, useEffect } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Fallback data for error states
const FALLBACK_CHART_DATA = {
  labels: ['France', 'Germany', 'Switzerland', 'Italy', 'Luxembourg', 'Austria', 'Belgium'],
  datasets: [
    {
      label: 'Number of Companies',
      data: [82, 78, 66, 56, 16, 14, 13],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
      yAxisID: 'y',
    }
  ]
}

export const CountryCoverageChart = React.memo(() => {
  const [chartData, setChartData] = useState(FALLBACK_CHART_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/charts/country-coverage')
        const result = await response.json()
        
        if (result.success) {
          setChartData(result.data)
          console.log('Country coverage chart data loaded:', result.data)
        } else {
          console.error('Failed to fetch country coverage data:', result.error)
          setError(result.error || 'Failed to load chart data')
        }
      } catch (error) {
        console.error('Error fetching country coverage data:', error)
        setError('Network error while loading chart data')
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [])

  // Memoize chart options to prevent unnecessary re-renders
  const options = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Countries'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Number of Companies'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            return `${label}: ${value} companies`
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
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2">Error loading chart data</p>
          <p className="text-xs text-gray-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  )
})

CountryCoverageChart.displayName = 'CountryCoverageChart'

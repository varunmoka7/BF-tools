'use client'

import React, { useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useCompanies } from '@/contexts/companies-context'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const FALLBACK_LABELS = ['France', 'Germany', 'Switzerland', 'Italy', 'Luxembourg', 'Austria', 'Belgium']
const FALLBACK_COUNTS = [82, 78, 66, 56, 16, 14, 13]

export const CountryCoverageChart = React.memo(() => {
  const { companies, loading, error } = useCompanies()

  const chartData = useMemo(() => {
    if (!companies || companies.length === 0) {
      return {
        labels: FALLBACK_LABELS,
        datasets: [
          {
            label: 'Number of Companies',
            data: FALLBACK_COUNTS,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            borderRadius: 6,
            yAxisID: 'y',
          }
        ]
      }
    }

    const counts = companies.reduce((acc, company) => {
      acc[company.country] = (acc[company.country] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const sorted = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    const labels = sorted.map(([country]) => country)
    const data = sorted.map(([, count]) => count)

    return {
      labels,
      datasets: [
        {
          label: 'Number of Companies',
          data,
          backgroundColor: 'rgba(59, 130, 246, 0.85)',
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
          hoverBorderColor: 'rgba(37, 99, 235, 1)',
          yAxisID: 'y',
        }
      ]
    }
  }, [companies])

  const options = useMemo(() => ({
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

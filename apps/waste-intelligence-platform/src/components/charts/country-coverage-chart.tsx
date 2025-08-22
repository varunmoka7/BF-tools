'use client'

import React, { useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useCompanies } from '@/contexts/companies-context'

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
    },
    {
      label: 'Total Employees (K)',
      data: [3200, 2800, 2400, 2100, 800, 600, 500],
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 1,
      yAxisID: 'y1',
    }
  ]
}

export const CountryCoverageChart = React.memo(() => {
  const { companies, loading, error } = useCompanies()

  const chartData = useMemo(() => {
    if (!companies || companies.length === 0) {
      return FALLBACK_CHART_DATA
    }

    // Calculate country distribution
    const countryCounts = companies.reduce((acc, company) => {
      acc[company.country] = (acc[company.country] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Sort countries by company count
    const sortedCountries = Object.entries(countryCounts)
      .sort(([,a], [,b]) => b - a)
    
    const labels = sortedCountries.map(([country]) => country)
    const data = sortedCountries.map(([, count]) => count)
    
    // Calculate total employees per country
    const countryEmployees = companies.reduce((acc, company) => {
      acc[company.country] = (acc[company.country] || 0) + company.employees
      return acc
    }, {} as Record<string, number>)
    
    const employeeData = labels.map(country => countryEmployees[country])
    
    return {
      labels,
      datasets: [
        {
          label: 'Number of Companies',
          data,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: 'Total Employees (K)',
          data: employeeData.map(emp => Math.round(emp / 1000)),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
          yAxisID: 'y1',
        }
      ]
    }
  }, [companies])

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

  // Memoize chart options to prevent unnecessary re-renders
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
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Total Employees (K)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
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
            if (label.includes('Employees')) {
              return `${label}: ${value}K employees`
            }
            return `${label}: ${value} companies`
          }
        }
      }
    }
  }), [])

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  )
})

CountryCoverageChart.displayName = 'CountryCoverageChart'

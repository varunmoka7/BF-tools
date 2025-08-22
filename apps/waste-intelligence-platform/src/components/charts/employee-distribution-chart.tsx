'use client'

import React, { useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useCompanies } from '@/contexts/companies-context'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Define employee size categories - memoized
const SIZE_CATEGORIES = [
  { name: 'Small (< 1K)', min: 0, max: 999 },
  { name: 'Medium (1K-5K)', min: 1000, max: 4999 },
  { name: 'Large (5K-25K)', min: 5000, max: 24999 },
  { name: 'Enterprise (25K-100K)', min: 25000, max: 99999 },
  { name: 'Mega (> 100K)', min: 100000, max: Infinity }
] as const

// Fallback data for error states
const FALLBACK_CHART_DATA = {
  labels: ['Small (< 1K)', 'Medium (1K-5K)', 'Large (5K-25K)', 'Enterprise (25K-100K)', 'Mega (> 100K)'],
  datasets: [
    {
      label: 'Number of Companies',
      data: [45, 78, 95, 67, 40],
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 1,
      yAxisID: 'y',
    },
    {
      label: 'Total Employees (K)',
      data: [25, 180, 850, 2800, 8500],
      backgroundColor: 'rgba(34, 197, 94, 0.8)',
      borderColor: 'rgba(34, 197, 94, 1)',
      borderWidth: 1,
      yAxisID: 'y1',
    }
  ]
}

export const EmployeeDistributionChart = React.memo(() => {
  const { companies, loading, error } = useCompanies()

  // Memoize chart data - ALWAYS call hooks at top level
  const chartData = useMemo(() => {
    if (!companies || companies.length === 0) {
      return FALLBACK_CHART_DATA
    }

    // Count companies in each category
    const categoryCounts = SIZE_CATEGORIES.map(category => {
      return companies.filter(company => 
        company.employees >= category.min && company.employees <= category.max
      ).length
    })

    // Calculate total employees per category
    const categoryEmployees = SIZE_CATEGORIES.map(category => {
      const totalEmployees = companies
        .filter(company => company.employees >= category.min && company.employees <= category.max)
        .reduce((sum, company) => sum + company.employees, 0)
      return Math.round(totalEmployees / 1000) // Convert to thousands
    })
    
    return {
      labels: SIZE_CATEGORIES.map(cat => cat.name),
      datasets: [
        {
          label: 'Number of Companies',
          data: categoryCounts,
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: 'Total Employees (K)',
          data: categoryEmployees,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
          yAxisID: 'y1',
        }
      ]
    }
  }, [companies])

  // Memoize chart options - ALWAYS call hooks at top level  
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
          text: 'Company Size by Employees'
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
      <Bar data={chartData} options={options} />
    </div>
  )
})

EmployeeDistributionChart.displayName = 'EmployeeDistributionChart'
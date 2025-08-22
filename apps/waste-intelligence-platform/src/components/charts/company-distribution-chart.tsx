'use client'

import React, { useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useCompanies } from '@/contexts/companies-context'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Company size categories - memoized
const SIZE_CATEGORIES = [
  { name: 'Micro (< 100)', min: 0, max: 99 },
  { name: 'Small (100-500)', min: 100, max: 499 },
  { name: 'Medium (500-2K)', min: 500, max: 1999 },
  { name: 'Large (2K-10K)', min: 2000, max: 9999 },
  { name: 'Enterprise (10K-50K)', min: 10000, max: 49999 },
  { name: 'Mega (50K+)', min: 50000, max: Infinity }
] as const

// Fallback data for error states
const FALLBACK_CHART_DATA = {
  labels: ['Micro (< 100)', 'Small (100-500)', 'Medium (500-2K)', 'Large (2K-10K)', 'Enterprise (10K-50K)', 'Mega (50K+)'],
  datasets: [
    {
      label: 'Number of Companies',
      data: [12, 28, 45, 78, 95, 67],
      backgroundColor: 'rgba(168, 85, 247, 0.8)',
      borderColor: 'rgba(168, 85, 247, 1)',
      borderWidth: 1,
      yAxisID: 'y',
    },
    {
      label: 'Average Employees',
      data: [50, 250, 1000, 5000, 25000, 75000],
      backgroundColor: 'rgba(251, 146, 60, 0.8)',
      borderColor: 'rgba(251, 146, 60, 1)',
      borderWidth: 1,
      yAxisID: 'y1',
    }
  ]
}

export const CompanyDistributionChart = React.memo(() => {
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

    // Calculate average employees per category
    const categoryAverages = SIZE_CATEGORIES.map(category => {
      const categoryCompanies = companies.filter(company => 
        company.employees >= category.min && company.employees <= category.max
      )
      
      if (categoryCompanies.length === 0) return 0
      
      const totalEmployees = categoryCompanies.reduce((sum, company) => sum + company.employees, 0)
      return Math.round(totalEmployees / categoryCompanies.length)
    })
    
    return {
      labels: SIZE_CATEGORIES.map(cat => cat.name),
      datasets: [
        {
          label: 'Number of Companies',
          data: categoryCounts,
          backgroundColor: 'rgba(168, 85, 247, 0.8)',
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: 'Average Employees',
          data: categoryAverages,
          backgroundColor: 'rgba(251, 146, 60, 0.8)',
          borderColor: 'rgba(251, 146, 60, 1)',
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
          text: 'Company Size Categories'
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
          text: 'Average Employees'
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
            if (label.includes('Average')) {
              return `${label}: ${value} employees`
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

CompanyDistributionChart.displayName = 'CompanyDistributionChart'
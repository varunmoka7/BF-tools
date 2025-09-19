'use client'

import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts'
import { useCompanies } from '@/contexts/companies-context'

const FALLBACK_COUNTRY_DATA = [
  { country: 'France', companies: 82 },
  { country: 'Germany', companies: 78 },
  { country: 'Switzerland', companies: 66 },
  { country: 'Italy', companies: 56 },
  { country: 'Luxembourg', companies: 16 },
  { country: 'Austria', companies: 14 },
  { country: 'Belgium', companies: 13 }
]

interface CountryDatum {
  country: string
  companies: number
}

export const CountryCoverageChart = React.memo(() => {
  const { companies, loading, error } = useCompanies()

  const chartData = useMemo<CountryDatum[]>(() => {
    if (!companies || companies.length === 0) {
      return FALLBACK_COUNTRY_DATA
    }

    const counts = companies.reduce((acc, company) => {
      acc[company.country] = (acc[company.country] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([country, count]) => ({ country, companies: count }))
  }, [companies])

  if (loading) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center text-gray-500">
        <div className="text-center space-y-1">
          <p className="text-sm text-gray-400">Error loading chart data</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-[360px] flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 32, left: 120, bottom: 8 }}
          barSize={18}
        >
          <CartesianGrid horizontal={false} strokeDasharray="2 4" stroke="#e5e7eb" />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: '#1f2937' }}
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={false}
            domain={[0, 'dataMax + 5']}
          />
          <YAxis
            dataKey="country"
            type="category"
            tick={{ fontSize: 13, fill: '#111827' }}
            width={110}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number | string) => {
              const parsed = typeof value === 'number' ? value : Number(value)
              return [`${parsed} companies`, 'Companies']
            }}
            separator=""
            contentStyle={{
              borderRadius: 12,
              borderColor: '#e5e7eb',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)'
            }}
            itemStyle={{ color: '#111827', fontWeight: 500 }}
            labelStyle={{ color: '#4b5563', fontWeight: 500 }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            formatter={() => 'Companies'}
          />
          <Bar
            dataKey="companies"
            name="Companies"
            fill="#3b82f6"
            stroke="#1d4ed8"
            strokeWidth={1.5}
            radius={[0, 10, 10, 0]}
            background={{ fill: '#f3f4f6', radius: [0, 10, 10, 0] }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
})

CountryCoverageChart.displayName = 'CountryCoverageChart'

'use client'

import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  XAxisProps
} from 'recharts'
import { useCompanies } from '@/contexts/companies-context'

const SIZE_CATEGORIES = [
  { name: 'Micro', label: 'Micro\n<100', rangeLabel: 'Micro (< 100)', min: 0, max: 99 },
  { name: 'Small', label: 'Small\n100-500', rangeLabel: 'Small (100-500)', min: 100, max: 499 },
  { name: 'Medium', label: 'Medium\n500-2K', rangeLabel: 'Medium (500-2K)', min: 500, max: 1999 },
  { name: 'Large', label: 'Large\n2K-10K', rangeLabel: 'Large (2K-10K)', min: 2000, max: 9999 },
  { name: 'Enterprise', label: 'Enterprise\n10K-50K', rangeLabel: 'Enterprise (10K-50K)', min: 10000, max: 49999 },
  { name: 'Mega', label: 'Mega\n50K+', rangeLabel: 'Mega (50K+)', min: 50000, max: Infinity }
] as const

const FALLBACK_COMPANY_COUNTS = [12, 28, 45, 78, 95, 67]
const FALLBACK_AVG_EMPLOYEES = [50, 250, 1000, 5000, 25000, 75000]

interface CompanySizeDatum {
  name: string
  label: string
  rangeLabel: string
  companyCount: number
  avgEmployees: number
}

const CategoryTick = ({ x, y, payload }: Parameters<NonNullable<XAxisProps['tick']>>[0]) => {
  const lines = String(payload.value).split('\n')

  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill="#1f2937" fontSize={12} fontWeight={500}>
        {lines.map((line, index) => (
          <tspan key={line} x={0} dy={index === 0 ? 0 : 14}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  )
}

export const CompanyDistributionChart = React.memo(() => {
  const { companies, loading, error } = useCompanies()

  const chartData = useMemo<CompanySizeDatum[]>(() => {
    if (!companies || companies.length === 0) {
      return SIZE_CATEGORIES.map((category, index) => ({
        name: category.name,
        label: category.label,
        rangeLabel: category.rangeLabel,
        companyCount: FALLBACK_COMPANY_COUNTS[index] || 0,
        avgEmployees: FALLBACK_AVG_EMPLOYEES[index] || 0
      }))
    }

    return SIZE_CATEGORIES.map((category) => {
      const companiesInRange = companies.filter(
        (company) =>
          company.employees >= category.min && company.employees <= category.max
      )

      const companyCount = companiesInRange.length
      const avgEmployees = companyCount
        ? Math.round(
            companiesInRange.reduce((sum, company) => sum + company.employees, 0) /
              companyCount
          )
        : 0

      return {
        name: category.name,
        label: category.label,
        rangeLabel: category.rangeLabel,
        companyCount,
        avgEmployees
      }
    })
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
        Error loading chart data
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-[360px] flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 12, right: 32, left: 12, bottom: 24 }}>
          <CartesianGrid vertical={false} strokeDasharray="2 4" stroke="#e5e7eb" />
          <XAxis
            dataKey="label"
            interval={0}
            tick={<CategoryTick />}
            tickLine={false}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12, fill: '#1f2937' }}
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={false}
            label={{ value: 'Companies', angle: -90, position: 'insideLeft', offset: 10 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: '#1f2937' }}
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={false}
            label={{ value: 'Avg Employees', angle: 90, position: 'insideRight', offset: 10 }}
          />
          <Tooltip
            formatter={(value: number | string, name: string) => {
              const numericValue = typeof value === 'number' ? value : Number(value)
              if (name === 'Average Employees') {
                return [`${numericValue.toLocaleString()} employees`, name]
              }
              return [`${numericValue} companies`, name]
            }}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.rangeLabel ?? ''}
            contentStyle={{
              borderRadius: 12,
              borderColor: '#e5e7eb',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)'
            }}
            itemStyle={{ color: '#111827', fontWeight: 500 }}
            labelStyle={{ color: '#4b5563', fontWeight: 500 }}
          />
          <Legend verticalAlign="top" align="right" iconType="circle" />
          <Bar
            yAxisId="left"
            dataKey="companyCount"
            name="Companies"
            fill="#a855f7"
            stroke="#6b21a8"
            strokeWidth={1.5}
            radius={[10, 10, 10, 10]}
            maxBarSize={48}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgEmployees"
            name="Average Employees"
            stroke="#f97316"
            strokeWidth={3}
            dot={{ r: 4, fill: '#f97316', strokeWidth: 0 }}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
})

CompanyDistributionChart.displayName = 'CompanyDistributionChart'

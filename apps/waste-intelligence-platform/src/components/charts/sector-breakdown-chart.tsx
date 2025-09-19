'use client'

import React, { useMemo } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { useCompanies } from '@/contexts/companies-context'

const SECTOR_COLORS = [
  '#FF6B35',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
  '#F1948A',
  '#FCD34D',
  '#60A5FA',
  '#F87171',
  '#D1D5DB'
] as const

const FALLBACK_SECTOR_DATA = [
  { name: 'Industrials', value: 71 },
  { name: 'Consumer Cyclical', value: 42 },
  { name: 'Healthcare', value: 37 },
  { name: 'Financial Services', value: 36 },
  { name: 'Basic Materials', value: 35 },
  { name: 'Technology', value: 26 },
  { name: 'Utilities', value: 19 },
  { name: 'Consumer Defensive', value: 16 },
  { name: 'Real Estate', value: 14 },
  { name: 'Communication Services', value: 13 },
  { name: 'Energy', value: 9 },
  { name: 'Unknown', value: 7 }
]

interface SectorDatum {
  name: string
  value: number
  percentage: number
}

export const SectorBreakdownChart = React.memo(() => {
  const { companies, loading, error } = useCompanies()

  const sectorData = useMemo<SectorDatum[]>(() => {
    const baseData = (() => {
      if (!companies || companies.length === 0) {
        return FALLBACK_SECTOR_DATA
      }

      const sectorCounts = companies.reduce((acc, company) => {
        acc[company.sector] = (acc[company.sector] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return Object.entries(sectorCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([name, value]) => ({ name, value }))
    })()

    const total = baseData.reduce((sum, item) => sum + item.value, 0) || 1
    return baseData.map((item) => ({
      ...item,
      percentage: Number(((item.value / total) * 100).toFixed(1))
    }))
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
    <div className="flex h-full min-h-[360px] flex-col gap-8 lg:flex-row lg:items-center">
      <div className="mx-auto flex w-full min-w-[260px] max-w-[320px] flex-shrink-0 items-center justify-center lg:mx-0">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={sectorData}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={115}
              paddingAngle={1.5}
              dataKey="value"
              stroke="#1f2937"
              strokeWidth={2}
              labelLine={false}
            >
              {sectorData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={SECTOR_COLORS[index % SECTOR_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, props) => {
                const percentage = props?.payload?.percentage ?? 0
                return [`${value} companies`, `${name} (${percentage.toFixed(1)}%)`]
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
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-1 flex-col justify-center">
        <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 xl:grid-cols-1" style={{ minWidth: '180px' }}>
          {sectorData.map((entry, index) => {
            const color = SECTOR_COLORS[index % SECTOR_COLORS.length]
            return (
              <div key={entry.name} className="flex items-center gap-2 leading-tight">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[11px] font-medium text-slate-700">
                  {entry.name}
                  <span className="ml-1 text-slate-500">({entry.percentage.toFixed(1)}%)</span>
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})

SectorBreakdownChart.displayName = 'SectorBreakdownChart'

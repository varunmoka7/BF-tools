'use client'

import React, { useMemo, useCallback } from 'react'
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

  const renderSectorLabel = useCallback(
    ({
      cx,
      cy,
      midAngle,
      outerRadius,
      index,
      percent
    }: {
      cx: number
      cy: number
      midAngle: number
      outerRadius: number | string
      index: number
      percent: number
    }) => {
      const entry = sectorData[index]

      if (!entry || typeof outerRadius !== 'number') {
        return null
      }

      // Show labels for segments >= 3% to avoid overcrowding
      if (entry.percentage < 3) {
        return null
      }

      const RADIAN = Math.PI / 180
      const radius = outerRadius + 20
      const x = cx + radius * Math.cos(-midAngle * RADIAN)
      const y = cy + radius * Math.sin(-midAngle * RADIAN)

      // Determine label alignment based on position
      const isRightSide = x > cx
      const textAnchor = isRightSide ? 'start' : 'end'

      // Truncate long sector names for better fit
      const displayName = entry.name.length > 12 ? entry.name.substring(0, 12) + '...' : entry.name

      return (
        <text
          x={x}
          y={y}
          fill="#1e293b"
          textAnchor={textAnchor}
          dominantBaseline="middle"
          fontSize={10}
          fontWeight={600}
          className="select-none"
        >
          {displayName}
          <tspan
            x={x}
            dy={12}
            fontSize={9}
            fontWeight={500}
            fill="#64748b"
          >
            {`${entry.percentage.toFixed(1)}%`}
          </tspan>
        </text>
      )
    },
    [sectorData]
  )

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
    <div className="flex h-full min-h-[380px] flex-col gap-4">
      {/* Chart Container - Optimized for better fit */}
      <div className="flex flex-1 flex-col lg:flex-row lg:items-center lg:gap-6">
        {/* Pie Chart */}
        <div className="flex flex-1 items-center justify-center">
          <div className="relative w-full max-w-[280px] lg:max-w-[300px]">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={1}
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  labelLine={false}
                  label={renderSectorLabel}
                >
                  {sectorData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={SECTOR_COLORS[index % SECTOR_COLORS.length]}
                      className="hover:opacity-80 transition-opacity duration-200"
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
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    fontSize: 12
                  }}
                  itemStyle={{ color: '#1e293b', fontWeight: 500 }}
                  labelStyle={{ color: '#64748b', fontWeight: 500 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enhanced Legend */}
        <div className="flex flex-1 items-start lg:max-w-[280px]">
          <div className="w-full">
            <h4 className="mb-3 text-sm font-semibold text-slate-700">Sectors ({sectorData.length})</h4>
            <div className="max-h-[240px] overflow-y-auto pr-2 space-y-2">
              {sectorData.map((entry, index) => {
                const color = SECTOR_COLORS[index % SECTOR_COLORS.length]
                return (
                  <div
                    key={entry.name}
                    className="flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-slate-50 transition-colors duration-150"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className="h-3 w-3 flex-shrink-0 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                      <span
                        className="text-xs font-medium text-slate-700 truncate"
                        title={entry.name}
                      >
                        {entry.name}
                      </span>
                    </div>
                    <div className="flex flex-col items-end text-right flex-shrink-0">
                      <span className="text-xs font-semibold text-slate-900">
                        {entry.value}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        {entry.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary Stats */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <div className="text-[10px] text-slate-500">
                Total: {sectorData.reduce((sum, item) => sum + item.value, 0)} companies
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

SectorBreakdownChart.displayName = 'SectorBreakdownChart'

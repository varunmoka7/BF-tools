'use client'

import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface HazardousBreakdownData {
  name: string
  value: number
  percentage: number
}

const COLORS = {
  'Hazardous': '#ef4444',
  'Non-Hazardous': '#22c55e',
  'Recovered': '#3b82f6',
  'Disposed': '#f97316'
}

export function HazardousWasteBreakdownChart() {
  const [data, setData] = useState<HazardousBreakdownData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHazardousBreakdown = async () => {
      try {
        const response = await fetch('/api/charts/hazardous-breakdown')
        if (!response.ok) {
          throw new Error('Failed to fetch hazardous breakdown data')
        }
        const result = await response.json()
        if (result.success) {
          setData(result.data)
        } else {
          throw new Error(result.error || 'Failed to load hazardous breakdown')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchHazardousBreakdown()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading hazardous waste breakdown...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center">
        <div className="text-gray-500">No hazardous breakdown data available</div>
      </div>
    )
  }

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    payload
  }: {
    cx: number
    cy: number
    midAngle: number
    outerRadius: number
    percent: number
    payload: HazardousBreakdownData
  }) => {
    const computedPercentage =
      typeof payload?.percentage === 'number'
        ? payload.percentage
        : Math.round((percent || 0) * 1000) / 10

    if (computedPercentage < 2) return null

    const RADIAN = Math.PI / 180
    const radius = outerRadius + 18
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="#111827"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="middle"
        fontSize={13}
        fontWeight={600}
      >
        {payload.name}
        <tspan
          x={x}
          dy={16}
          fontSize={12}
          fontWeight={500}
          fill="#4b5563"
        >
          {`${computedPercentage.toFixed(1)}%`}
        </tspan>
      </text>
    )
  }

  return (
    <div className="flex h-full min-h-[320px] flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
            labelLine={false}
            label={renderCustomizedLabel}
            dataKey="value"
            stroke="#1f2937"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#6b7280'} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${(value / 1000).toFixed(1)}K MT`,
              name
            ]}
            separator=":"
            contentStyle={{
              borderRadius: 12,
              borderColor: '#e5e7eb',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)'
            }}
            itemStyle={{ color: '#111827', fontWeight: 500 }}
            labelStyle={{ color: '#4b5563', fontWeight: 500 }}
          />
          <Legend
            verticalAlign="bottom"
            height={48}
            iconType="circle"
            formatter={(value) => {
              const matched = data.find((entry) => entry.name === value)
              return `${value} (${matched ? matched.percentage.toFixed(1) : '0.0'}%)`
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

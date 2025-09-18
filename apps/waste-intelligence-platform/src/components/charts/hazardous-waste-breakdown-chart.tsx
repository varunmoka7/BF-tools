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
  console.log('🔥🔥 HazardousWasteBreakdownChart COMPONENT MOUNTING!')
  const [data, setData] = useState<HazardousBreakdownData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log('🔥 HazardousWasteBreakdownChart render state:', { data, loading, error })

  useEffect(() => {
    console.log('🔥 HazardousWasteBreakdownChart useEffect triggered!')
    const fetchHazardousBreakdown = async () => {
      console.log('🔥 HazardousWasteBreakdownChart fetchHazardousBreakdown starting...')
      try {
        const response = await fetch('/api/charts/hazardous-breakdown')
        if (!response.ok) {
          throw new Error('Failed to fetch hazardous breakdown data')
        }
        const result = await response.json()
        console.log('🔥 HazardousWasteBreakdownChart API response:', result)
        if (result.success) {
          setData(result.data)
          console.log('🔥 HazardousWasteBreakdownChart data set:', result.data)
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
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading hazardous waste breakdown...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-gray-500">No hazardous breakdown data available</div>
      </div>
    )
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 5) return null // Don't show labels for very small slices
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${percentage.toFixed(1)}%`}
      </text>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
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
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => (
              <span className="text-sm">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
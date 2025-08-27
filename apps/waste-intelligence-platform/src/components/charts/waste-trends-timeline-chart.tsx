'use client'

import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface WasteTrendsData {
  year: string
  totalGenerated: number
  totalRecovered: number
  recoveryRate: number
}

export function WasteTrendsTimelineChart() {
  const [data, setData] = useState<WasteTrendsData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWasteTrends = async () => {
      try {
        const response = await fetch('/api/charts/waste-trends')
        if (!response.ok) {
          throw new Error('Failed to fetch waste trends data')
        }
        const result = await response.json()
        if (result.success) {
          setData(result.data)
        } else {
          throw new Error(result.error || 'Failed to load waste trends')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchWasteTrends()
  }, [])

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading waste trends...</div>
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
        <div className="text-gray-500">No waste trends data available</div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="year" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K MT`}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'recoveryRate') {
                return [`${value.toFixed(1)}%`, 'Recovery Rate']
              }
              return [`${(value / 1000).toFixed(1)}K MT`, name === 'totalGenerated' ? 'Generated' : 'Recovered']
            }}
            labelFormatter={(label) => `Year: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="totalGenerated" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="totalRecovered" 
            stroke="#22c55e" 
            strokeWidth={2}
            dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
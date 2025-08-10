'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { mockChartData } from '@/data/mock-data'
import { formatNumber } from '@/lib/utils'

export function RegionDistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={mockChartData.regionDistribution}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          fontSize={12}
          tickFormatter={(value) => formatNumber(value)}
        />
        <Tooltip 
          formatter={(value) => [formatNumber(Number(value)) + ' tons', 'Volume']}
        />
        <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
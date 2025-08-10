'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { mockChartData } from '@/data/mock-data'

export function RecyclingProgressChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={mockChartData.recyclingProgress}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis 
          fontSize={12} 
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip 
          formatter={(value) => [`${value}%`, 'Recycling Rate']}
        />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="#16a34a" 
          fill="#16a34a" 
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
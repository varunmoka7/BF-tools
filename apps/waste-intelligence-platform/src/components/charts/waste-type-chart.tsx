'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { WasteCompany } from '@/types/waste'

const COLORS = ['#16a34a', '#2563eb', '#dc2626', '#ea580c', '#7c2d12']

export function WasteTypeChart() {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/waste-data')
        const companies: WasteCompany[] = await response.json()

        const wasteByType = companies.reduce((acc, company) => {
          const type = company.wasteType || 'Unknown'
          if (!acc[type]) {
            acc[type] = 0
          }
          acc[type] += company.annualVolume
          return acc
        }, {} as Record<string, number>)

        const totalWaste = Object.values(wasteByType).reduce((sum, value) => sum + value, 0)

        const formattedData = Object.entries(wasteByType).map(([name, value]) => ({
          name,
          value,
          percentage: totalWaste > 0 ? ((value / totalWaste) * 100).toFixed(2) : 0,
        }))

        setChartData(formattedData)
      } catch (error) {
        console.error("Failed to fetch or process waste type data:", error)
      }
    }

    fetchData()
  }, [])

  if (chartData.length === 0) return <div>Loading chart...</div>

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name} ${percentage}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name, props) => [`${props.payload.percentage}%`, 'Percentage']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
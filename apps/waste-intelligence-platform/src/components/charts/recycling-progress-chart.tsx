'use client'

import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { WasteCompany } from '@/types/waste'

export function RecyclingProgressChart() {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/waste-data')
        const companies: WasteCompany[] = await response.json()

        const progress = companies.reduce((acc, company) => {
          const month = new Date(company.lastUpdated).toLocaleString('default', { month: 'short' });
          if (!acc[month]) {
            acc[month] = { totalRate: 0, count: 0 };
          }
          acc[month].totalRate += company.recyclingRate;
          acc[month].count++;
          return acc;
        }, {} as Record<string, { totalRate: number; count: number }>);

        const formattedData = Object.entries(progress).map(([name, { totalRate, count }]) => ({
          name,
          value: totalRate / count,
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error("Failed to fetch or process recycling progress data:", error)
      }
    }

    fetchData()
  }, [])

  if (chartData.length === 0) return <div>Loading chart...</div>

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis 
          fontSize={12} 
          tickFormatter={(value) => `${value.toFixed(0)}%`}
        />
        <Tooltip 
          formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Recycling Rate']}
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
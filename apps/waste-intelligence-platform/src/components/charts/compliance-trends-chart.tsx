'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { WasteCompany } from '@/types/waste'

export function ComplianceTrendsChart() {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/waste-data')
        const companies: WasteCompany[] = await response.json()

        const trends = companies.reduce((acc, company) => {
          const month = new Date(company.lastUpdated).toLocaleString('default', { month: 'short' });
          if (!acc[month]) {
            acc[month] = { totalScore: 0, count: 0 };
          }
          acc[month].totalScore += company.complianceScore;
          acc[month].count++;
          return acc;
        }, {} as Record<string, { totalScore: number; count: number }>);

        const formattedData = Object.entries(trends).map(([name, { totalScore, count }]) => ({
          name,
          value: totalScore / count,
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error("Failed to fetch or process compliance trends data:", error)
      }
    }

    fetchData()
  }, [])

  if (chartData.length === 0) return <div>Loading chart...</div>

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis 
          fontSize={12} 
          domain={[70, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip 
          formatter={(value) => [`${value.toFixed(2)}%`, 'Compliance Score']}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#2563eb" 
          strokeWidth={3}
          dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
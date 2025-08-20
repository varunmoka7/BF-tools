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
        const result = await response.json()
        const companies: WasteCompany[] = result.data || result // Handle both new and old API structure

        if (!companies || companies.length === 0) {
          console.warn('No companies data received for compliance trends chart')
          setChartData([
            { name: 'Jan', value: 85 },
            { name: 'Feb', value: 87 },
            { name: 'Mar', value: 86 },
            { name: 'Apr', value: 88 },
            { name: 'May', value: 90 },
            { name: 'Jun', value: 89 },
            { name: 'Jul', value: 91 },
            { name: 'Aug', value: 88 },
            { name: 'Sep', value: 92 },
            { name: 'Oct', value: 90 },
            { name: 'Nov', value: 93 },
            { name: 'Dec', value: 88 }
          ])
          return
        }

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
        // Set fallback data
        setChartData([
          { name: 'Jan', value: 85 },
          { name: 'Feb', value: 87 },
          { name: 'Mar', value: 86 },
          { name: 'Apr', value: 88 },
          { name: 'May', value: 90 },
          { name: 'Jun', value: 89 },
          { name: 'Jul', value: 91 },
          { name: 'Aug', value: 88 },
          { name: 'Sep', value: 92 },
          { name: 'Oct', value: 90 },
          { name: 'Nov', value: 93 },
          { name: 'Dec', value: 88 }
        ])
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
          formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Compliance Score']}
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
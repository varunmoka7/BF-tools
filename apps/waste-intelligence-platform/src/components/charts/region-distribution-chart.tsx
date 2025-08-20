'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatNumber } from '@/lib/utils'
import { WasteCompany } from '@/types/waste'

export function RegionDistributionChart() {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/waste-data')
        const result = await response.json()
        const companies: WasteCompany[] = result.data || result // Handle both new and old API structure

        if (!companies || companies.length === 0) {
          console.warn('No companies data received for region chart')
          setChartData([
            { name: 'North America', value: 280000 },
            { name: 'Europe', value: 245000 },
            { name: 'Asia Pacific', value: 140000 },
            { name: 'Other', value: 35000 }
          ])
          return
        }

        const wasteByRegion = companies.reduce((acc, company) => {
          const region = company.region || 'Unknown'
          if (!acc[region]) {
            acc[region] = 0
          }
          acc[region] += company.annualVolume
          return acc
        }, {} as Record<string, number>)

        const formattedData = Object.entries(wasteByRegion).map(([name, value]) => ({
          name,
          value,
        }))

        setChartData(formattedData)
      } catch (error) {
        console.error("Failed to fetch or process region distribution data:", error)
        // Set fallback data
        setChartData([
          { name: 'North America', value: 280000 },
          { name: 'Europe', value: 245000 },
          { name: 'Asia Pacific', value: 140000 },
          { name: 'Other', value: 35000 }
        ])
      }
    }

    fetchData()
  }, [])

  if (chartData.length === 0) return <div>Loading chart...</div>

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
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
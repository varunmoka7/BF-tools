'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/utils'
import { 
  TrendingUp, 
  Recycle, 
  Building2, 
  DollarSign, 
  Leaf,
  CheckCircle
} from 'lucide-react'
import { WasteCompany, WasteMetrics } from '@/types/waste'

export function KPICards() {
  const [metrics, setMetrics] = useState<WasteMetrics | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/waste-data')
        const companies: WasteCompany[] = await response.json()

        const totalVolume = companies.reduce((sum, c) => sum + c.annualVolume, 0)
        const recyclingRate = companies.reduce((sum, c) => sum + c.recyclingRate, 0) / companies.length
        const complianceScore = companies.reduce((sum, c) => sum + c.complianceScore, 0) / companies.length
        const activeCompanies = companies.length
        const totalRevenue = companies.reduce((sum, c) => sum + (c.revenue || 0), 0)
        const carbonFootprint = 850000 // Mock value

        setMetrics({
          totalVolume,
          recyclingRate,
          complianceScore,
          activeCompanies,
          totalRevenue,
          carbonFootprint
        })
      } catch (error) {
        console.error("Failed to fetch or process KPI data:", error)
      }
    }

    fetchData()
  }, [])

  if (!metrics) return <div>Loading KPIs...</div>

  const kpiData = [
    {
      title: 'Total Waste Volume',
      value: formatNumber(metrics.totalVolume) + ' tons',
      icon: TrendingUp,
      trend: '+12.5%', // Mock trend
      trendColor: 'text-green-600'
    },
    {
      title: 'Recycling Rate',
      value: formatPercentage(metrics.recyclingRate),
      icon: Recycle,
      trend: '+3.2%', // Mock trend
      trendColor: 'text-green-600'
    },
    {
      title: 'Active Companies',
      value: formatNumber(metrics.activeCompanies),
      icon: Building2,
      trend: '+8.1%', // Mock trend
      trendColor: 'text-green-600'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      trend: '+15.3%', // Mock trend
      trendColor: 'text-green-600'
    },
    {
      title: 'Compliance Score',
      value: `${metrics.complianceScore.toFixed(2)}/100`,
      icon: CheckCircle,
      trend: '+2.1%', // Mock trend
      trendColor: 'text-green-600'
    },
    {
      title: 'Carbon Footprint',
      value: formatNumber(metrics.carbonFootprint) + ' CO2e',
      icon: Leaf,
      trend: '-5.8%', // Mock trend
      trendColor: 'text-green-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {kpi.title}
              </CardTitle>
              <Icon className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {kpi.value}
              </div>
              <div className={`text-sm flex items-center mt-1 ${kpi.trendColor}`}>
                <span>{kpi.trend} from last month</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
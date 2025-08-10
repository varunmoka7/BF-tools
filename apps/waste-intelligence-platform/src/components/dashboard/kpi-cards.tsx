'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockMetrics } from '@/data/mock-data'
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/utils'
import { 
  TrendingUp, 
  Recycle, 
  Building2, 
  DollarSign, 
  Leaf,
  CheckCircle
} from 'lucide-react'

export function KPICards() {
  const kpiData = [
    {
      title: 'Total Waste Volume',
      value: formatNumber(mockMetrics.totalVolume) + ' tons',
      icon: TrendingUp,
      trend: '+12.5%',
      trendColor: 'text-green-600'
    },
    {
      title: 'Recycling Rate',
      value: formatPercentage(mockMetrics.recyclingRate),
      icon: Recycle,
      trend: '+3.2%',
      trendColor: 'text-green-600'
    },
    {
      title: 'Active Companies',
      value: formatNumber(mockMetrics.activeCompanies),
      icon: Building2,
      trend: '+8.1%',
      trendColor: 'text-green-600'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(mockMetrics.totalRevenue),
      icon: DollarSign,
      trend: '+15.3%',
      trendColor: 'text-green-600'
    },
    {
      title: 'Compliance Score',
      value: `${mockMetrics.complianceScore}/100`,
      icon: CheckCircle,
      trend: '+2.1%',
      trendColor: 'text-green-600'
    },
    {
      title: 'Carbon Footprint',
      value: formatNumber(mockMetrics.carbonFootprint) + ' CO2e',
      icon: Leaf,
      trend: '-5.8%',
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
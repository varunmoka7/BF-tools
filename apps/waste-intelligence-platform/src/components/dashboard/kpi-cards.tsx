'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'
import { useCompanies } from '@/contexts/companies-context'
import { 
  TrendingUp, 
  Building2, 
  Globe,
  CheckCircle,
  Users
} from 'lucide-react'

const KPICard = React.memo(({ title, value, icon: Icon, trend, trendColor, index }: {
  title: string;
  value: string;
  icon: any;
  trend: string;
  trendColor: string;
  index: number;
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">
        {title}
      </CardTitle>
      <Icon className="h-5 w-5 text-gray-400" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-900">
        {value}
      </div>
      <div className={`text-sm flex items-center mt-1 ${trendColor}`}>
        <span>{trend}</span>
      </div>
    </CardContent>
  </Card>
))

KPICard.displayName = 'KPICard'

export function KPICards() {
  const { metrics, loading, error } = useCompanies()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-5 w-5 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading KPIs</h3>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!metrics) return <div>No metrics available...</div>

  const kpiData = [
    {
      title: 'Total Companies',
      value: formatNumber(metrics.totalCompanies),
      icon: Building2,
      trend: `Covering ${metrics.countriesCovered} countries`,
      trendColor: 'text-blue-600'
    },
    {
      title: 'Total Employees',
      value: formatNumber(metrics.totalEmployees),
      icon: Users,
      trend: `Avg: ${formatNumber(metrics.averageEmployees)} per company`,
      trendColor: 'text-green-600'
    },
    {
      title: 'Countries Covered',
      value: metrics.countriesCovered.toString(),
      icon: Globe,
      trend: `Top: ${metrics.topCountry}`,
      trendColor: 'text-purple-600'
    },
    {
      title: 'Sectors Represented',
      value: metrics.sectorsRepresented.toString(),
      icon: TrendingUp,
      trend: `Top: ${metrics.topSector}`,
      trendColor: 'text-orange-600'
    },
    {
      title: 'Latest Data Year',
      value: metrics.latestYear.toString(),
      icon: CheckCircle,
      trend: 'Most recent reporting period',
      trendColor: 'text-green-600'
    },
    {
      title: 'Data Coverage',
      value: '100%',
      icon: CheckCircle,
      trend: 'Complete company profiles',
      trendColor: 'text-green-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpiData.map((kpi, index) => (
        <KPICard
          key={kpi.title}
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          trend={kpi.trend}
          trendColor={kpi.trendColor}
          index={index}
        />
      ))}
    </div>
  )
}
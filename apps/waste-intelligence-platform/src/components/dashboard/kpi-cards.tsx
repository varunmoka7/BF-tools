'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'
import { useKPI } from '@/contexts/kpi-context'
import { 
  TrendingUp, 
  Building2, 
  Globe,
  CheckCircle,
  Users,
  Trash2
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
  const { kpiData, loading, error } = useKPI()
  
  console.log('KPICards render state:', {
    hasKpiData: !!kpiData,
    loading,
    error,
    kpiData
  })

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

  if (!kpiData) return <div>No KPI data available...</div>

  const kpiCards = [
    {
      title: 'Total Companies',
      value: formatNumber(kpiData.totalCompanies),
      icon: Building2,
      trend: `Covering ${kpiData.countriesCovered} countries`,
      trendColor: 'text-blue-600'
    },
    {
      title: 'Total Waste Generated',
      value: `${formatNumber(kpiData.totalWasteGenerated)} MT`,
      icon: Trash2,
      trend: 'Annual waste volume',
      trendColor: 'text-red-600'
    },
    {
      title: 'Total Waste Recovered',
      value: `${formatNumber(kpiData.totalWasteRecovered)} MT`,
      icon: CheckCircle,
      trend: 'Recovery volume',
      trendColor: 'text-green-600'
    },
    {
      title: 'Average Recovery Rate',
      value: `${kpiData.avgRecoveryRate.toFixed(1)}%`,
      icon: TrendingUp,
      trend: 'Industry average',
      trendColor: 'text-green-600'
    },
    {
      title: 'Countries Covered',
      value: kpiData.countriesCovered.toString(),
      icon: Globe,
      trend: 'Global coverage',
      trendColor: 'text-purple-600'
    },
    {
      title: 'Data Freshness',
      value: 'Real-time',
      icon: CheckCircle,
      trend: `Updated: ${new Date(kpiData.lastUpdated).toLocaleDateString()}`,
      trendColor: 'text-blue-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpiCards.map((kpi, index) => (
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
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
  Trash2,
  AlertTriangle,
  Database,
  Trophy
} from 'lucide-react'

const KPICard = React.memo(({ title, value, icon: Icon, trend, trendColor, index }: {
  title: string;
  value: string;
  icon: any;
  trend: string;
  trendColor: string;
  index: number;
}) => (
  <div 
    className="glass-card hover-lift p-6 bg-card border border-border rounded-2xl group cursor-pointer transition-all duration-300"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <div className="flex flex-row items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </h3>
      <div className="p-2 rounded-xl bg-gradient-primary group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-5 w-5 text-white" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="text-3xl font-bold text-foreground animate-count">
        {value}
      </div>
      <div className={`text-sm flex items-center ${trendColor.replace('text-', 'text-white/')}`}>
        <span className="text-muted-foreground">{trend}</span>
      </div>
    </div>
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
  </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="glass-card p-6 bg-card border border-border rounded-2xl">
            <div className="flex flex-row items-center justify-between mb-4">
              <div className="h-4 bg-muted/50 rounded w-1/2 shimmer"></div>
              <div className="h-8 w-8 bg-muted/50 rounded-xl shimmer"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-muted/50 rounded w-3/4 shimmer"></div>
              <div className="h-4 bg-muted/50 rounded w-1/2 shimmer"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card p-6 bg-destructive/10 border border-destructive/20 rounded-2xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 rounded-xl bg-red-500/20">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Error Loading KPIs</h3>
        </div>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (!kpiData) return (
    <div className="glass-card p-6 bg-card border border-border rounded-2xl text-center">
      <div className="p-3 rounded-xl bg-muted/20 inline-block mb-4">
        <Database className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">No KPI data available...</p>
    </div>
  )

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
      value: kpiData.totalWasteGenerated && kpiData.totalWasteGenerated > 0 ? `${formatNumber(kpiData.totalWasteGenerated)} MT` : 'No data',
      icon: Trash2,
      trend: 'Based on 2023-2024 reporting',
      trendColor: 'text-orange-600'
    },
    {
      title: 'Hazardous Waste',
      value: kpiData.hazardousPercentage > 0 ? `${kpiData.hazardousPercentage}%` : 'No data',
      icon: AlertTriangle,
      trend: 'Of classified waste streams',
      trendColor: 'text-red-600'
    },
    {
      title: 'Data Coverage',
      value: `${kpiData.dataCoveragePercentage}%`,
      icon: Database,
      trend: `${kpiData.companiesWithRecentData} companies reporting`,
      trendColor: 'text-green-600'
    },
    {
      title: 'Top Performing Sector',
      value: kpiData.topPerformingSector || 'No data',
      icon: Trophy,
      trend: kpiData.topSectorRecoveryRate > 0 ? `${kpiData.topSectorRecoveryRate}% recovery rate` : 'Calculating...',
      trendColor: 'text-yellow-600'
    },
    {
      title: 'Countries Covered',
      value: kpiData.countriesCovered.toString(),
      icon: Globe,
      trend: 'European coverage',
      trendColor: 'text-purple-600'
    },
    {
      title: 'Data Status',
      value: 'Live Data',
      icon: CheckCircle,
      trend: `Updated: ${new Date(kpiData.lastUpdated).toLocaleDateString()}`,
      trendColor: 'text-green-600'
    }
  ].filter(Boolean)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'
import { useKPI } from '@/contexts/kpi-context'
import { 
  Building2, 
  Globe,
  CheckCircle,
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
    className="relative rounded-2xl border border-border/70 bg-background p-6 group transition-transform duration-200 hover:-translate-y-1 hover:shadow-modern"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/70 via-primary/20 to-primary/60 opacity-80 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" aria-hidden="true" />
    <div className="relative flex flex-col h-full">
      <div className="flex flex-row items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
            {title}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gradient-primary shadow-sm text-white transition-transform duration-200 group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="flex-1 space-y-4">
        <div className="text-3xl font-bold text-foreground animate-count tracking-tight">
          {value}
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/30 border border-border/60 text-sm font-medium text-muted-foreground">
          <span className={`h-2 w-2 rounded-full ${trendColor.replace('text', 'bg')}`} aria-hidden="true" />
          <span className="leading-none">{trend}</span>
        </div>
      </div>
    </div>
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

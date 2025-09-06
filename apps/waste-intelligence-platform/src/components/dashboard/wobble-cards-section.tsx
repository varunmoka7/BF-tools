'use client'

import React from 'react'
import { WobbleCard } from '@/components/ui/wobble-card'
import { useKPI } from '@/contexts/kpi-context'
import { formatNumber } from '@/lib/utils'
import { 
  TrendingUp, 
  Building2, 
  Globe,
  Recycle,
  AlertTriangle,
  Trophy
} from 'lucide-react'

export function WobbleCardsSection() {
  const { kpiData, loading, error } = useKPI()

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-96 rounded-2xl bg-gray-200 animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (error || !kpiData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
        <p className="text-red-600">{error || 'No data available'}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
      <WobbleCard 
        containerClassName="col-span-1 lg:col-span-2 h-full bg-gradient-to-br from-emerald-500 to-emerald-700 min-h-[500px] lg:min-h-[300px]"
        className=""
      >
        <div className="max-w-xs">
          <Building2 className="h-8 w-8 text-white/80 mb-4" />
          <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
            Companies Monitored
          </h2>
          <p className="mt-4 text-left text-base/6 text-neutral-200">
            Tracking waste data from {formatNumber(kpiData.totalCompanies)} companies across {kpiData.countriesCovered} European countries.
          </p>
          <div className="mt-6">
            <div className="text-4xl font-bold text-white">
              {formatNumber(kpiData.totalCompanies)}
            </div>
            <div className="text-emerald-200 text-sm">
              Active companies in database
            </div>
          </div>
        </div>
      </WobbleCard>
      
      <WobbleCard containerClassName="col-span-1 min-h-[300px] bg-gradient-to-br from-orange-500 to-red-600">
        <div className="max-w-sm">
          <AlertTriangle className="h-8 w-8 text-white/80 mb-4" />
          <h2 className="max-w-80 text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
            Waste Generated
          </h2>
          <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
            Total waste output monitored across all reporting companies.
          </p>
          <div className="mt-6">
            <div className="text-3xl font-bold text-white">
              {kpiData.totalWasteGenerated && kpiData.totalWasteGenerated > 0 ? `${formatNumber(kpiData.totalWasteGenerated)} MT` : 'Calculating...'}
            </div>
            <div className="text-orange-200 text-sm">
              {kpiData.hazardousPercentage > 0 ? `${kpiData.hazardousPercentage}% hazardous` : 'Data being processed'}
            </div>
          </div>
        </div>
      </WobbleCard>
      
      <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]">
        <div className="max-w-sm">
          <Trophy className="h-8 w-8 text-white/80 mb-4" />
          <h2 className="max-w-sm md:max-w-lg text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
            Performance Analytics
          </h2>
          <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
            Real-time insights into waste management efficiency and environmental impact across sectors.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">
                {kpiData.topPerformingSector || 'Analyzing...'}
              </div>
              <div className="text-blue-200 text-sm">
                Top performing sector
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">
                {kpiData.dataCoveragePercentage}%
              </div>
              <div className="text-purple-200 text-sm">
                Data coverage
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">
                {kpiData.topSectorRecoveryRate > 0 ? `${kpiData.topSectorRecoveryRate}%` : 'N/A'}
              </div>
              <div className="text-indigo-200 text-sm">
                Recovery rate
              </div>
            </div>
          </div>
        </div>
      </WobbleCard>
    </div>
  )
}
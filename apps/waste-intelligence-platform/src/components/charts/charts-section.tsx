'use client'

import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CompanyDistributionChart } from './company-distribution-chart'
import { SectorBreakdownChart } from './sector-breakdown-chart'
import { CountryCoverageChart } from './country-coverage-chart'
import { WasteRecoveryDistributionChart } from './waste-recovery-distribution-chart'
import { HazardousWasteBreakdownChart } from './hazardous-waste-breakdown-chart'

const analyticsCardBase =
  'relative overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-sm transition-shadow duration-300 hover:shadow-lg'

function AnalyticsCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className={analyticsCardBase}>
      <div
        className="pointer-events-none absolute inset-0 rounded-[26px] border border-white/5"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-primary/40 to-primary/60"
        aria-hidden="true"
      />
      <CardHeader className="relative z-10 pb-0">
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 pt-6 pb-6">
        <div className="rounded-2xl border border-border/50 bg-background/80 p-4">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

export function ChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Waste Recovery Performance Distribution - Real Data from 325 Companies */}
      <WasteRecoveryDistributionChart />

      {/* Hazardous vs Non-Hazardous Breakdown */}
      <AnalyticsCard title="Hazardous vs Non-Hazardous Breakdown">
        <HazardousWasteBreakdownChart />
      </AnalyticsCard>

      {/* Company Distribution by Sector */}
      <AnalyticsCard title="Company Distribution by Sector">
        <SectorBreakdownChart />
      </AnalyticsCard>

      {/* Company Distribution by Country */}
      <AnalyticsCard title="Company Distribution by Country">
        <CountryCoverageChart />
      </AnalyticsCard>

      {/* Company Size Analysis */}
      <AnalyticsCard title="Company Size Analysis">
        <CompanyDistributionChart />
      </AnalyticsCard>
    </div>
  )
}

'use client'

import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CompanyDistributionChart } from './company-distribution-chart'
import { SectorBreakdownChart } from './sector-breakdown-chart'
import { CountryCoverageChart } from './country-coverage-chart'
import { WasteRecoveryDistributionChart } from './waste-recovery-distribution-chart'
import { HazardousWasteBreakdownChart } from './hazardous-waste-breakdown-chart'

const analyticsCardBase =
  'relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg'

function AnalyticsCard({
  title,
  children,
  className
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={cn(analyticsCardBase, className)}>
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
      <CardContent className="relative z-10 flex flex-1 flex-col px-6 pb-6 pt-4">
        <div className="flex h-full flex-col rounded-2xl bg-background/90 p-4 sm:p-6">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

export function ChartsSection() {
  return (
    <div className="grid auto-rows-[minmax(360px,_auto)] gap-8 lg:grid-cols-12 min-w-0">
      <div className="lg:col-span-12">
        {/* Waste Recovery Performance Distribution - Real Data from 325 Companies */}
        <WasteRecoveryDistributionChart />
      </div>

      <AnalyticsCard
        title="Hazardous vs Non-Hazardous Breakdown"
        className="lg:col-span-6 xl:col-span-4"
      >
        <HazardousWasteBreakdownChart />
      </AnalyticsCard>

      <AnalyticsCard
        title="Company Distribution by Sector"
        className="lg:col-span-6 xl:col-span-4 min-h-[460px]"
      >
        <SectorBreakdownChart />
      </AnalyticsCard>

      <AnalyticsCard
        title="Company Distribution by Country"
        className="lg:col-span-12 xl:col-span-6"
      >
        <CountryCoverageChart />
      </AnalyticsCard>

      <AnalyticsCard
        title="Company Size Analysis"
        className="lg:col-span-12 xl:col-span-6"
      >
        <CompanyDistributionChart />
      </AnalyticsCard>
    </div>
  )
}

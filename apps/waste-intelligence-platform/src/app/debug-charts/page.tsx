'use client'

import { HazardousWasteBreakdownChart } from '@/components/charts/hazardous-waste-breakdown-chart'
import { WasteRecoveryDistributionChart } from '@/components/charts/waste-recovery-distribution-chart'
import { CompanyDistributionChart } from '@/components/charts/company-distribution-chart'
import { SectorBreakdownChart } from '@/components/charts/sector-breakdown-chart'
import { CountryCoverageChart } from '@/components/charts/country-coverage-chart'

export default function DebugChartsPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-8">Chart Debug Page</h1>

      <div className="space-y-8">
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Hazardous Waste Breakdown Chart</h2>
          <div className="h-64">
            <HazardousWasteBreakdownChart />
          </div>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Company Distribution Chart</h2>
          <div className="h-64">
            <CompanyDistributionChart />
          </div>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Sector Breakdown Chart</h2>
          <div className="h-64">
            <SectorBreakdownChart />
          </div>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Country Coverage Chart</h2>
          <div className="h-64">
            <CountryCoverageChart />
          </div>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Waste Recovery Distribution Chart</h2>
          <div className="h-96">
            <WasteRecoveryDistributionChart />
          </div>
        </div>
      </div>
    </div>
  )
}
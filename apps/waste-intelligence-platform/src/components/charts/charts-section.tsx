'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CompanyDistributionChart } from './company-distribution-chart'
import { SectorBreakdownChart } from './sector-breakdown-chart'
import { CountryCoverageChart } from './country-coverage-chart'
import { WasteRecoveryDistributionChart } from './waste-recovery-distribution-chart'
import { HazardousWasteBreakdownChart } from './hazardous-waste-breakdown-chart'

export function ChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Waste Recovery Performance Distribution - Real Data from 325 Companies */}
      <WasteRecoveryDistributionChart />

      {/* Hazardous vs Non-Hazardous Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hazardous vs Non-Hazardous Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <HazardousWasteBreakdownChart />
        </CardContent>
      </Card>

      {/* Company Distribution by Sector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Company Distribution by Sector</CardTitle>
        </CardHeader>
        <CardContent>
          <SectorBreakdownChart />
        </CardContent>
      </Card>

      {/* Company Distribution by Country */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Company Distribution by Country</CardTitle>
        </CardHeader>
        <CardContent>
          <CountryCoverageChart />
        </CardContent>
      </Card>

      {/* Company Size Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Company Size Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyDistributionChart />
        </CardContent>
      </Card>
    </div>
  )
}
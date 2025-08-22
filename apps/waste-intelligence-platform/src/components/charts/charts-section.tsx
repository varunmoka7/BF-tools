'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CompanyDistributionChart } from './company-distribution-chart'
import { SectorBreakdownChart } from './sector-breakdown-chart'
import { EmployeeDistributionChart } from './employee-distribution-chart'
import { CountryCoverageChart } from './country-coverage-chart'

export function ChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {/* Employee Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Employee Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeDistributionChart />
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
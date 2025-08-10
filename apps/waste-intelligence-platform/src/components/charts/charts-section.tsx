'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WasteTypeChart } from './waste-type-chart'
import { RegionDistributionChart } from './region-distribution-chart'
import { ComplianceTrendsChart } from './compliance-trends-chart'
import { RecyclingProgressChart } from './recycling-progress-chart'

export function ChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Waste Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Waste Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <WasteTypeChart />
        </CardContent>
      </Card>

      {/* Regional Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Regional Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <RegionDistributionChart />
        </CardContent>
      </Card>

      {/* Compliance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compliance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ComplianceTrendsChart />
        </CardContent>
      </Card>

      {/* Recycling Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recycling Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <RecyclingProgressChart />
        </CardContent>
      </Card>
    </div>
  )
}
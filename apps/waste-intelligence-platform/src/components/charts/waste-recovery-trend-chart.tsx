'use client'

import React from 'react'
import { LineChart } from "@/components/retroui/charts/LineChart"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, AlertCircle, Database, Calendar } from 'lucide-react'
import { useWasteRecoveryTrends } from '@/hooks/use-waste-recovery-trends'

export function WasteRecoveryTrendChart() {
  const { data, summary, loading, error } = useWasteRecoveryTrends()

  const valueFormatter = (value: number) => `${value}%`

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Waste Recovery Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading real waste recovery data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Waste Recovery Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Error loading waste recovery data</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-gray-600" />
            Waste Recovery Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <Database className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">No waste recovery data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform data for the chart
  const chartData = data.map(item => ({
    period: item.month || String(item.period), // Use month or full period
    recoveryRate: item.recoveryRate,
    recyclingRate: item.recyclingRate,
    disposalRate: item.disposalRate
  }))

  // Determine trend direction
  const trendIcon = summary?.trendDirection && summary.trendDirection > 0 
    ? TrendingUp 
    : TrendingDown
  const trendColor = summary?.trendDirection && summary.trendDirection > 0 
    ? 'text-green-600' 
    : 'text-red-600'

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {React.createElement(trendIcon, { className: `h-5 w-5 ${trendColor}` })}
            Waste Recovery Trends (Real Data)
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {summary?.totalPeriods || 0} periods
            </div>
            <div className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              {summary?.dataSource || 'Database'}
            </div>
          </div>
        </div>
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Avg Recovery Rate</div>
              <div className="text-2xl font-bold text-green-700">{summary.avgRecoveryRate}%</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Latest Period</div>
              <div className="text-2xl font-bold text-blue-700">{summary.latestRecoveryRate}%</div>
            </div>
            <div className={`p-3 rounded-lg ${summary.trendDirection > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className={`text-sm font-medium ${summary.trendDirection > 0 ? 'text-green-600' : 'text-red-600'}`}>
                Trend Direction
              </div>
              <div className={`text-2xl font-bold ${summary.trendDirection > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {summary.trendDirection > 0 ? '+' : ''}{summary.trendDirection}%
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600 font-medium">Data Coverage</div>
              <div className="text-2xl font-bold text-gray-700">{summary.latestPeriod}</div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <LineChart
          data={chartData}
          index="period"
          categories={["recoveryRate", "recyclingRate", "disposalRate"]}
          strokeColors={[
            "hsl(142, 71%, 45%)", // Green for recovery
            "hsl(200, 84%, 45%)", // Blue for recycling
            "hsl(0, 84%, 60%)"    // Red for disposal
          ]}
          strokeWidth={3}
          dotSize={5}
          valueFormatter={valueFormatter}
          showGrid={true}
          showTooltip={true}
          className="h-80"
        />
        <div className="mt-6 flex flex-wrap gap-4 justify-between">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-600"></div>
              <span className="text-sm text-gray-600">Recovery Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-600"></div>
              <span className="text-sm text-gray-600">Recycling Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-600"></div>
              <span className="text-sm text-gray-600">Disposal Rate</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Data calculated from {data.length} reporting periods • 
            Companies reporting: {data[data.length - 1]?.companiesReporting || 0}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
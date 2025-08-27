'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface WasteMetrics {
  total_waste_generated: number | null;
  total_waste_recovered: number | null;
  total_waste_disposed: number | null;
  recovery_rate: number | null;
  reporting_period: string;
}

interface HistoricalTrendsChartProps {
  metricsData: WasteMetrics[] | null;
}

export function HistoricalTrendsChart({ metricsData }: HistoricalTrendsChartProps) {
  if (!metricsData || metricsData.length < 2) {
    return null // Don't show if less than 2 years of data
  }

  const calculateTrend = (current: number | null, previous: number | null) => {
    if (!current || !previous || previous === 0) return null
    return ((current - previous) / previous) * 100
  }

  const getTrendIcon = (trend: number | null) => {
    if (!trend) return <Minus className="h-4 w-4 text-gray-400" />
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getTrendColor = (trend: number | null, isPositiveGood: boolean = true) => {
    if (!trend) return 'text-gray-500'
    const isPositive = trend > 0
    if (isPositiveGood) {
      return isPositive ? 'text-green-600' : 'text-red-600'
    } else {
      return isPositive ? 'text-red-600' : 'text-green-600'
    }
  }

  // Sort by year descending to get latest first
  const sortedData = [...metricsData].sort((a, b) => {
    const aYear = String(a.reporting_period)
    const bYear = String(b.reporting_period)
    return bYear.localeCompare(aYear)
  })
  const latestYear = sortedData[0]
  const previousYear = sortedData[1]

  const trends = {
    wasteGenerated: calculateTrend(latestYear.total_waste_generated, previousYear.total_waste_generated),
    wasteRecovered: calculateTrend(latestYear.total_waste_recovered, previousYear.total_waste_recovered),
    wasteDisposed: calculateTrend(latestYear.total_waste_disposed, previousYear.total_waste_disposed),
    recoveryRate: calculateTrend(latestYear.recovery_rate, previousYear.recovery_rate)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Year-over-Year Trends
          <Badge variant="outline" className="text-xs">
            {previousYear.reporting_period} → {latestYear.reporting_period}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Waste Generation Trend */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Waste Generated</span>
              <div className="flex items-center gap-2">
                {getTrendIcon(trends.wasteGenerated)}
                <span className={`text-sm font-semibold ${getTrendColor(trends.wasteGenerated, false)}`}>
                  {trends.wasteGenerated !== null 
                    ? `${trends.wasteGenerated > 0 ? '+' : ''}${trends.wasteGenerated.toFixed(1)}%`
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>{previousYear.reporting_period}:</span>
                <span>
                  {previousYear.total_waste_generated !== null 
                    ? `${formatNumber(previousYear.total_waste_generated)} tons`
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span>{latestYear.reporting_period}:</span>
                <span>
                  {latestYear.total_waste_generated !== null 
                    ? `${formatNumber(latestYear.total_waste_generated)} tons`
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Waste Recovery Trend */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Waste Recovered</span>
              <div className="flex items-center gap-2">
                {getTrendIcon(trends.wasteRecovered)}
                <span className={`text-sm font-semibold ${getTrendColor(trends.wasteRecovered, true)}`}>
                  {trends.wasteRecovered !== null 
                    ? `${trends.wasteRecovered > 0 ? '+' : ''}${trends.wasteRecovered.toFixed(1)}%`
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>{previousYear.reporting_period}:</span>
                <span>
                  {previousYear.total_waste_recovered !== null 
                    ? `${formatNumber(previousYear.total_waste_recovered)} tons`
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span>{latestYear.reporting_period}:</span>
                <span>
                  {latestYear.total_waste_recovered !== null 
                    ? `${formatNumber(latestYear.total_waste_recovered)} tons`
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Waste Disposal Trend */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Waste Disposed</span>
              <div className="flex items-center gap-2">
                {getTrendIcon(trends.wasteDisposed)}
                <span className={`text-sm font-semibold ${getTrendColor(trends.wasteDisposed, false)}`}>
                  {trends.wasteDisposed !== null 
                    ? `${trends.wasteDisposed > 0 ? '+' : ''}${trends.wasteDisposed.toFixed(1)}%`
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>{previousYear.reporting_period}:</span>
                <span>
                  {previousYear.total_waste_disposed !== null 
                    ? `${formatNumber(previousYear.total_waste_disposed)} tons`
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span>{latestYear.reporting_period}:</span>
                <span>
                  {latestYear.total_waste_disposed !== null 
                    ? `${formatNumber(latestYear.total_waste_disposed)} tons`
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Recovery Rate Trend */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Recovery Rate</span>
              <div className="flex items-center gap-2">
                {getTrendIcon(trends.recoveryRate)}
                <span className={`text-sm font-semibold ${getTrendColor(trends.recoveryRate, true)}`}>
                  {trends.recoveryRate !== null 
                    ? `${trends.recoveryRate > 0 ? '+' : ''}${trends.recoveryRate.toFixed(1)}%`
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>{previousYear.reporting_period}:</span>
                <span>
                  {previousYear.recovery_rate !== null 
                    ? `${previousYear.recovery_rate.toFixed(1)}%`
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span>{latestYear.reporting_period}:</span>
                <span>
                  {latestYear.recovery_rate !== null 
                    ? `${latestYear.recovery_rate.toFixed(1)}%`
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interpretation Guide */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Trend Interpretation:</strong> 
            Green trends indicate improvement (↑ recovery, ↓ disposal, ↓ generation). 
            Red trends may indicate areas needing attention.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
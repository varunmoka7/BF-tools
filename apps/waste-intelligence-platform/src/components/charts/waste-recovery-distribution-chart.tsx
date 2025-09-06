'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, BarChart3, Users, Target, AlertCircle, Database } from 'lucide-react'

interface CompanyData {
  name: string
  sector: string
  country: string
  recovery_rate: number
  waste_generated: number
}

interface ChartDataPoint {
  range: string
  count: number
  percentage: number
  companies: CompanyData[]
}

interface WasteRecoveryDistributionData {
  chartData: ChartDataPoint[]
  statistics: {
    total_companies: number
    average_recovery_rate: number
    median_recovery_rate: number
    min_recovery_rate: number
    max_recovery_rate: number
    standard_deviation: number
  }
  sectorBreakdown: Array<{
    sector: string
    company_count: number
    average_recovery_rate: number
    companies: CompanyData[]
  }>
  rawData: CompanyData[]
}

interface WasteRecoveryDistributionResponse {
  success: boolean
  data: WasteRecoveryDistributionData
  error?: string
}

export function WasteRecoveryDistributionChart() {
  const [data, setData] = React.useState<WasteRecoveryDistributionData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/charts/waste-recovery-distribution')
        const result: WasteRecoveryDistributionResponse = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch waste recovery distribution data')
        }

        if (result.success) {
          setData(result.data)
        } else {
          throw new Error(result.error || 'API returned unsuccessful response')
        }
      } catch (err) {
        console.error('Error fetching waste recovery distribution:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getBarColor = (range: string) => {
    switch (range) {
      case '0-20%': return '#ef4444' // Red for poor performance
      case '20-40%': return '#f97316' // Orange for below average
      case '40-60%': return '#eab308' // Yellow for average
      case '60-80%': return '#22c55e' // Green for good
      case '80-100%': return '#16a34a' // Dark green for excellent
      default: return '#6b7280'
    }
  }

  const getPerformanceLabel = (range: string) => {
    switch (range) {
      case '0-20%': return 'Poor Performance'
      case '20-40%': return 'Below Average'
      case '40-60%': return 'Average Performance'
      case '60-80%': return 'Good Performance'
      case '80-100%': return 'Excellent Performance'
      default: return 'Unknown'
    }
  }

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Waste Recovery Performance Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading real waste recovery data from 325 companies...</p>
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
            Waste Recovery Performance Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Error loading waste recovery distribution data</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-gray-600" />
            Waste Recovery Performance Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <Database className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">No waste recovery distribution data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Waste Recovery Performance Distribution
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {data.statistics.total_companies} companies
            </div>
            <div className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              Real Data
            </div>
          </div>
        </div>
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Average Recovery Rate</div>
              <div className="text-2xl font-bold text-blue-700">
                {Math.round(data.statistics.average_recovery_rate * 100) / 100}%
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Median Recovery Rate</div>
              <div className="text-2xl font-bold text-green-700">
                {Math.round(data.statistics.median_recovery_rate * 100) / 100}%
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Performance Range</div>
              <div className="text-2xl font-bold text-purple-700">
                {Math.round(data.statistics.min_recovery_rate * 100) / 100}% - {Math.round(data.statistics.max_recovery_rate * 100) / 100}%
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-sm text-orange-600 font-medium">Standard Deviation</div>
              <div className="text-2xl font-bold text-orange-700">
                {Math.round(data.statistics.standard_deviation * 100) / 100}%
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="range" 
              fontSize={12}
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              label={{ value: 'Number of Companies', angle: -90, position: 'insideLeft' }}
              fontSize={12}
            />
            <Tooltip 
              formatter={(value: any, name: string, props: any) => [
                `${value} companies (${props.payload.percentage.toFixed(1)}%)`,
                'Companies'
              ]}
              labelFormatter={(label: string) => `Recovery Rate: ${label}`}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-semibold text-gray-800">{`Recovery Rate: ${label}`}</p>
                      <p className="text-sm text-gray-600">
                        {`${data.count} companies (${data.percentage.toFixed(1)}%)`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Performance: {getPerformanceLabel(label)}
                      </p>
                      {data.companies.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-700">Sample Companies:</p>
                          <div className="max-h-20 overflow-y-auto">
                            {data.companies.slice(0, 3).map((company: CompanyData, idx: number) => (
                              <p key={idx} className="text-xs text-gray-600">
                                {company.name} ({company.recovery_rate.toFixed(1)}%)
                              </p>
                            ))}
                            {data.companies.length > 3 && (
                              <p className="text-xs text-gray-500">
                                +{data.companies.length - 3} more...
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.range)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Legend */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Performance Categories</h4>
            <div className="space-y-2">
              {data.chartData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getBarColor(item.range) }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.range}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {item.count} companies ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Sectors */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Performing Sectors</h4>
            <div className="space-y-2">
              {data.sectorBreakdown.slice(0, 5).map((sector, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{sector.sector}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">
                      {sector.average_recovery_rate.toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500">
                      ({sector.company_count} companies)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          Data calculated from {data.statistics.total_companies} companies with real waste recovery metrics • 
          Source: Supabase Database
        </div>
      </CardContent>
    </Card>
  )
}

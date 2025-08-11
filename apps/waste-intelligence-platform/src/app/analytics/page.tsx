'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WasteCompany, ChartData } from '@/types/waste'
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  LineChart,
  Activity,
  Target,
  Award,
  Calendar,
  Download,
  RefreshCw,
  Zap,
  Globe,
  Users,
  DollarSign
} from 'lucide-react'

interface AnalyticsData {
  totalMetrics: {
    volume: number
    revenue: number
    companies: number
    recyclingRate: number
    complianceScore: number
    carbonFootprint: number
  }
  trends: {
    volumeGrowth: number
    recyclingImprovement: number
    complianceImprovement: number
    revenueGrowth: number
  }
  topPerformers: {
    byVolume: WasteCompany[]
    byRecycling: WasteCompany[]
    byCompliance: WasteCompany[]
    byRevenue: WasteCompany[]
  }
  insights: string[]
}

export default function AnalyticsPage() {
  const [companies, setCompanies] = useState<WasteCompany[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/waste-data')
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }
        const data: WasteCompany[] = await response.json()
        setCompanies(data)

        // Calculate analytics
        const totalVolume = data.reduce((sum, c) => sum + c.annualVolume, 0)
        const totalRevenue = data.reduce((sum, c) => sum + (c.revenue || 0), 0)
        const avgRecycling = data.reduce((sum, c) => sum + c.recyclingRate, 0) / data.length
        const avgCompliance = data.reduce((sum, c) => sum + c.complianceScore, 0) / data.length
        
        // Mock trends (in real app, calculate from historical data)
        const trends = {
          volumeGrowth: 12.5,
          recyclingImprovement: 3.2,
          complianceImprovement: 2.1,
          revenueGrowth: 15.3
        }

        // Top performers
        const topPerformers = {
          byVolume: [...data].sort((a, b) => b.annualVolume - a.annualVolume).slice(0, 5),
          byRecycling: [...data].sort((a, b) => b.recyclingRate - a.recyclingRate).slice(0, 5),
          byCompliance: [...data].sort((a, b) => b.complianceScore - a.complianceScore).slice(0, 5),
          byRevenue: [...data].sort((a, b) => (b.revenue || 0) - (a.revenue || 0)).slice(0, 5)
        }

        // Generate insights
        const highVolumeCompanies = data.filter(c => c.annualVolume > 10000).length
        const highRecyclingCompanies = data.filter(c => c.recyclingRate > 80).length
        const highComplianceCompanies = data.filter(c => c.complianceScore > 90).length
        
        const insights = [
          `${highVolumeCompanies} companies handle over 10,000 tons annually`,
          `${highRecyclingCompanies} companies achieve 80%+ recycling rates`,
          `${highComplianceCompanies} companies maintain 90+ compliance scores`,
          `Top 10 companies represent ${((topPerformers.byVolume.slice(0, 10).reduce((sum, c) => sum + c.annualVolume, 0) / totalVolume) * 100).toFixed(1)}% of total volume`,
          `Average recycling rate has improved by ${trends.recyclingImprovement}% this period`
        ]

        setAnalytics({
          totalMetrics: {
            volume: totalVolume,
            revenue: totalRevenue,
            companies: data.length,
            recyclingRate: avgRecycling,
            complianceScore: avgCompliance,
            carbonFootprint: 850000 // Mock value
          },
          trends,
          topPerformers,
          insights
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [selectedTimeframe])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Analytics</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  const getTrendIcon = (value: number) => {
    return value > 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const getTrendColor = (value: number) => {
    return value > 0 ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
            <p className="text-gray-600">
              Deep insights into waste management performance and trends
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex rounded-md border border-gray-300">
            {(['7d', '30d', '90d', '1y'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedTimeframe(period)}
                className={`px-3 py-1 text-sm font-medium ${
                  selectedTimeframe === period
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {period.toUpperCase()}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalMetrics.volume)} tons</div>
            <div className={`text-sm flex items-center mt-1 ${getTrendColor(analytics.trends.volumeGrowth)}`}>
              {getTrendIcon(analytics.trends.volumeGrowth)}
              <span className="ml-1">{analytics.trends.volumeGrowth}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalMetrics.revenue)}</div>
            <div className={`text-sm flex items-center mt-1 ${getTrendColor(analytics.trends.revenueGrowth)}`}>
              {getTrendIcon(analytics.trends.revenueGrowth)}
              <span className="ml-1">{analytics.trends.revenueGrowth}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalMetrics.companies}</div>
            <div className="text-sm text-muted-foreground mt-1">Active companies</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recycling Rate</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics.totalMetrics.recyclingRate)}</div>
            <div className={`text-sm flex items-center mt-1 ${getTrendColor(analytics.trends.recyclingImprovement)}`}>
              {getTrendIcon(analytics.trends.recyclingImprovement)}
              <span className="ml-1">{analytics.trends.recyclingImprovement}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalMetrics.complianceScore.toFixed(1)}/100</div>
            <div className={`text-sm flex items-center mt-1 ${getTrendColor(analytics.trends.complianceImprovement)}`}>
              {getTrendIcon(analytics.trends.complianceImprovement)}
              <span className="ml-1">{analytics.trends.complianceImprovement}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbon Impact</CardTitle>
            <Globe className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalMetrics.carbonFootprint)} CO2e</div>
            <div className="text-sm flex items-center mt-1 text-green-600">
              <TrendingDown className="h-4 w-4" />
              <span className="ml-1">-5.8%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Volume Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Volume distribution chart</p>
                <p className="text-sm text-gray-400">Interactive chart would be rendered here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Waste Type Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Waste type distribution</p>
                <p className="text-sm text-gray-400">Interactive pie chart would be rendered here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LineChart className="h-5 w-5" />
              <span>Performance Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Performance over time</p>
                <p className="text-sm text-gray-400">Interactive line chart would be rendered here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Key Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performers by Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPerformers.byVolume.map((company, index) => (
                <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-sm text-gray-500">{company.country}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatNumber(company.annualVolume)} tons</p>
                    <p className="text-sm text-gray-500">{company.recyclingRate}% recycling</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers by Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPerformers.byCompliance.map((company, index) => (
                <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-sm text-gray-500">{company.country}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{company.complianceScore}/100</p>
                    <p className="text-sm text-gray-500">{formatNumber(company.annualVolume)} tons</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">Top Regions by Volume</h4>
              <div className="space-y-2">
                {['North America', 'Europe', 'Asia Pacific'].map((region, index) => (
                  <div key={region} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">{region}</span>
                    <Badge variant="secondary">{formatNumber(Math.random() * 100000)} tons</Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Top Regions by Recycling</h4>
              <div className="space-y-2">
                {['Europe', 'North America', 'Asia Pacific'].map((region, index) => (
                  <div key={region} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">{region}</span>
                    <Badge variant="secondary">{(85 - index * 5).toFixed(1)}%</Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Top Regions by Compliance</h4>
              <div className="space-y-2">
                {['Europe', 'North America', 'Asia Pacific'].map((region, index) => (
                  <div key={region} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">{region}</span>
                    <Badge variant="secondary">{(92 - index * 3)}/100</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
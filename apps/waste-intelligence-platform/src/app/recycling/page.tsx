'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WasteCompany } from '@/types/waste'
import { formatNumber, formatPercentage } from '@/lib/utils'
import { 
  Recycle, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award,
  Leaf,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'

interface RecyclingMetrics {
  totalWasteProcessed: number
  totalRecycled: number
  overallRecyclingRate: number
  topRecyclers: WasteCompany[]
  improvementNeeded: WasteCompany[]
  recyclingByType: { type: string; rate: number; volume: number }[]
  monthlyTrends: { month: string; rate: number; volume: number }[]
  targets: {
    current: number
    target: number
    deadline: string
  }
  carbonSaved: number
}

export default function RecyclingPage() {
  const [companies, setCompanies] = useState<WasteCompany[]>([])
  const [metrics, setMetrics] = useState<RecyclingMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    async function fetchRecyclingData() {
      try {
        const response = await fetch('/api/waste-data')
        if (!response.ok) {
          throw new Error('Failed to fetch recycling data')
        }
        const data: WasteCompany[] = await response.json()
        setCompanies(data)

        // Calculate recycling metrics
        const totalWasteProcessed = data.reduce((sum, c) => sum + c.annualVolume, 0)
        const totalRecycled = data.reduce((sum, c) => sum + (c.annualVolume * c.recyclingRate / 100), 0)
        const overallRecyclingRate = (totalRecycled / totalWasteProcessed) * 100

        // Top recyclers (80%+ recycling rate)
        const topRecyclers = data
          .filter(c => c.recyclingRate >= 80)
          .sort((a, b) => b.recyclingRate - a.recyclingRate)
          .slice(0, 10)

        // Companies needing improvement (<50% recycling rate)
        const improvementNeeded = data
          .filter(c => c.recyclingRate < 50)
          .sort((a, b) => a.recyclingRate - b.recyclingRate)
          .slice(0, 10)

        // Recycling by waste type
        const wasteTypes = [...new Set(data.map(c => c.wasteType))]
        const recyclingByType = wasteTypes.map(type => {
          const companiesOfType = data.filter(c => c.wasteType === type)
          const totalVolume = companiesOfType.reduce((sum, c) => sum + c.annualVolume, 0)
          const avgRate = companiesOfType.reduce((sum, c) => sum + c.recyclingRate, 0) / companiesOfType.length
          return {
            type,
            rate: avgRate,
            volume: totalVolume
          }
        })

        // Mock monthly trends
        const monthlyTrends = [
          { month: 'Jan', rate: 65.2, volume: 45000 },
          { month: 'Feb', rate: 67.1, volume: 47000 },
          { month: 'Mar', rate: 68.5, volume: 48500 },
          { month: 'Apr', rate: 70.2, volume: 50000 },
          { month: 'May', rate: 71.8, volume: 51500 },
          { month: 'Jun', rate: 73.4, volume: 53000 }
        ]

        setMetrics({
          totalWasteProcessed,
          totalRecycled,
          overallRecyclingRate,
          topRecyclers,
          improvementNeeded,
          recyclingByType,
          monthlyTrends,
          targets: {
            current: overallRecyclingRate,
            target: 85,
            deadline: '2024-12-31'
          },
          carbonSaved: totalRecycled * 0.85 // Mock calculation: 0.85 tons CO2 saved per ton recycled
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchRecyclingData()
  }, [selectedPeriod])

  const getRecyclingGrade = (rate: number) => {
    if (rate >= 90) return { grade: 'A+', color: 'text-green-700 bg-green-100', icon: Award }
    if (rate >= 80) return { grade: 'A', color: 'text-green-600 bg-green-50', icon: CheckCircle }
    if (rate >= 70) return { grade: 'B+', color: 'text-blue-600 bg-blue-50', icon: CheckCircle }
    if (rate >= 60) return { grade: 'B', color: 'text-yellow-600 bg-yellow-50', icon: AlertTriangle }
    if (rate >= 50) return { grade: 'C', color: 'text-orange-600 bg-orange-50', icon: AlertTriangle }
    return { grade: 'D', color: 'text-red-600 bg-red-50', icon: XCircle }
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="h-4 w-4 text-green-600" />
    if (current < previous) return <ArrowDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
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
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Recycling Data</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Recycle className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recycling Metrics</h1>
            <p className="text-gray-600">
              Track recycling performance and identify improvement opportunities
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex rounded-md border border-gray-300">
            {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 text-sm font-medium capitalize ${
                  selectedPeriod === period
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {period}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Recycling Rate</CardTitle>
            <Recycle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics.overallRecyclingRate)}</div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+3.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recycled</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalRecycled)} tons</div>
            <div className="flex items-center text-sm text-blue-600 mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+8.1% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.topRecyclers.length}</div>
            <p className="text-sm text-gray-600 mt-1">Companies with 80%+ rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbon Saved</CardTitle>
            <Leaf className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.carbonSaved)} CO2e</div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <TrendingDown className="h-4 w-4 mr-1" />
              <span>Emissions prevented</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Target Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Recycling Target Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">2024 Target</p>
                <p className="text-2xl font-bold">{metrics.targets.target}% by Dec 31</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Current Progress</p>
                <p className="text-2xl font-bold text-green-600">{formatPercentage(metrics.targets.current)}</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-green-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${(metrics.targets.current / metrics.targets.target) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>0%</span>
                <span>{metrics.targets.target}%</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Gap to target: {(metrics.targets.target - metrics.targets.current).toFixed(1)}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Recycling by Waste Type</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.recyclingByType.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.type}</p>
                    <p className="text-sm text-gray-500">{formatNumber(item.volume)} tons</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatPercentage(item.rate)}</p>
                    <Badge className={getRecyclingGrade(item.rate).color}>
                      {getRecyclingGrade(item.rate).grade}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Monthly Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.monthlyTrends.map((trend, index) => {
                const prevTrend = index > 0 ? metrics.monthlyTrends[index - 1] : trend
                return (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium w-8">{trend.month}</span>
                      {getTrendIcon(trend.rate, prevTrend.rate)}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPercentage(trend.rate)}</p>
                      <p className="text-sm text-gray-500">{formatNumber(trend.volume)} tons</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top and Bottom Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-600" />
              <span>Top Recycling Performers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topRecyclers.slice(0, 8).map((company, index) => {
                const grade = getRecyclingGrade(company.recyclingRate)
                const GradeIcon = grade.icon
                return (
                  <div key={company.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-gray-500">{company.country} • {formatNumber(company.annualVolume)} tons</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={grade.color}>
                        {formatPercentage(company.recyclingRate)}
                      </Badge>
                      <GradeIcon className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Improvement Opportunities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.improvementNeeded.slice(0, 8).map((company, index) => {
                const grade = getRecyclingGrade(company.recyclingRate)
                const GradeIcon = grade.icon
                return (
                  <div key={company.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-gray-500">{company.country} • {formatNumber(company.annualVolume)} tons</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={grade.color}>
                        {formatPercentage(company.recyclingRate)}
                      </Badge>
                      <GradeIcon className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Target Achievement</h3>
              <p className="text-sm text-blue-700 mb-3">
                Focus on companies with 50-70% recycling rates to reach 85% target
              </p>
              <Button size="sm" variant="outline">
                View Action Plan
              </Button>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Best Practices</h3>
              <p className="text-sm text-green-700 mb-3">
                Share successful recycling strategies from top performers
              </p>
              <Button size="sm" variant="outline">
                Share Insights
              </Button>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="font-medium text-orange-800 mb-2">Support Needed</h3>
              <p className="text-sm text-orange-700 mb-3">
                {metrics.improvementNeeded.length} companies need immediate recycling support
              </p>
              <Button size="sm" variant="outline">
                Contact Teams
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
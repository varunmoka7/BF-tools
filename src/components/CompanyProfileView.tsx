import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CompanyData } from '@/types/waste'
import { formatNumber, formatPercentage } from '@/lib/utils'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  Building2,
  TrendingUp,
  Recycle,
  MapPin,
  Award,
  Target,
  Calendar,
  BarChart3
} from 'lucide-react'

interface CompanyProfileViewProps {
  company: CompanyData
  className?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
  labelFormatter?: (value: any) => string
  valueFormatter?: (value: any) => string
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ 
  active, 
  payload, 
  label,
  valueFormatter = (value) => value?.toString() || ''
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-medium">{`Year: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.dataKey}: ${valueFormatter(entry.value)}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const WasteTrendChart: React.FC<{ company: CompanyData }> = ({ company }) => {
  const data = company.years.map((year, index) => ({
    year,
    wasteGenerated: company.wasteGenerated[index],
    recoveryRate: company.recoveryRates[index],
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Waste Generation & Recovery Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis yAxisId="waste" orientation="left" />
              <YAxis yAxisId="rate" orientation="right" domain={[0, 100]} />
              <Tooltip 
                content={(props) => (
                  <CustomTooltip 
                    {...props}
                    valueFormatter={(value) => {
                      if (typeof value === 'number' && value > 1000) {
                        return formatNumber(value, { compact: true, unit: ' tons' })
                      }
                      return formatPercentage(value)
                    }}
                  />
                )} 
              />
              <Legend />
              <Line 
                yAxisId="waste"
                type="monotone" 
                dataKey="wasteGenerated" 
                stroke="#2563eb"
                strokeWidth={3}
                name="Waste Generated (tons)"
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 6 }}
              />
              <Line 
                yAxisId="rate"
                type="monotone" 
                dataKey="recoveryRate" 
                stroke="#16a34a"
                strokeWidth={3}
                name="Recovery Rate (%)"
                dot={{ fill: '#16a34a', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

const TreatmentMethodsChart: React.FC<{ company: CompanyData }> = ({ company }) => {
  const data = Object.entries(company.treatmentMethods).map(([method, value]) => ({
    name: method.charAt(0).toUpperCase() + method.slice(1),
    value: value,
    color: {
      recycling: '#22c55e',
      composting: '#84cc16',
      energyRecovery: '#f59e0b',
      landfill: '#ef4444',
      incineration: '#8b5cf6'
    }[method] || '#6b7280'
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Recycle className="h-5 w-5" />
          Treatment Method Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${formatPercentage(value)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [formatPercentage(value), 'Share']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

const BenchmarkComparison: React.FC<{ company: CompanyData }> = ({ company }) => {
  const data = [
    {
      category: 'Industry',
      company: company.performanceScore,
      benchmark: company.benchmarkComparison.industry,
    },
    {
      category: 'Regional',
      company: company.performanceScore,
      benchmark: company.benchmarkComparison.regional,
    },
    {
      category: 'Global',
      company: company.performanceScore,
      benchmark: company.benchmarkComparison.global,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Benchmark Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value: number) => [formatPercentage(value), '']}
              />
              <Legend />
              <Bar dataKey="company" fill="#2563eb" name={company.name} />
              <Bar dataKey="benchmark" fill="#64748b" name="Benchmark Average" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export const CompanyProfileView: React.FC<CompanyProfileViewProps> = ({ company, className }) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'trends' | 'benchmarks'>('overview')

  const latestYear = company.years[company.years.length - 1]
  const latestWaste = company.wasteGenerated[company.wasteGenerated.length - 1]
  const latestRecovery = company.recoveryRates[company.recoveryRates.length - 1]
  
  const wasteGrowth = company.wasteGenerated.length > 1 
    ? ((latestWaste - company.wasteGenerated[0]) / company.wasteGenerated[0]) * 100
    : 0

  const recoveryImprovement = company.recoveryRates.length > 1
    ? latestRecovery - company.recoveryRates[0]
    : 0

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Company Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold">{company.name}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {company.country}
                    </span>
                    <span>•</span>
                    <span>{company.sector}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">#{company.ranking}</div>
                <div className="text-sm text-muted-foreground">Global Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatPercentage(company.performanceScore)}</div>
                <div className="text-sm text-muted-foreground">Performance Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">${formatNumber(company.marketValue, { compact: true, unit: 'M' })}</div>
                <div className="text-sm text-muted-foreground">Market Value</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">Current Waste Generation</div>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                {formatNumber(latestWaste, { compact: true, unit: ' tons' })}
              </div>
              <div className="flex items-center text-sm">
                <TrendingUp className={`h-4 w-4 mr-1 ${wasteGrowth >= 0 ? 'text-red-500' : 'text-green-500'}`} />
                <span className={wasteGrowth >= 0 ? 'text-red-600' : 'text-green-600'}>
                  {wasteGrowth >= 0 ? '+' : ''}{formatPercentage(wasteGrowth)} vs {company.years[0]}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">Recovery Rate</div>
                <Recycle className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(latestRecovery)}
              </div>
              <div className="space-y-1">
                <Progress value={latestRecovery} className="h-2" />
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                  <span className="text-green-600">
                    +{formatPercentage(recoveryImprovement, 1)}pp improvement
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">Hazardous Share</div>
                <Award className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                {formatPercentage(company.hazardousShare)}
              </div>
              <Badge variant={company.hazardousShare < 10 ? 'success' : company.hazardousShare < 15 ? 'warning' : 'danger'}>
                {company.hazardousShare < 10 ? 'Low Risk' : company.hazardousShare < 15 ? 'Medium Risk' : 'High Risk'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">Data Period</div>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                {company.years.length} Years
              </div>
              <div className="text-sm text-muted-foreground">
                {company.years[0]} - {latestYear}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <Card>
        <CardHeader>
          <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
            <Button
              variant={selectedTab === 'overview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTab('overview')}
            >
              Overview
            </Button>
            <Button
              variant={selectedTab === 'trends' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTab('trends')}
            >
              Trends
            </Button>
            <Button
              variant={selectedTab === 'benchmarks' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTab('benchmarks')}
            >
              Benchmarks
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <TreatmentMethodsChart company={company} />
          <BenchmarkComparison company={company} />
        </div>
      )}

      {selectedTab === 'trends' && (
        <WasteTrendChart company={company} />
      )}

      {selectedTab === 'benchmarks' && (
        <div className="grid gap-6 lg:grid-cols-1">
          <BenchmarkComparison company={company} />
        </div>
      )}
    </div>
  )
}
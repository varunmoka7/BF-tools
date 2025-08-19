import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { KPIMetric } from '@/types/waste'
import { formatNumber } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, Target, BarChart3 } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

interface KPIInsightCardsProps {
  metrics: KPIMetric[]
  className?: string
}

interface KPICardProps {
  metric: KPIMetric
}

const TrendChart: React.FC<{ data: number[]; positive: boolean }> = ({ data, positive }) => {
  const chartData = data.map((value, index) => ({ index, value }))
  
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={positive ? "#22c55e" : "#ef4444"}
          strokeWidth={2}
          dot={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            fontSize: '12px'
          }}
          labelStyle={{ display: 'none' }}
          formatter={(value: number) => [formatNumber(value, { decimals: 1 }), '']}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

const KPICard: React.FC<KPICardProps> = ({ metric }) => {

  const isImproving = (metric.id === 'hazardous-share' && metric.change < 0) || 
                     (metric.id !== 'hazardous-share' && metric.change > 0)

  const getTrendIconComponent = () => {
    if (metric.change > 0) return <TrendingUp className="h-4 w-4" />
    if (metric.change < 0) return <TrendingDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getProgressValue = () => {
    if (metric.target) {
      return (metric.value / metric.target) * 100
    }
    if (metric.benchmark) {
      return Math.min((metric.value / metric.benchmark) * 50, 100)
    }
    return 70 // Default visual progress
  }

  const getProgressColor = () => {
    const progress = getProgressValue()
    if (progress >= 80) return "bg-green-500"
    if (progress >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.title}
        </CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Main Value */}
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold">
              {formatNumber(metric.value, { 
                decimals: metric.unit === '%' ? 1 : 0,
                compact: metric.value > 1000000
              })}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {metric.unit}
              </span>
            </div>
            <Badge 
              variant={isImproving ? "success" : "warning"}
              className="flex items-center gap-1"
            >
              {getTrendIconComponent()}
              {Math.abs(metric.change)}{metric.unit === '%' ? 'pp' : '%'}
            </Badge>
          </div>

          {/* Trend Chart */}
          <div className="h-10">
            <TrendChart data={metric.trend} positive={isImproving} />
          </div>

          {/* Progress vs Target/Benchmark */}
          <div className="space-y-2">
            {metric.target && (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress to Target</span>
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {formatNumber(metric.target, { 
                      decimals: metric.unit === '%' ? 1 : 0,
                      compact: true
                    })}{metric.unit}
                  </span>
                </div>
                <div className="relative">
                  <Progress value={getProgressValue()} className="h-2" />
                  <div 
                    className={`absolute top-0 h-2 rounded transition-all ${getProgressColor()}`}
                    style={{ width: `${Math.min(getProgressValue(), 100)}%` }}
                  />
                </div>
              </div>
            )}
            
            {metric.benchmark && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">vs Benchmark:</span>
                <span className={`font-medium ${
                  metric.value > metric.benchmark ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.value > metric.benchmark ? '+' : ''}{formatNumber(
                    ((metric.value - metric.benchmark) / metric.benchmark) * 100,
                    { decimals: 1 }
                  )}%
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground leading-tight">
            {metric.description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export const KPIInsightCards: React.FC<KPIInsightCardsProps> = ({ metrics, className }) => {
  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className || ''}`}>
      {metrics.map((metric) => (
        <KPICard key={metric.id} metric={metric} />
      ))}
    </div>
  )
}
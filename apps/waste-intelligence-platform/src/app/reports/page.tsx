'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  Plus,
  Eye,
  Share,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  TrendingUp,
  Globe,
  Building2,
  Recycle
} from 'lucide-react'

interface Report {
  id: string
  title: string
  description: string
  type: 'compliance' | 'performance' | 'environmental' | 'financial' | 'operational'
  status: 'completed' | 'generating' | 'scheduled' | 'failed'
  createdAt: Date
  size: string
  format: 'PDF' | 'Excel' | 'CSV'
  scheduleType?: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  nextRun?: Date
  tags: string[]
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<{
    type: string
    status: string
    timeframe: string
  }>({
    type: 'all',
    status: 'all',
    timeframe: '30d'
  })

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockReports: Report[] = [
      {
        id: '1',
        title: 'Monthly Compliance Report',
        description: 'Comprehensive compliance analysis across all companies',
        type: 'compliance',
        status: 'completed',
        createdAt: new Date('2024-01-15'),
        size: '2.3 MB',
        format: 'PDF',
        scheduleType: 'monthly',
        nextRun: new Date('2024-02-15'),
        tags: ['compliance', 'regulatory', 'monthly']
      },
      {
        id: '2',
        title: 'Performance Dashboard Summary',
        description: 'Key performance indicators and trends analysis',
        type: 'performance',
        status: 'completed',
        createdAt: new Date('2024-01-14'),
        size: '1.8 MB',
        format: 'PDF',
        tags: ['performance', 'KPI', 'trends']
      },
      {
        id: '3',
        title: 'Environmental Impact Assessment',
        description: 'Carbon footprint and environmental metrics report',
        type: 'environmental',
        status: 'generating',
        createdAt: new Date('2024-01-16'),
        size: 'Generating...',
        format: 'PDF',
        tags: ['environmental', 'carbon', 'impact']
      },
      {
        id: '4',
        title: 'Financial Performance Q1 2024',
        description: 'Revenue, costs, and financial KPIs for Q1',
        type: 'financial',
        status: 'completed',
        createdAt: new Date('2024-01-10'),
        size: '3.1 MB',
        format: 'Excel',
        tags: ['financial', 'quarterly', 'revenue']
      },
      {
        id: '5',
        title: 'Weekly Operations Report',
        description: 'Operational metrics and company performance',
        type: 'operational',
        status: 'scheduled',
        createdAt: new Date('2024-01-16'),
        size: 'Scheduled',
        format: 'CSV',
        scheduleType: 'weekly',
        nextRun: new Date('2024-01-22'),
        tags: ['operations', 'weekly', 'metrics']
      },
      {
        id: '6',
        title: 'Recycling Efficiency Analysis',
        description: 'Detailed analysis of recycling rates and efficiency',
        type: 'environmental',
        status: 'failed',
        createdAt: new Date('2024-01-13'),
        size: 'Error',
        format: 'PDF',
        tags: ['recycling', 'efficiency', 'analysis']
      }
    ]

    setTimeout(() => {
      setReports(mockReports)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'generating':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-yellow-600" />
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusBadge = (status: Report['status']) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      generating: 'bg-blue-100 text-blue-800',
      scheduled: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    }
    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'compliance':
        return <CheckCircle className="h-5 w-5 text-blue-600" />
      case 'performance':
        return <BarChart3 className="h-5 w-5 text-green-600" />
      case 'environmental':
        return <Globe className="h-5 w-5 text-green-500" />
      case 'financial':
        return <TrendingUp className="h-5 w-5 text-purple-600" />
      case 'operational':
        return <Building2 className="h-5 w-5 text-orange-600" />
    }
  }

  const reportTemplates = [
    {
      name: 'Compliance Report',
      description: 'Regulatory compliance status and recommendations',
      type: 'compliance' as const,
      icon: CheckCircle
    },
    {
      name: 'Performance Dashboard',
      description: 'KPI summary with trends and insights',
      type: 'performance' as const,
      icon: BarChart3
    },
    {
      name: 'Environmental Impact',
      description: 'Carbon footprint and sustainability metrics',
      type: 'environmental' as const,
      icon: Globe
    },
    {
      name: 'Financial Summary',
      description: 'Revenue, costs, and financial performance',
      type: 'financial' as const,
      icon: TrendingUp
    },
    {
      name: 'Operations Report',
      description: 'Operational efficiency and company metrics',
      type: 'operational' as const,
      icon: Building2
    }
  ]

  const filteredReports = reports.filter(report => {
    if (filter.type !== 'all' && report.type !== filter.type) return false
    if (filter.status !== 'all' && report.status !== filter.status) return false
    // Add timeframe filtering logic here
    return true
  })

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
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600">
              Generate and manage waste management reports
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">+3 this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Ready to download</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.scheduleType).length}
            </div>
            <p className="text-xs text-muted-foreground">Automated reports</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.status === 'generating').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently generating</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {reportTemplates.map((template, index) => {
              const Icon = template.icon
              return (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <h3 className="font-medium">{template.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{template.description}</p>
                  <Button size="sm" className="mt-3 w-full">
                    Generate
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              >
                <option value="all">All Types</option>
                <option value="compliance">Compliance</option>
                <option value="performance">Performance</option>
                <option value="environmental">Environmental</option>
                <option value="financial">Financial</option>
                <option value="operational">Operational</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="generating">Generating</option>
                <option value="scheduled">Scheduled</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={filter.timeframe}
                onChange={(e) => setFilter({ ...filter, timeframe: e.target.value })}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {getTypeIcon(report.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {report.title}
                        </h3>
                        {getStatusBadge(report.status)}
                        <Badge variant="outline">{report.format}</Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">{report.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{report.createdAt.toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span>{report.size}</span>
                        </div>
                        
                        {report.scheduleType && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Runs {report.scheduleType}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-1">
                        {report.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {getStatusIcon(report.status)}
                    
                    {report.status === 'completed' && (
                      <>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {report.status === 'failed' && (
                      <Button variant="outline" size="sm">
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
                
                {report.nextRun && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      Next scheduled run: {report.nextRun.toLocaleDateString()} at {report.nextRun.toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No reports found matching your filters</p>
                <Button variant="outline" className="mt-4" onClick={() => setFilter({
                  type: 'all',
                  status: 'all',
                  timeframe: '30d'
                })}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
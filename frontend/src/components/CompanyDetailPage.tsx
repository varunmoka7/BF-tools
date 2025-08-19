import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { ArrowLeft, ExternalLink, Building2, Globe, TrendingUp, AlertTriangle } from 'lucide-react'
import { supabaseService } from '../services/supabaseService'
import { Company, CompanyMetric, WasteStream } from '../types/waste'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface CompanyDetailPageProps {
  className?: string
}

export const CompanyDetailPage: React.FC<CompanyDetailPageProps> = ({ className }) => {
  const { id } = useParams<{ id: string }>()
  const [company, setCompany] = useState<Company | null>(null)
  const [metrics, setMetrics] = useState<CompanyMetric[]>([])
  const [wasteStreams, setWasteStreams] = useState<WasteStream[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadCompanyData(id)
    }
  }, [id])

  const loadCompanyData = async (companyId: string) => {
    try {
      setLoading(true)
      const data = await supabaseService.getCompanyById(companyId)
      setCompany(data.company)
      setMetrics(data.metrics)
      setWasteStreams(data.wasteStreams)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load company data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading company data...</div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Company</h2>
          <p className="text-muted-foreground mb-4">{error || 'Company not found'}</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Calculate latest metrics
  const latestMetrics = metrics[0] || null
  const latestYear = latestMetrics?.reporting_period || company.year_of_disclosure || 2024

  // Prepare chart data
  const historicalData = metrics.map(metric => ({
    year: metric.reporting_period,
    wasteGenerated: metric.total_waste_generated || 0,
    wasteDisposed: metric.total_waste_disposed || 0,
    wasteRecovered: metric.total_waste_recovered || 0
  })).reverse()

  const wasteCompositionData = latestMetrics ? [
    { name: 'Waste Recovered', value: latestMetrics.total_waste_recovered || 0, color: '#10b981' },
    { name: 'Waste Disposed', value: latestMetrics.total_waste_disposed || 0, color: '#ef4444' }
  ] : []

  const recoveryRate = latestMetrics?.recovery_rate || 0

  return (
    <div className={`min-h-screen bg-background ${className || ''}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{company.company_name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {company.sector} • {company.industry}
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {company.country}
                </div>
                {company.employees && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {company.employees.toLocaleString()} employees
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <Badge variant="outline" className="text-lg px-4 py-2">
                Latest Year: {latestYear}
              </Badge>
            </div>
          </div>
        </div>

        {/* KPI Scorecards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Waste Generated ({latestYear})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestMetrics?.total_waste_generated?.toLocaleString() || 'N/A'} tonnes
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recovery Rate ({latestYear})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {recoveryRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Target: 85%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Waste per Employee ({latestYear})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {company.employees && latestMetrics?.total_waste_generated 
                  ? (latestMetrics.total_waste_generated / company.employees).toFixed(2)
                  : 'N/A'} tonnes/employee
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Historical Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Historical Waste Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'tonnes']} />
                  <Bar dataKey="wasteGenerated" fill="#3b82f6" name="Waste Generated" />
                  <Bar dataKey="wasteDisposed" fill="#ef4444" name="Waste Disposed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Waste Composition Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Waste Composition ({latestYear})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[300px]">
                {wasteCompositionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={wasteCompositionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {wasteCompositionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'tonnes']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p>No composition data available</p>
                  </div>
                )}
              </div>
              <div className="text-center mt-4">
                <div className="text-2xl font-bold text-green-600">
                  {recoveryRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Overall Recovery Rate</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detailed Waste Streams</CardTitle>
            <p className="text-sm text-muted-foreground">
              Raw waste data from {company.company_name}
            </p>
          </CardHeader>
          <CardContent>
            {wasteStreams.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Year</th>
                      <th className="text-left p-2">Metric</th>
                      <th className="text-left p-2">Hazardousness</th>
                      <th className="text-left p-2">Treatment Method</th>
                      <th className="text-left p-2">Value</th>
                      <th className="text-left p-2">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wasteStreams.map((stream) => (
                      <tr key={stream.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">{stream.reporting_period}</td>
                        <td className="p-2">{stream.metric}</td>
                        <td className="p-2">
                          <Badge variant={stream.hazardousness === 'hazardous' ? 'destructive' : 'secondary'}>
                            {stream.hazardousness}
                          </Badge>
                        </td>
                        <td className="p-2">{stream.treatment_method}</td>
                        <td className="p-2 font-mono">{stream.value.toLocaleString()}</td>
                        <td className="p-2">{stream.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No waste stream data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Source Documents */}
        {company.document_urls && Object.keys(company.document_urls).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Source Documents</CardTitle>
              <p className="text-sm text-muted-foreground">
                Original reports and data sources
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(company.document_urls).map(([name, url]) => (
                  <div key={name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{name}</h4>
                      <p className="text-sm text-muted-foreground">Source document</p>
                    </div>
                    <Button variant="outline" asChild>
                      <a href={url as string} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Document
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

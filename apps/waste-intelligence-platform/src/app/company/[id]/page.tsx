'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/utils'
import { 
  Building2, 
  MapPin, 
  Users, 
  Calendar,
  TrendingUp,
  Recycle,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Globe,
  BarChart3,
  FileText,
  Target,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { CompanyOverviewCard } from '@/components/companies/CompanyOverviewCard'

interface Company {
  id: string;
  name: string;
  country: string;
  sector: string;
  industry: string;
  employees: number;
  year_of_disclosure: number;
  ticker: string;
  exchange: string;
  isin: string;
  lei: string;
  figi: string;
  permid: string;
  coordinates: {
    lat: number;
    lng: number;
    accuracy: number;
    address: string;
    source: string;
  };
}

interface WasteMetrics {
  totalWasteGenerated: number;
  totalWasteRecovered: number;
  totalWasteDisposed: number;
  hazardousWasteGenerated: number;
  hazardousWasteRecovered: number;
  nonHazardousWasteGenerated: number;
  recoveryRate: number;
  hazardousRecoveryRate: number;
  nonHazardousRecoveryRate: number;
}

interface WasteStream {
  id: string;
  wasteType: string;
  generated: number;
  recovered: number;
  disposed: number;
  hazardousness: 'Hazardous' | 'Non-Hazardous';
  treatmentMethod: string;
  unit: string;
  dataQuality: 'Complete' | 'Partial' | 'Estimated';
}

export default function CompanyDetailPage() {
  const params = useParams()
  const companyId = params.id as string
  
  const [company, setCompany] = useState<Company | null>(null)
  const [wasteMetrics, setWasteMetrics] = useState<WasteMetrics | null>(null)
  const [wasteStreams, setWasteStreams] = useState<WasteStream[]>([])
  const [companyOverview, setCompanyOverview] = useState<{enhanced_overview?: string, business_overview?: string, source?: string} | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCompanyData() {
      try {
        setLoading(true)
        
        // Fetch company data
        const response = await fetch('/api/companies-with-coordinates')
        if (!response.ok) {
          throw new Error('Failed to fetch company data')
        }
        
        const companies: Company[] = await response.json()
        const foundCompany = companies.find(c => c.id === companyId)
        
        if (!foundCompany) {
          throw new Error('Company not found')
        }
        
        setCompany(foundCompany)
        
        // Generate mock waste metrics based on company size and sector
        const mockWasteMetrics = generateMockWasteMetrics(foundCompany)
        setWasteMetrics(mockWasteMetrics)
        
        // Generate mock waste streams
        const mockWasteStreams = generateMockWasteStreams(foundCompany)
        setWasteStreams(mockWasteStreams)
        
        // Load company overview data
        try {
          const overviewResponse = await fetch('/company-overviews-final.json')
          if (overviewResponse.ok) {
            const overviews = await overviewResponse.json()
            const companyOverviewData = overviews.find((o: any) => o.company_id === foundCompany.id)
            if (companyOverviewData) {
              setCompanyOverview(companyOverviewData)
            }
          }
        } catch (overviewError) {
          console.log('Overview data not available, using basic company info')
        }
        
      } catch (err: any) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyData()
  }, [companyId])

  function generateMockWasteMetrics(company: Company): WasteMetrics {
    const baseWaste = company.employees * 0.5 // 0.5 tons per employee per year
    const totalWaste = baseWaste + (Math.random() * baseWaste * 0.3)
    const recoveryRate = 60 + (Math.random() * 30) // 60-90%
    const hazardousRate = 15 + (Math.random() * 20) // 15-35%
    
    return {
      totalWasteGenerated: Math.round(totalWaste),
      totalWasteRecovered: Math.round(totalWaste * (recoveryRate / 100)),
      totalWasteDisposed: Math.round(totalWaste * ((100 - recoveryRate) / 100)),
      hazardousWasteGenerated: Math.round(totalWaste * (hazardousRate / 100)),
      hazardousWasteRecovered: Math.round(totalWaste * (hazardousRate / 100) * (recoveryRate / 100)),
      nonHazardousWasteGenerated: Math.round(totalWaste * ((100 - hazardousRate) / 100)),
      recoveryRate: Math.round(recoveryRate * 10) / 10,
      hazardousRecoveryRate: Math.round((recoveryRate + Math.random() * 10) * 10) / 10,
      nonHazardousRecoveryRate: Math.round((recoveryRate - Math.random() * 10) * 10) / 10
    }
  }

  function generateMockWasteStreams(company: Company): WasteStream[] {
    const streams = [
      {
        id: '1',
        wasteType: 'General Waste',
        generated: Math.round(company.employees * 0.3),
        recovered: Math.round(company.employees * 0.2),
        disposed: Math.round(company.employees * 0.1),
        hazardousness: 'Non-Hazardous' as const,
        treatmentMethod: 'Recycling & Composting',
        unit: 'Metric Tonnes',
        dataQuality: 'Complete' as const
      },
      {
        id: '2',
        wasteType: 'Hazardous Waste',
        generated: Math.round(company.employees * 0.1),
        recovered: Math.round(company.employees * 0.06),
        disposed: Math.round(company.employees * 0.04),
        hazardousness: 'Hazardous' as const,
        treatmentMethod: 'Specialized Treatment',
        unit: 'Metric Tonnes',
        dataQuality: 'Complete' as const
      },
      {
        id: '3',
        wasteType: 'Electronic Waste',
        generated: Math.round(company.employees * 0.05),
        recovered: Math.round(company.employees * 0.04),
        disposed: Math.round(company.employees * 0.01),
        hazardousness: 'Hazardous' as const,
        treatmentMethod: 'E-Waste Recycling',
        unit: 'Metric Tonnes',
        dataQuality: 'Partial' as const
      },
      {
        id: '4',
        wasteType: 'Construction Waste',
        generated: Math.round(company.employees * 0.05),
        recovered: Math.round(company.employees * 0.03),
        disposed: Math.round(company.employees * 0.02),
        hazardousness: 'Non-Hazardous' as const,
        treatmentMethod: 'Material Recovery',
        unit: 'Metric Tonnes',
        dataQuality: 'Estimated' as const
      }
    ]
    
    return streams
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Company</h2>
          <p className="text-red-600">{error || 'Company not found'}</p>
          <Link href="/companies">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Companies
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/companies">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
            <p className="text-gray-600">
              {company.sector} • {company.industry} • {company.country}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{company.ticker}</Badge>
          <Badge variant="secondary">{company.exchange}</Badge>
        </div>
      </div>

      {/* Company Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(company.employees)}</div>
            <p className="text-xs text-muted-foreground">Total workforce</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Location</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{company.country}</div>
            <p className="text-xs text-muted-foreground">{company.coordinates.address}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sector</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{company.sector}</div>
            <p className="text-xs text-muted-foreground">{company.industry}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reporting Year</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.year_of_disclosure}</div>
            <p className="text-xs text-muted-foreground">Latest disclosure</p>
          </CardContent>
        </Card>
      </div>

      {/* Company Overview */}
      <CompanyOverviewCard 
        company={{
          company_name: company.name,
          sector: company.sector,
          industry: company.industry,
          country: company.country,
          employees: company.employees
        }}
        overview={companyOverview}
      />

      {/* Waste Management Metrics */}
      {wasteMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Recycle className="h-5 w-5" />
              Waste Management Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Waste Generation</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Generated:</span>
                    <span className="font-medium">{formatNumber(wasteMetrics.totalWasteGenerated)} tons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hazardous:</span>
                    <span className="font-medium">{formatNumber(wasteMetrics.hazardousWasteGenerated)} tons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Non-Hazardous:</span>
                    <span className="font-medium">{formatNumber(wasteMetrics.nonHazardousWasteGenerated)} tons</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Recovery & Disposal</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Recovered:</span>
                    <span className="font-medium text-green-600">{formatNumber(wasteMetrics.totalWasteRecovered)} tons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Disposed:</span>
                    <span className="font-medium text-red-600">{formatNumber(wasteMetrics.totalWasteDisposed)} tons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Overall Recovery Rate:</span>
                    <span className="font-medium text-green-600">{wasteMetrics.recoveryRate}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Recovery Rates</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hazardous:</span>
                    <span className="font-medium">{wasteMetrics.hazardousRecoveryRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Non-Hazardous:</span>
                    <span className="font-medium">{wasteMetrics.nonHazardousRecoveryRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Data Quality:</span>
                    <Badge variant="outline" className="text-xs">Complete</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waste Streams */}
      {wasteStreams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Detailed Waste Streams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Waste Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Generated</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Recovered</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Disposed</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hazardousness</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Treatment Method</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data Quality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {wasteStreams.map((stream) => (
                    <tr key={stream.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium">{stream.wasteType}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-900">{formatNumber(stream.generated)}</span>
                        <span className="text-xs text-gray-500 ml-1">{stream.unit}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-600 font-medium">{formatNumber(stream.recovered)}</span>
                        <span className="text-xs text-gray-500 ml-1">{stream.unit}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-red-600 font-medium">{formatNumber(stream.disposed)}</span>
                        <span className="text-xs text-gray-500 ml-1">{stream.unit}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge 
                          variant={stream.hazardousness === 'Hazardous' ? 'destructive' : 'secondary'}
                        >
                          {stream.hazardousness}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900">{stream.treatmentMethod}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge 
                          variant={
                            stream.dataQuality === 'Complete' ? 'default' : 
                            stream.dataQuality === 'Partial' ? 'secondary' : 'outline'
                          }
                        >
                          {stream.dataQuality}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company Identifiers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Company Identifiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ISIN:</span>
                <span className="font-mono text-sm">{company.isin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">LEI:</span>
                <span className="font-mono text-sm">{company.lei}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">FIGI:</span>
                <span className="font-mono text-sm">{company.figi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">PermID:</span>
                <span className="font-mono text-sm">{company.permid}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
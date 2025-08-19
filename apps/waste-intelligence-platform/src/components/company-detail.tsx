'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Company, CompanyMetric } from '@/types/waste'
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Factory, 
  Calendar,
  Trash2,
  Recycle,
  TrendingUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CompanyDetailProps {
  company: Company
  metrics: CompanyMetric | null
}

export function CompanyDetail({ company, metrics }: CompanyDetailProps) {
  const router = useRouter()

  const formatNumber = (num: number | null | undefined) => {
    if (num == null) return 'N/A'
    return num.toLocaleString()
  }

  const formatPercentage = (num: number | null | undefined) => {
    if (num == null) return 'N/A'
    return `${num.toFixed(1)}%`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Directory
          </Button>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {company.company_name}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{company.country}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Factory className="h-4 w-4" />
                      <Badge variant="secondary">{company.sector}</Badge>
                    </div>
                    {company.industry && (
                      <div className="text-sm">
                        Industry: {company.industry}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {company.latest_year && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Latest data: {company.latest_year}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Trash2 className="h-4 w-4 text-red-500" />
                Total Waste Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metrics 
                  ? formatNumber(metrics.total_waste_generated) 
                  : formatNumber(company.total_waste_latest)
                }
              </div>
              <p className="text-xs text-gray-600">
                {metrics 
                  ? `tonnes (${metrics.reporting_year})` 
                  : company.latest_year ? `tonnes (${company.latest_year})` : 'tonnes'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Recycle className="h-4 w-4 text-green-500" />
                Recovery Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metrics 
                  ? formatPercentage(metrics.recovery_rate) 
                  : formatPercentage(company.recovery_rate_latest)
                }
              </div>
              <p className="text-xs text-gray-600">
                of total waste generated
              </p>
            </CardContent>
          </Card>

          {metrics && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Waste Recovered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatNumber(metrics.total_waste_recovered)}
                </div>
                <p className="text-xs text-gray-600">
                  tonnes ({metrics.reporting_year})
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Company ID:</span>
                      <span>{company.company_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Country:</span>
                      <span>{company.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sector:</span>
                      <span>{company.sector}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Industry:</span>
                      <span>{company.industry}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {metrics && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Detailed Metrics ({metrics.reporting_year})</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Waste Generated:</span>
                        <span>{formatNumber(metrics.total_waste_generated)} tonnes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Waste Recovered:</span>
                        <span>{formatNumber(metrics.total_waste_recovered)} tonnes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Waste Disposed:</span>
                        <span>{formatNumber(metrics.total_waste_disposed)} tonnes</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-900">Recovery Rate:</span>
                        <span className="text-green-600">{formatPercentage(metrics.recovery_rate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!metrics && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded">
                  <TrendingUp className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-medium text-yellow-800 mb-1">
                    Limited Metrics Available
                  </h3>
                  <p className="text-sm text-yellow-700">
                    Detailed waste metrics are not available for this company in our aggregated dataset. 
                    The basic information shown above comes from our company directory.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
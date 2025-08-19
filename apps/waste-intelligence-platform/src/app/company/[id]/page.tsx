'use client'

import { useEffect, useState } from 'react'
import { pilotCompanies, PilotCompany } from '@/data/pilot-companies'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { 
  Building2, 
  MapPin, 
  Recycle, 
  TrendingUp, 
  Globe,
  Calendar,
  Users,
  Target,
  Award,
  FileText,
  Factory,
  Leaf,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  ExternalLink,
  Phone,
  Mail,
  Globe as GlobeIcon
} from 'lucide-react'
import Link from 'next/link'

interface CompanyPageProps {
  params: {
    id: string
  }
}

export default function CompanyPage({ params }: CompanyPageProps) {
  const [company, setCompany] = useState<PilotCompany | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const foundCompany = pilotCompanies.find(c => c.id === params.id)
    setCompany(foundCompany || null)
    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Company Not Found</h2>
          <p className="text-red-600">The requested company could not be found.</p>
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
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Companies
            </Button>
          </Link>
          <Building2 className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
            <p className="text-gray-600">{company.sector} • {company.industry}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Target className="h-4 w-4 mr-1" />
            Pilot Company
          </Badge>
          {company.website_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Website
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Company Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Company Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-sm text-gray-900 mt-1">{company.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Overview</label>
                  <p className="text-sm text-gray-900 mt-1">{company.business_overview}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Founded</label>
                  <p className="text-sm text-gray-900 mt-1">{company.founded_year}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Headquarters</label>
                  <p className="text-sm text-gray-900 mt-1">{company.headquarters}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Revenue</label>
                  <p className="text-sm text-gray-900 mt-1">{formatCurrency(company.revenue_usd || 0)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Market Cap</label>
                  <p className="text-sm text-gray-900 mt-1">{company.market_cap_usd ? formatCurrency(company.market_cap_usd) : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Waste Management Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Recycle className="h-5 w-5" />
                <span>Waste Management Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Strategy</label>
                <p className="text-sm text-gray-900 mt-1">{company.waste_profile.waste_management_strategy}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Primary Waste Materials</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {company.waste_profile.primary_waste_materials.map((material, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Treatment Methods</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {company.waste_profile.waste_treatment_methods.map((method, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Recycling Facilities</label>
                  <p className="text-sm text-gray-900 mt-1">{company.waste_profile.recycling_facilities_count}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Zero Waste Commitment</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {company.waste_profile.zero_waste_commitment ? 'Yes' : 'No'}
                    {company.waste_profile.zero_waste_target_year && ` (${company.waste_profile.zero_waste_target_year})`}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Carbon Neutrality</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {company.waste_profile.carbon_neutrality_commitment ? 'Yes' : 'No'}
                    {company.waste_profile.carbon_neutrality_target_year && ` (${company.waste_profile.carbon_neutrality_target_year})`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sustainability Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Sustainability Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ESG Score</label>
                  <p className="text-2xl font-bold text-gray-900">{company.sustainability_metrics?.esg_score || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Recycling Rate</label>
                  <p className="text-2xl font-bold text-blue-600">{company.sustainability_metrics?.recycling_rate_percentage || 0}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Carbon Footprint</label>
                  <p className="text-2xl font-bold text-orange-600">{formatNumber(company.sustainability_metrics?.carbon_footprint_tonnes || 0)} tCO2</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Renewable Energy</label>
                  <p className="text-2xl font-bold text-green-600">{company.sustainability_metrics?.renewable_energy_percentage || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {company.primary_contact_email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{company.primary_contact_email}</span>
                </div>
              )}
              {company.sustainability_contact_email && (
                <div className="flex items-center space-x-2">
                  <Leaf className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{company.sustainability_contact_email}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ESG Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>ESG Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {company.esg_documents.map((doc, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <a 
                    href={doc.document_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {doc.document_title}
                  </a>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Certifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {company.certifications.map((cert, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{cert.certification_name}</p>
                    <p className="text-xs text-gray-500">{cert.issuing_organization}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Waste Facilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Factory className="h-5 w-5" />
                <span>Waste Facilities</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {company.waste_facilities.map((facility, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Factory className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{facility.facility_name}</p>
                    <p className="text-xs text-gray-500">{facility.location}</p>
                    <p className="text-xs text-gray-500">{formatNumber(facility.capacity_tonnes_per_year)} tons/year</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

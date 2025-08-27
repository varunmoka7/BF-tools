'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Globe, 
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Info
} from 'lucide-react'

interface CompanyOverviewProps {
  company: {
    company_name: string
    description?: string
    business_overview?: string
    website_url?: string
    founded_year?: number
    headquarters?: string
    revenue_usd?: number
    employees?: number
    sector: string
    industry: string
    country: string
    is_public?: boolean
    stock_exchange?: string
    market_cap_usd?: number
  }
  overview?: {
    enhanced_overview?: string
    business_overview?: string
    source?: string
  }
}

export function CompanyOverviewCard({ company, overview }: CompanyOverviewProps) {
  const formatCurrency = (amount: number | undefined | null) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount)
  }

  const formatNumber = (num: number | undefined | null) => {
    if (!num) return 'N/A'
    return num.toLocaleString()
  }

  // Use overview data if available, otherwise fall back to company data
  const displayOverview = overview?.enhanced_overview || company.description
  const displayBusiness = overview?.business_overview || company.business_overview

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          Company Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Main Description */}
        {displayOverview && (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">About {company.company_name}</h3>
            <p className="text-gray-700 leading-relaxed">
              {displayOverview}
            </p>
          </div>
        )}

        {/* Business Overview */}
        {displayBusiness && (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Business Overview</h3>
            <p className="text-gray-700 leading-relaxed">
              {displayBusiness}
            </p>
          </div>
        )}

        {/* Key Company Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          
          {/* Left Column */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Company Details</h3>
            
            {company.founded_year && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">Founded:</span>
                  <span className="ml-2 font-medium">{company.founded_year}</span>
                </div>
              </div>
            )}

            {company.headquarters && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">Headquarters:</span>
                  <span className="ml-2 font-medium">{company.headquarters}</span>
                </div>
              </div>
            )}

            {company.employees && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">Employees:</span>
                  <span className="ml-2 font-medium">{formatNumber(company.employees)}</span>
                </div>
              </div>
            )}

            {company.website_url && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">Website:</span>
                  <a 
                    href={company.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Visit Website
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Financial Information</h3>
            
            {company.is_public && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <div>
                  <Badge variant="secondary">Public Company</Badge>
                  {company.stock_exchange && (
                    <Badge variant="outline" className="ml-2">
                      {company.stock_exchange}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {company.revenue_usd && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">Revenue:</span>
                  <span className="ml-2 font-medium">{formatCurrency(company.revenue_usd)}</span>
                </div>
              </div>
            )}

            {company.market_cap_usd && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">Market Cap:</span>
                  <span className="ml-2 font-medium">{formatCurrency(company.market_cap_usd)}</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="default">{company.sector}</Badge>
              <Badge variant="outline">{company.industry}</Badge>
              <Badge variant="outline">{company.country}</Badge>
            </div>
          </div>
        </div>

        {/* Data Source Attribution */}
        {overview?.source && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Overview source: {overview.source}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
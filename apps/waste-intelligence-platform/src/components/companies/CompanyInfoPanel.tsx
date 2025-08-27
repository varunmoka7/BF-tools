'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Info
} from 'lucide-react'

interface Company {
  id: string;
  name: string;
  country: string;
  sector: string;
  industry: string;
  employees: number;
  year_of_disclosure: number;
}

interface CompanyOverview {
  enhanced_overview?: string;
  business_overview?: string;
  source?: string;
}

interface CompanyInfoPanelProps {
  company: Company;
  overview?: CompanyOverview | null;
  companyDetails?: {
    company_name: string;
    founded_year?: number;
    headquarters?: string;
    revenue_usd?: number;
    market_cap_usd?: number;
    is_public?: boolean;
    stock_exchange?: string;
  };
}

export function CompanyInfoPanel({ company, overview, companyDetails }: CompanyInfoPanelProps) {
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

  const displayOverview = overview?.enhanced_overview || overview?.business_overview

  return (
    <div className="space-y-6">
      {/* Company Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Company Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayOverview ? (
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                {displayOverview}
              </p>
              {overview?.source && (
                <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                  Source: {overview.source}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">No company overview available</p>
          )}
        </CardContent>
      </Card>

      {/* Key Facts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-green-600" />
            Key Facts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Basic Company Info */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Employees</span>
              </div>
              <span className="font-semibold">{formatNumber(company.employees)}</span>
            </div>

            {companyDetails?.founded_year && (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Founded</span>
                </div>
                <span className="font-semibold">{companyDetails.founded_year}</span>
              </div>
            )}

            {companyDetails?.headquarters && (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Headquarters</span>
                </div>
                <span className="font-semibold">{companyDetails.headquarters}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Latest Disclosure</span>
              </div>
              <span className="font-semibold">{company.year_of_disclosure}</span>
            </div>
          </div>

          {/* Financial Information */}
          {(companyDetails?.revenue_usd || companyDetails?.market_cap_usd || companyDetails?.is_public) && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Financial Information</h4>
              
              {companyDetails?.is_public && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Status</span>
                  <div className="flex gap-2">
                    <Badge variant="secondary">Public Company</Badge>
                    {companyDetails?.stock_exchange && (
                      <Badge variant="outline">{companyDetails.stock_exchange}</Badge>
                    )}
                  </div>
                </div>
              )}

              {companyDetails?.revenue_usd && (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Revenue</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(companyDetails.revenue_usd)}</span>
                </div>
              )}

              {companyDetails?.market_cap_usd && (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Market Cap</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(companyDetails.market_cap_usd)}</span>
                </div>
              )}
            </div>
          )}

          {/* Industry Classification */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Classification</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">{company.sector}</Badge>
              <Badge variant="outline">{company.industry}</Badge>
              <Badge variant="outline">{company.country}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Info
} from 'lucide-react'

interface CompanyOverviewProps {
  company: {
    company_name: string
    description?: string
    business_overview?: string
  }
  overview?: {
    enhanced_overview?: string
    business_overview?: string
    source?: string
  }
}

export function CompanyOverviewCard({ company, overview }: CompanyOverviewProps) {
  // Use overview data if available, otherwise fall back to company data
  const displayOverview = overview?.enhanced_overview || company.description
  const displayBusiness = overview?.business_overview || company.business_overview

  // If no overview data, don't render anything
  if (!displayOverview && !displayBusiness) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          Company Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
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

        {/* Data Source Attribution */}
        {overview?.source && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Source: {overview.source}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
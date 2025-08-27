'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft,
  Globe,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

interface Company {
  id: string;
  name: string;
  country: string;
  sector: string;
  industry: string;
  ticker: string;
  exchange: string;
}

interface CompanyHeroSectionProps {
  company: Company;
  websiteUrl?: string;
}

export function CompanyHeroSection({ company, websiteUrl }: CompanyHeroSectionProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
      <div className="p-6 space-y-4">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/companies">
            <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Companies
            </Button>
          </Link>
          
          {websiteUrl && (
            <a 
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm">
                <Globe className="h-4 w-4 mr-2" />
                Visit Website
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </a>
          )}
        </div>

        {/* Company Title */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {company.name}
              </h1>
              <p className="text-lg text-gray-700">
                {company.sector} • {company.industry}
              </p>
            </div>
            
            {/* Key Identifiers */}
            <div className="flex items-center space-x-2">
              <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                {company.ticker}
              </Badge>
              <Badge variant="secondary" className="bg-white/80">
                {company.exchange}
              </Badge>
              <Badge variant="outline" className="bg-white/80">
                {company.country}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
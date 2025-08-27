'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { formatNumber } from '@/lib/utils'
import { CompanyHeroSection } from '@/components/companies/CompanyHeroSection'
import { CompanyInfoPanel } from '@/components/companies/CompanyInfoPanel'
import { WasteMetricsDashboard } from '@/components/companies/WasteMetricsDashboard'
import { HistoricalTrendsChart } from '@/components/companies/HistoricalTrendsChart'

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
  total_waste_generated: number | null;
  total_waste_recovered: number | null;
  total_waste_disposed: number | null;
  recovery_rate: number | null;
  hazardous_waste: {
    generated: number | null;
    recovered: number | null;
    disposed: number | null;
    recovery_rate: number | null;
  };
  non_hazardous_waste: {
    generated: number | null;
    recovered: number | null;
    disposed: number | null;
    recovery_rate: number | null;
  };
  reporting_period: string;
}

interface WasteStream {
  id: string;
  waste_type: string;
  generated: number | null;
  recovered: number | null;
  disposed: number | null;
  hazardousness: 'Hazardous' | 'Non-Hazardous';
  treatment_method: string;
  unit: string;
  data_quality: 'Complete' | 'Partial' | 'Estimated';
  reporting_period: string;
}

export default function CompanyDetailPage() {
  const params = useParams()
  const companyId = params.id as string
  
  const [company, setCompany] = useState<Company | null>(null)
  const [wasteMetrics, setWasteMetrics] = useState<WasteMetrics[] | null>(null)
  const [wasteStreams, setWasteStreams] = useState<{
    groupedByYear: Record<string, WasteStream[]>;
    years: string[];
    latestYear: string;
  } | null>(null)
  const [companyOverview, setCompanyOverview] = useState<{
    enhanced_overview?: string, 
    business_overview?: string, 
    source?: string,
    founded_year?: number,
    headquarters?: string,
    revenue_usd?: number,
    market_cap_usd?: number,
    is_public?: boolean,
    stock_exchange?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCompanyData() {
      try {
        setLoading(true)
        
        // Fetch company data from real database API
        const response = await fetch(`/api/companies/${companyId}/profile`)
        if (!response.ok) {
          throw new Error('Failed to fetch company data')
        }
        
        const apiResponse = await response.json()
        if (!apiResponse.success || !apiResponse.data?.company) {
          throw new Error('Company not found')
        }
        
        const companyData = apiResponse.data.company
        const foundCompany: Company = {
          id: companyData.id,
          name: companyData.name,
          country: companyData.country,
          sector: companyData.sector,
          industry: companyData.industry,
          employees: companyData.employees,
          year_of_disclosure: companyData.year_of_disclosure,
          ticker: companyData.ticker,
          exchange: companyData.exchange,
          isin: companyData.isin,
          lei: companyData.lei,
          figi: companyData.figi,
          permid: companyData.perm_id,
          coordinates: {
            lat: 0,
            lng: 0,
            accuracy: 0,
            address: '',
            source: ''
          }
        }
        
        setCompany(foundCompany)
        
        // Set real company overview data from the database
        if (apiResponse.data.profile) {
          setCompanyOverview({
            enhanced_overview: apiResponse.data.profile.description,
            business_overview: apiResponse.data.profile.business_overview,
            source: apiResponse.data.profile.website_url,
            founded_year: apiResponse.data.profile.founded_year,
            headquarters: apiResponse.data.profile.headquarters,
            revenue_usd: apiResponse.data.profile.revenue_usd,
            market_cap_usd: apiResponse.data.profile.market_cap_usd,
            is_public: apiResponse.data.profile.is_public,
            stock_exchange: apiResponse.data.profile.stock_exchange
          })
        }
        
        // Fetch real waste metrics
        await fetchWasteMetrics(foundCompany.id)
        
        // Fetch real waste streams
        await fetchWasteStreams(foundCompany.id)
        
      } catch (err: any) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    async function fetchWasteMetrics(companyId: string) {
      try {
        // Try to fetch from waste metrics API first
        const metricsResponse = await fetch(`/api/companies/${companyId}/waste-metrics`)
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json()
          if (metricsData.success && metricsData.data) {
            setWasteMetrics(metricsData.data) // Now returns array of all periods
            return
          }
        }
        
        // If no real data available, set to null (will show as N/A)
        setWasteMetrics(null)
        
      } catch (error) {
        console.error('Error fetching waste metrics:', error)
        setWasteMetrics(null)
      }
    }

    async function fetchWasteStreams(companyId: string) {
      try {
        // Try to fetch waste streams from API
        const streamsResponse = await fetch(`/api/companies/${companyId}/waste-streams`)
        if (streamsResponse.ok) {
          const streamsData = await streamsResponse.json()
          if (streamsData.success && streamsData.groupedByYear) {
            setWasteStreams({
              groupedByYear: streamsData.groupedByYear,
              years: streamsData.years,
              latestYear: streamsData.latestYear
            })
            return
          }
        }
        
        // If no real waste streams data available, set null
        setWasteStreams(null)
        
      } catch (error) {
        console.error('Error fetching waste streams:', error)
        setWasteStreams(null)
      }
    }

    fetchCompanyData()
  }, [companyId])

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
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Company</h2>
              <p className="text-red-600">{error || 'Company not found'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <CompanyHeroSection 
        company={company} 
        websiteUrl={companyOverview?.source}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left Column - Company Information (2/5 width) */}
          <div className="lg:col-span-2 space-y-6">
            <CompanyInfoPanel 
              company={company}
              overview={companyOverview}
              companyDetails={{
                company_name: company.name,
                founded_year: companyOverview?.founded_year,
                headquarters: companyOverview?.headquarters,
                revenue_usd: companyOverview?.revenue_usd,
                market_cap_usd: companyOverview?.market_cap_usd,
                is_public: companyOverview?.is_public,
                stock_exchange: companyOverview?.stock_exchange
              }}
            />
          </div>

          {/* Right Column - Waste Management Metrics (3/5 width) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Historical Trends */}
            <HistoricalTrendsChart metricsData={wasteMetrics} />
            
            {/* Waste Management Metrics Only */}
            <WasteMetricsDashboard 
              metricsData={wasteMetrics}
              streamsData={null}
            />
          </div>
        </div>

        {/* Full Width Waste Streams Section */}
        {wasteStreams && (
          <div className="mt-8">
            <WasteMetricsDashboard 
              metricsData={null}
              streamsData={wasteStreams}
            />
          </div>
        )}
      </div>
    </div>
  )
}
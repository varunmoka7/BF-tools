'use client'

import { useEffect, useState, useCallback } from 'react'
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

interface CompanyClientPageProps {
  companyId: string;
  initialData: {
    company: any;
    profile?: any;
  };
}

export function CompanyClientPage({ companyId, initialData }: CompanyClientPageProps) {
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAdditionalData = useCallback(async (companyId: string) => {
    setLoading(true)
    try {
      // Fetch waste metrics and streams in parallel
      await Promise.all([
        fetchWasteMetrics(companyId),
        fetchWasteStreams(companyId)
      ])
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to load additional data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initialize with server-side data
    if (initialData?.company) {
      const companyData = initialData.company
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

      // Set company overview data from the server-side data
      if (initialData.profile) {
        setCompanyOverview({
          enhanced_overview: initialData.profile.description,
          business_overview: initialData.profile.business_overview,
          source: initialData.profile.website_url,
          founded_year: initialData.profile.founded_year,
          headquarters: initialData.profile.headquarters,
          revenue_usd: initialData.profile.revenue_usd,
          market_cap_usd: initialData.profile.market_cap_usd,
          is_public: initialData.profile.is_public,
          stock_exchange: initialData.profile.stock_exchange
        })
      }

      // Fetch additional data client-side
      fetchAdditionalData(foundCompany.id)
    }
  }, [initialData, companyId, fetchAdditionalData])

  const fetchWasteMetrics = async (companyId: string) => {
    try {
      const metricsResponse = await fetch(`/api/companies/${companyId}/waste-metrics`)
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        if (metricsData.success && metricsData.data) {
          setWasteMetrics(metricsData.data)
          return
        }
      }
      setWasteMetrics(null)
    } catch (error) {
      console.error('Error fetching waste metrics:', error)
      setWasteMetrics(null)
    }
  }

  const fetchWasteStreams = async (companyId: string) => {
    try {
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
      setWasteStreams(null)
    } catch (error) {
      console.error('Error fetching waste streams:', error)
      setWasteStreams(null)
    }
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Company</h2>
              <p className="text-red-600">Company data not available</p>
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

            {/* Loading indicator for additional data */}
            {loading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-blue-800">Loading waste management data...</span>
                </div>
              </div>
            )}

            {/* Error indicator */}
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">{error}</p>
              </div>
            )}

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
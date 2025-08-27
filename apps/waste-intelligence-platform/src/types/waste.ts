// Core Company interface based on companies table
export interface Company {
  company_id: number
  company_name: string
  country: string
  sector: string
  industry: string
  employees?: number
  latest_year?: number
  total_waste_latest?: number
  recovery_rate_latest?: number
  // New enhanced profile fields
  description?: string
  business_overview?: string
  website_url?: string
  founded_year?: number
  headquarters?: string
  revenue_usd?: number
  is_public?: boolean
  stock_exchange?: string
  market_cap_usd?: number
  primary_contact_email?: string
  primary_contact_phone?: string
  sustainability_contact_email?: string
  sustainability_contact_phone?: string
}

// Company metrics interface for aggregated data
export interface CompanyMetric {
  company_id: number
  company_name: string
  country: string
  sector: string
  industry: string
  total_waste_generated: number
  total_waste_recovered: number
  total_waste_disposed: number
  recovery_rate: number
  reporting_year: number
}

// Waste stream interface for raw data
export interface WasteStream {
  stream_id: number
  company_id: number
  company_name: string
  country: string
  sector: string
  industry: string
  waste_generated_tonnes: number
  waste_recovered_tonnes: number
  waste_disposed_tonnes: number
  recovery_rate: number
  reporting_year: number
  source_document_title?: string
  source_document_url?: string
}

// New interfaces for enhanced profiles
export interface CompanyWasteProfile {
  id: string
  company_id: string
  primary_waste_materials: string[]
  waste_management_strategy?: string
  recycling_facilities_count?: number
  waste_treatment_methods: string[]
  sustainability_goals?: string
  circular_economy_initiatives?: string
  waste_reduction_targets?: {
    [year: string]: {
      reduction_percentage?: number
      zero_landfill?: boolean
      carbon_neutral?: boolean
      circular_economy?: string
    }
  }
  zero_waste_commitment: boolean
  zero_waste_target_year?: number
  carbon_neutrality_commitment: boolean
  carbon_neutrality_target_year?: number
  created_at: string
  updated_at: string
}

export interface CompanyESGDocument {
  id: string
  company_id: string
  document_type: 'sustainability_report' | 'esg_report' | 'annual_report' | 'csr_report'
  document_title: string
  document_url: string
  publication_date: string
  reporting_year: number
  file_size_mb?: number
  language: string
  is_verified: boolean
  verification_date?: string
  verified_by?: string
  document_summary?: string
  key_highlights?: {
    waste_reduction?: string
    recycling_improvements?: string
    carbon_reduction?: string
    circular_economy?: string
  }
  created_at: string
}

export interface CompanySustainabilityMetrics {
  id: string
  company_id: string
  reporting_year: number
  carbon_footprint_tonnes?: number
  energy_consumption_gwh?: number
  water_consumption_m3?: number
  renewable_energy_percentage?: number
  waste_to_landfill_percentage?: number
  recycling_rate_percentage?: number
  esg_score?: number
  sustainability_rating?: string
  rating_agency?: string
  rating_date?: string
  carbon_intensity?: number
  water_intensity?: number
  waste_intensity?: number
  created_at: string
}

export interface CompanyCertification {
  id: string
  company_id: string
  certification_name: string
  certification_type: 'ISO' | 'Industry' | 'Government' | 'Third-party'
  issuing_organization: string
  certification_date: string
  expiry_date?: string
  status: 'active' | 'expired' | 'pending' | 'suspended'
  scope?: string
  certificate_url?: string
  created_at: string
}

export interface CompanyWasteFacility {
  id: string
  company_id: string
  facility_name: string
  facility_type: 'recycling_center' | 'waste_treatment' | 'landfill' | 'incineration'
  location: string
  latitude?: number
  longitude?: number
  capacity_tonnes_per_year?: number
  operational_status: 'operational' | 'planned' | 'decommissioned'
  waste_types_processed: string[]
  treatment_methods: string[]
  certifications: string[]
  created_at: string
}

// Comprehensive company profile interface
export interface ComprehensiveCompanyProfile extends Company {
  waste_profile?: CompanyWasteProfile
  sustainability_metrics?: CompanySustainabilityMetrics
  esg_documents: CompanyESGDocument[]
  certifications: CompanyCertification[]
  waste_facilities: CompanyWasteFacility[]
  esg_documents_count: number
  active_certifications_count: number
  operational_facilities_count: number
}

// Legacy interface for backward compatibility
export interface WasteCompany {
  id: string
  name: string
  country: string
  region: string
  wasteType: string
  annualVolume: number // in tons
  recyclingRate: number // percentage
  complianceScore: number // 0-100
  coordinates?: {
    lat: number
    lng: number
  }
  employees?: number
  revenue?: number
  certifications: string[]
  lastUpdated: Date
}

export interface WasteMetrics {
  totalVolume: number
  recyclingRate: number
  complianceScore: number
  activeCompanies: number
  totalRevenue: number
  carbonFootprint: number
}

export interface ChartData {
  name: string
  value: number
  percentage?: number
  trend?: 'up' | 'down' | 'stable'
}

export interface MapMarkerData {
  id: string
  position: [number, number]
  companyName: string
  wasteVolume: number
  wasteType: string
  popupContent?: string
}

export interface FilterOptions {
  country?: string[]
  wasteType?: string[]
  volumeRange?: [number, number]
  recyclingRateRange?: [number, number]
  complianceRange?: [number, number]
}

export interface DashboardStats {
  metrics: WasteMetrics
  chartData: {
    wasteByType: ChartData[]
    regionDistribution: ChartData[]
    complianceTrends: ChartData[]
    recyclingProgress: ChartData[]
  }
}
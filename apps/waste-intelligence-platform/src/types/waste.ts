// Core Company interface based on companies table
export interface Company {
  company_id: number
  company_name: string
  country: string
  sector: string
  industry: string
  latest_year?: number
  total_waste_latest?: number
  recovery_rate_latest?: number
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
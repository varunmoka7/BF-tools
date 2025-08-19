// Type definitions for waste management data

export type WasteType = 'total' | 'electronic' | 'industrial' | 'organic' | 'hazardous' | 'municipal' | 'construction' | 'medical'

export interface WasteData {
  id: string
  company?: string
  sector?: string
  wasteType?: string
  quantity?: number
  month?: string
  recyclingRate?: number
  carbonFootprint?: number
  // Country-level waste data fields
  country: string
  countryCode: string
  coordinates: [number, number]
  year: number
  totalWaste: number
  hazardousWaste: number
  recoveryRate: number
  disposalRate: number
  treatmentMethods: {
    recycling: number
    composting: number
    energyRecovery: number
    landfill: number
    incineration: number
  }
  wasteTypes: {
    municipal: number
    industrial: number
    construction: number
    electronic: number
    medical: number
  }
  marketOpportunity: number
}

export interface CompanyData {
  id: string
  name: string
  country: string
  sector: string
  industry: string
  employees?: number
  coordinates?: [number, number]
  wasteGenerated: number[]
  recoveryRates: number[]
  treatmentMethods?: {
    recycling: number
    composting: number
    energyRecovery: number
    landfill: number
    incineration: number
  }
  years?: number[]
  hazardousShare: number
  marketValue?: number
  ranking?: number
  performanceScore?: number
  benchmarkComparison?: {
    industry: number
    regional: number
    global: number
  }
  // Legacy fields for backward compatibility
  totalWaste?: number
  recyclingRate?: number
  carbonFootprint?: number
  complianceScore?: number
}

export interface KPIMetric {
  id: string
  title: string
  value: number
  unit: string
  target: number
  change: number
  changeType: 'increase' | 'decrease' | 'stable'
  trend: number[]
  benchmark?: number
  description?: string
}

export type PerformanceRating = 'excellent' | 'good' | 'average' | 'poor'

// Global statistics
export interface GlobalStats {
  totalCompanies: number
  totalCountries: number
  totalSectors: number
  averageRecoveryRate: number
  totalWasteManaged: number
  highPerformers: number
}

export interface SectorLeaderboard {
  sector: string
  companies: {
    id: string
    name: string
    country: string
    recoveryRate: number
    wasteVolume: number
    improvementTrend: number
    performanceRating: 'leader' | 'average' | 'hotspot'
    marketShare: number
    // Legacy fields for backward compatibility
    score?: number
    recyclingRate?: number
  }[]
}

// Database schema interface for companies table
export interface Company {
  id: string
  company_name: string
  country: string
  sector: string
  industry: string
  employees?: number
  ticker?: string
  exchange?: string
  year_of_disclosure: number
  document_urls?: Record<string, string>
  source_names?: Record<string, string>
  source_urls?: Record<string, string>
  coordinates?: [number, number]
  created_at?: string
  // Legacy fields for backward compatibility
  totalWaste?: number
  recyclingRate?: number
  carbonFootprint?: number
  complianceScore?: number
  recoveryRate?: number
  totalWasteGenerated?: number
  opportunityScore?: number
  complianceRisk?: string
  lastReportingPeriod?: number
}

export interface CompanySummary extends Company {
  totalWasteGenerated?: number
  recoveryRate?: number
  riskScore?: number
}

export interface CompanyProfile extends CompanySummary {
  wasteStreams?: WasteStream[]
  benchmarkData?: BenchmarkData
  riskAssessment?: RiskAssessment
  opportunities?: Opportunity[]
}

export interface WasteStream {
  id: string
  company_id: string
  reporting_period: number
  metric: string
  hazardousness: string
  treatment_method: string
  value: number
  unit: string
  created_at?: string
}

export interface CompanyMetric {
  id: string
  company_id: string
  reporting_period: number
  total_waste_generated?: number
  total_waste_recovered?: number
  total_waste_disposed?: number
  recovery_rate?: number
  created_at?: string
}

export interface BenchmarkData {
  sectorAverage: number
  countryAverage: number
  industryAverage: number
  percentile: number
}

export interface RiskAssessment {
  overallScore: number
  complianceRisk: string
  operationalRisk: string
  financialRisk: string
  reputationalRisk: string
  assessmentDate: string
}

export interface Opportunity {
  id: string
  companyId: string
  opportunityType: string
  title: string
  description?: string
  potentialValue: number
  priority: string
  status: string
}

export interface Sector {
  id: string
  name: string
  totalCompanies: number
  averageRecoveryRate: number
  totalWaste: number
}

// API Response types
export interface APIResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp: Date
}

export interface SearchResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CompanySearchParams {
  country?: string
  sector?: string
  industry?: string
  minWaste?: number
  maxWaste?: number
  minRecoveryRate?: number
  maxRecoveryRate?: number
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
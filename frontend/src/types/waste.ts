// Type definitions for waste management data

export interface WasteData {
  id: string
  company: string
  sector: string
  wasteType: string
  quantity: number
  month: string
  recyclingRate: number
  carbonFootprint: number
}

export interface CompanyData {
  id: string
  name: string
  country: string
  sector: string
  industry: string
  employees: number
  totalWaste: number
  recyclingRate: number
  carbonFootprint: number
  complianceScore: number
}

export interface SectorLeaderboard {
  sector: string
  companies: {
    name: string
    score: number
    recyclingRate: number
  }[]
}

export interface Company {
  id: string
  name: string
  country: string
  sector: string
  industry: string
  employees?: number
  ticker?: string
  exchange?: string
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
  companyId: string
  reportingPeriod: number
  metric: string
  hazardousness: string
  treatmentMethod: string
  value: number
  unit: string
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
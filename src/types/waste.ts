export interface WasteData {
  id: string
  country: string
  countryCode: string
  coordinates: [number, number]
  year: number
  totalWaste: number // in tons
  hazardousWaste: number // in tons
  recoveryRate: number // percentage
  disposalRate: number // percentage
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
  marketOpportunity: number // in USD millions
}

export interface CompanyData {
  id: string
  name: string
  sector: string
  country: string
  coordinates: [number, number]
  wasteGenerated: number[]
  recoveryRates: number[]
  treatmentMethods: {
    recycling: number
    composting: number
    energyRecovery: number
    landfill: number
    incineration: number
  }
  years: number[]
  hazardousShare: number
  marketValue: number
  ranking: number
  performanceScore: number
  benchmarkComparison: {
    industry: number
    regional: number
    global: number
  }
}

export interface KPIMetric {
  id: string
  title: string
  value: number
  unit: string
  change: number
  changeType: 'increase' | 'decrease'
  trend: number[]
  benchmark?: number
  target?: number
  description: string
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
  }[]
}

export type WasteType = 'total' | 'hazardous' | 'municipal' | 'industrial' | 'construction' | 'electronic' | 'medical'
export type PerformanceRating = 'leader' | 'average' | 'hotspot'
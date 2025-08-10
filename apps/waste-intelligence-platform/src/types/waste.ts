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
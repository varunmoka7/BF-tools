import { WasteCompany, WasteMetrics, ChartData, DashboardStats } from '@/types/waste'
import { generateMockCoordinates } from '@/lib/utils'

export const mockWasteCompanies: WasteCompany[] = [
  {
    id: '1',
    name: 'EcoWaste Solutions Inc.',
    country: 'USA',
    region: 'North America',
    wasteType: 'Mixed Municipal',
    annualVolume: 150000,
    recyclingRate: 65,
    complianceScore: 92,
    coordinates: { lat: 40.7128, lng: -74.0060 },
    employees: 450,
    revenue: 25000000,
    certifications: ['ISO 14001', 'OHSAS 18001'],
    lastUpdated: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'GreenCycle Europe',
    country: 'Germany',
    region: 'Europe',
    wasteType: 'Electronic Waste',
    annualVolume: 75000,
    recyclingRate: 78,
    complianceScore: 96,
    coordinates: { lat: 52.5200, lng: 13.4050 },
    employees: 280,
    revenue: 18500000,
    certifications: ['ISO 14001', 'WEEE Compliance'],
    lastUpdated: new Date('2024-01-10')
  },
  {
    id: '3',
    name: 'Pacific Waste Management',
    country: 'Japan',
    region: 'Asia Pacific',
    wasteType: 'Industrial',
    annualVolume: 200000,
    recyclingRate: 82,
    complianceScore: 88,
    coordinates: { lat: 35.6762, lng: 139.6503 },
    employees: 620,
    revenue: 42000000,
    certifications: ['ISO 14001', 'ISO 9001'],
    lastUpdated: new Date('2024-01-12')
  },
  {
    id: '4',
    name: 'CleanTech UK Ltd',
    country: 'UK',
    region: 'Europe',
    wasteType: 'Organic',
    annualVolume: 95000,
    recyclingRate: 71,
    complianceScore: 85,
    coordinates: { lat: 51.5074, lng: -0.1278 },
    employees: 340,
    revenue: 15800000,
    certifications: ['ISO 14001'],
    lastUpdated: new Date('2024-01-08')
  },
  {
    id: '5',
    name: 'Sustainable Systems France',
    country: 'France',
    region: 'Europe',
    wasteType: 'Construction',
    annualVolume: 180000,
    recyclingRate: 58,
    complianceScore: 79,
    coordinates: { lat: 48.8566, lng: 2.3522 },
    employees: 520,
    revenue: 31200000,
    certifications: ['ISO 14001', 'REACH Compliance'],
    lastUpdated: new Date('2024-01-14')
  }
]

export const mockMetrics: WasteMetrics = {
  totalVolume: 700000,
  recyclingRate: 70.8,
  complianceScore: 88,
  activeCompanies: 1247,
  totalRevenue: 132500000,
  carbonFootprint: 850000
}

export const mockChartData = {
  wasteByType: [
    { name: 'Municipal', value: 45, percentage: 45, trend: 'up' as const },
    { name: 'Industrial', value: 25, percentage: 25, trend: 'stable' as const },
    { name: 'Electronic', value: 15, percentage: 15, trend: 'up' as const },
    { name: 'Construction', value: 10, percentage: 10, trend: 'down' as const },
    { name: 'Organic', value: 5, percentage: 5, trend: 'up' as const }
  ] as ChartData[],
  
  regionDistribution: [
    { name: 'North America', value: 280000, percentage: 40, trend: 'stable' as const },
    { name: 'Europe', value: 245000, percentage: 35, trend: 'up' as const },
    { name: 'Asia Pacific', value: 140000, percentage: 20, trend: 'up' as const },
    { name: 'Other', value: 35000, percentage: 5, trend: 'stable' as const }
  ] as ChartData[],
  
  complianceTrends: [
    { name: 'Jan', value: 85 },
    { name: 'Feb', value: 87 },
    { name: 'Mar', value: 86 },
    { name: 'Apr', value: 88 },
    { name: 'May', value: 90 },
    { name: 'Jun', value: 89 },
    { name: 'Jul', value: 91 },
    { name: 'Aug', value: 88 },
    { name: 'Sep', value: 92 },
    { name: 'Oct', value: 90 },
    { name: 'Nov', value: 93 },
    { name: 'Dec', value: 88 }
  ] as ChartData[],
  
  recyclingProgress: [
    { name: 'Q1 2023', value: 65 },
    { name: 'Q2 2023', value: 68 },
    { name: 'Q3 2023', value: 70 },
    { name: 'Q4 2023', value: 72 },
    { name: 'Q1 2024', value: 71 }
  ] as ChartData[]
}

export const mockDashboardStats: DashboardStats = {
  metrics: mockMetrics,
  chartData: mockChartData
}

// CSV processing utilities
export function processCSVData(csvData: any[]): WasteCompany[] {
  return csvData.map((row, index) => ({
    id: String(index + 1),
    name: row.company_name || `Company ${index + 1}`,
    country: row.country || 'Unknown',
    region: row.region || 'Unknown',
    wasteType: row.waste_type || 'Mixed',
    annualVolume: Number(row.annual_volume) || 0,
    recyclingRate: Number(row.recycling_rate) || 0,
    complianceScore: Number(row.compliance_score) || 0,
    coordinates: {
      lat: Number(row.latitude) || generateMockCoordinates(row.country)[0],
      lng: Number(row.longitude) || generateMockCoordinates(row.country)[1]
    },
    employees: Number(row.employees) || undefined,
    revenue: Number(row.revenue) || undefined,
    certifications: row.certifications ? row.certifications.split(',') : [],
    lastUpdated: new Date()
  }))
}
import { WasteData, CompanyData, KPIMetric, SectorLeaderboard } from '@/types/waste'

export const mockWasteData: WasteData[] = [
  {
    id: 'usa-2024',
    country: 'United States',
    countryCode: 'US',
    coordinates: [39.8283, -98.5795],
    year: 2024,
    totalWaste: 292000000,
    hazardousWaste: 35000000,
    recoveryRate: 68.2,
    disposalRate: 31.8,
    treatmentMethods: {
      recycling: 45.2,
      composting: 12.8,
      energyRecovery: 10.2,
      landfill: 25.3,
      incineration: 6.5
    },
    wasteTypes: {
      municipal: 120000000,
      industrial: 95000000,
      construction: 45000000,
      electronic: 8500000,
      medical: 2500000
    },
    marketOpportunity: 85200
  },
  {
    id: 'germany-2024',
    country: 'Germany',
    countryCode: 'DE',
    coordinates: [51.1657, 10.4515],
    year: 2024,
    totalWaste: 68500000,
    hazardousWaste: 8200000,
    recoveryRate: 87.3,
    disposalRate: 12.7,
    treatmentMethods: {
      recycling: 52.1,
      composting: 18.2,
      energyRecovery: 17.0,
      landfill: 8.2,
      incineration: 4.5
    },
    wasteTypes: {
      municipal: 28000000,
      industrial: 22500000,
      construction: 12000000,
      electronic: 4200000,
      medical: 1800000
    },
    marketOpportunity: 34500
  },
  {
    id: 'japan-2024',
    country: 'Japan',
    countryCode: 'JP',
    coordinates: [36.2048, 138.2529],
    year: 2024,
    totalWaste: 42800000,
    hazardousWaste: 5100000,
    recoveryRate: 82.1,
    disposalRate: 17.9,
    treatmentMethods: {
      recycling: 48.3,
      composting: 15.8,
      energyRecovery: 18.0,
      landfill: 12.4,
      incineration: 5.5
    },
    wasteTypes: {
      municipal: 18500000,
      industrial: 15200000,
      construction: 6500000,
      electronic: 2100000,
      medical: 500000
    },
    marketOpportunity: 28900
  },
  {
    id: 'china-2024',
    country: 'China',
    countryCode: 'CN',
    coordinates: [35.8617, 104.1954],
    year: 2024,
    totalWaste: 520000000,
    hazardousWaste: 78000000,
    recoveryRate: 58.7,
    disposalRate: 41.3,
    treatmentMethods: {
      recycling: 35.2,
      composting: 8.5,
      energyRecovery: 15.0,
      landfill: 32.8,
      incineration: 8.5
    },
    wasteTypes: {
      municipal: 210000000,
      industrial: 180000000,
      construction: 85000000,
      electronic: 12000000,
      medical: 3000000
    },
    marketOpportunity: 156000
  },
  {
    id: 'brazil-2024',
    country: 'Brazil',
    countryCode: 'BR',
    coordinates: [-14.235, -51.9253],
    year: 2024,
    totalWaste: 89000000,
    hazardousWaste: 12000000,
    recoveryRate: 45.3,
    disposalRate: 54.7,
    treatmentMethods: {
      recycling: 28.1,
      composting: 7.2,
      energyRecovery: 10.0,
      landfill: 42.2,
      incineration: 12.5
    },
    wasteTypes: {
      municipal: 45000000,
      industrial: 25000000,
      construction: 12000000,
      electronic: 1800000,
      medical: 1200000
    },
    marketOpportunity: 48700
  }
]

export const mockCompanyData: CompanyData[] = [
  {
    id: 'waste-management-inc',
    name: 'Waste Management Inc.',
    sector: 'Waste Services',
    country: 'United States',
    coordinates: [32.7767, -96.7970],
    wasteGenerated: [2800000, 2950000, 3100000, 3250000, 3400000],
    recoveryRates: [72.3, 74.1, 75.8, 77.2, 78.5],
    treatmentMethods: {
      recycling: 48.2,
      composting: 15.3,
      energyRecovery: 15.0,
      landfill: 16.5,
      incineration: 5.0
    },
    years: [2020, 2021, 2022, 2023, 2024],
    hazardousShare: 8.5,
    marketValue: 18500,
    ranking: 1,
    performanceScore: 92.5,
    benchmarkComparison: {
      industry: 15.2,
      regional: 8.7,
      global: 22.1
    }
  },
  {
    id: 'veolia-environment',
    name: 'Veolia Environment',
    sector: 'Environmental Services',
    country: 'France',
    coordinates: [48.8566, 2.3522],
    wasteGenerated: [4200000, 4350000, 4500000, 4680000, 4850000],
    recoveryRates: [85.2, 86.1, 87.3, 88.1, 89.2],
    treatmentMethods: {
      recycling: 52.1,
      composting: 18.7,
      energyRecovery: 18.4,
      landfill: 7.8,
      incineration: 3.0
    },
    years: [2020, 2021, 2022, 2023, 2024],
    hazardousShare: 12.3,
    marketValue: 28900,
    ranking: 2,
    performanceScore: 95.8,
    benchmarkComparison: {
      industry: 12.5,
      regional: 5.2,
      global: 18.7
    }
  }
]

export const mockKPIMetrics: KPIMetric[] = [
  {
    id: 'total-waste',
    title: 'Total Waste Generated',
    value: 1012300000,
    unit: ' tons',
    change: 3.2,
    changeType: 'increase',
    trend: [980, 995, 1001, 1008, 1012],
    benchmark: 985000000,
    target: 950000000,
    description: 'Global waste generation across all tracked countries'
  },
  {
    id: 'recovery-rate',
    title: 'Average Recovery Rate',
    value: 68.3,
    unit: '%',
    change: 2.1,
    changeType: 'increase',
    trend: [64.2, 65.8, 66.9, 67.5, 68.3],
    benchmark: 65.0,
    target: 75.0,
    description: 'Average waste recovery rate across all regions'
  },
  {
    id: 'hazardous-share',
    title: 'Hazardous Waste Share',
    value: 13.8,
    unit: '%',
    change: -0.5,
    changeType: 'decrease',
    trend: [14.8, 14.5, 14.2, 14.0, 13.8],
    benchmark: 15.2,
    target: 12.0,
    description: 'Percentage of hazardous waste in total waste stream'
  },
  {
    id: 'market-opportunity',
    title: 'Market Opportunity',
    value: 353300,
    unit: 'M USD',
    change: 5.7,
    changeType: 'increase',
    trend: [298, 315, 328, 334, 353],
    benchmark: 320000,
    target: 400000,
    description: 'Total addressable market for waste management solutions'
  }
]

export const mockSectorLeaderboards: SectorLeaderboard[] = [
  {
    sector: 'Waste Services',
    companies: [
      {
        id: 'waste-management-inc',
        name: 'Waste Management Inc.',
        country: 'United States',
        recoveryRate: 78.5,
        wasteVolume: 3400000,
        improvementTrend: 6.2,
        performanceRating: 'leader',
        marketShare: 22.1
      },
      {
        id: 'republic-services',
        name: 'Republic Services',
        country: 'United States',
        recoveryRate: 76.2,
        wasteVolume: 2900000,
        improvementTrend: 4.8,
        performanceRating: 'leader',
        marketShare: 18.9
      },
      {
        id: 'clean-harbors',
        name: 'Clean Harbors',
        country: 'United States',
        recoveryRate: 71.3,
        wasteVolume: 1800000,
        improvementTrend: 2.1,
        performanceRating: 'average',
        marketShare: 11.7
      }
    ]
  },
  {
    sector: 'Environmental Services',
    companies: [
      {
        id: 'veolia-environment',
        name: 'Veolia Environment',
        country: 'France',
        recoveryRate: 89.2,
        wasteVolume: 4850000,
        improvementTrend: 4.0,
        performanceRating: 'leader',
        marketShare: 31.5
      },
      {
        id: 'suez-environment',
        name: 'Suez Environment',
        country: 'France',
        recoveryRate: 86.7,
        wasteVolume: 4200000,
        improvementTrend: 3.5,
        performanceRating: 'leader',
        marketShare: 27.3
      },
      {
        id: 'remondis',
        name: 'Remondis',
        country: 'Germany',
        recoveryRate: 84.1,
        wasteVolume: 3600000,
        improvementTrend: 2.8,
        performanceRating: 'leader',
        marketShare: 23.4
      }
    ]
  }
]
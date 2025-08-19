import { supabase, TABLES } from '../lib/supabase'
import { WasteData, SectorLeaderboard, Company, WasteStream, CompanyMetric } from '../types/waste'

export class SupabaseService {
  // Fetch all companies with pagination
  async getCompanies(filters?: {
    country?: string
    sector?: string
    industry?: string
    page?: number
    limit?: number
  }): Promise<{
    data: Company[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    try {
      let query = supabase
        .from(TABLES.COMPANIES)
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters?.country) {
        query = query.eq('country', filters.country)
      }
      if (filters?.sector) {
        query = query.eq('sector', filters.sector)
      }
      if (filters?.industry) {
        query = query.eq('industry', filters.industry)
      }

      // Apply pagination
      const page = filters?.page || 1
      const limit = filters?.limit || 50
      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        throw new Error(`Failed to fetch companies: ${error.message}`)
      }

      const total = count || 0
      const totalPages = Math.ceil(total / limit)

      return {
        data: data || [],
        total,
        page,
        limit,
        totalPages
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
      throw error
    }
  }

  // Fetch company by ID with all related data
  async getCompanyById(id: string): Promise<{
    company: Company
    metrics: CompanyMetric[]
    wasteStreams: WasteStream[]
  }> {
    try {
      // Fetch company data
      const { data: company, error: companyError } = await supabase
        .from(TABLES.COMPANIES)
        .select('*')
        .eq('id', id)
        .single()

      if (companyError) {
        throw new Error(`Failed to fetch company: ${companyError.message}`)
      }

      // Fetch company metrics
      const { data: metrics, error: metricsError } = await supabase
        .from(TABLES.COMPANY_METRICS)
        .select('*')
        .eq('company_id', id)
        .order('reporting_period', { ascending: false })

      if (metricsError) {
        console.warn('Failed to fetch company metrics:', metricsError.message)
      }

      // Fetch waste streams
      const { data: wasteStreams, error: streamsError } = await supabase
        .from(TABLES.WASTE_STREAMS)
        .select('*')
        .eq('company_id', id)
        .order('reporting_period', { ascending: false })

      if (streamsError) {
        console.warn('Failed to fetch waste streams:', streamsError.message)
      }

      return {
        company: company || {} as Company,
        metrics: metrics || [],
        wasteStreams: wasteStreams || []
      }
    } catch (error) {
      console.error('Error fetching company details:', error)
      throw error
    }
  }

  // Fetch waste data by country
  async getWasteData(): Promise<WasteData[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.COMPANIES)
        .select(`
          id,
          company_name,
          country,
          sector,
          coordinates,
          year_of_disclosure
        `)

      if (error) {
        throw new Error(`Failed to fetch waste data: ${error.message}`)
      }

      // Group by country and calculate metrics
      const countryData = new Map<string, any>()
      
      data?.forEach(company => {
        if (!countryData.has(company.country)) {
          countryData.set(company.country, {
            id: company.country,
            country: company.country,
            countryCode: company.country.substring(0, 2).toUpperCase(),
            coordinates: company.coordinates || [0, 0],
            year: company.year_of_disclosure || 2024,
            totalWaste: 0,
            hazardousWaste: 0,
            recoveryRate: 0,
            disposalRate: 0,
            treatmentMethods: {
              recycling: 0,
              composting: 0,
              energyRecovery: 0,
              landfill: 0,
              incineration: 0
            },
            wasteTypes: {
              municipal: 0,
              industrial: 0,
              construction: 0,
              electronic: 0,
              medical: 0
            },
            marketOpportunity: 0,
            companyCount: 0
          })
        }
        
        const country = countryData.get(company.country)
        country.companyCount++
        // Add more aggregation logic here as needed
      })

      return Array.from(countryData.values())
    } catch (error) {
      console.error('Error fetching waste data:', error)
      throw error
    }
  }

  // Fetch sector leaderboards
  async getSectorLeaderboards(): Promise<SectorLeaderboard[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.COMPANIES)
        .select(`
          id,
          company_name,
          country,
          sector,
          industry
        `)

      if (error) {
        throw new Error(`Failed to fetch sector data: ${error.message}`)
      }

      // Group by sector
      const sectorData = new Map<string, any>()
      
      data?.forEach(company => {
        if (!sectorData.has(company.sector)) {
          sectorData.set(company.sector, {
            sector: company.sector,
            companies: []
          })
        }
        
        sectorData.get(company.sector).companies.push({
          id: company.id,
          name: company.company_name,
          country: company.country,
          recoveryRate: Math.random() * 40 + 30, // Mock for now, replace with real data
          wasteVolume: Math.random() * 10000 + 5000,
          improvementTrend: Math.random() * 10 - 5,
          performanceRating: 'average' as const,
          marketShare: Math.random() * 15 + 5
        })
      })

      return Array.from(sectorData.values())
    } catch (error) {
      console.error('Error fetching sector leaderboards:', error)
      throw error
    }
  }

  // Search companies
  async searchCompanies(query: string): Promise<Company[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.COMPANIES)
        .select('*')
        .or(`company_name.ilike.%${query}%,country.ilike.%${query}%,sector.ilike.%${query}%`)
        .limit(20)

      if (error) {
        throw new Error(`Failed to search companies: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error searching companies:', error)
      throw error
    }
  }

  // Get global statistics
  async getGlobalStats(): Promise<{
    totalCompanies: number
    totalCountries: number
    totalSectors: number
    averageRecoveryRate: number
    totalWasteManaged: number
    highPerformers: number
  }> {
    try {
      const { count: totalCompanies, error: companiesError } = await supabase
        .from(TABLES.COMPANIES)
        .select('*', { count: 'exact', head: true })

      if (companiesError) {
        throw new Error(`Failed to fetch company count: ${companiesError.message}`)
      }

      // Get unique countries and sectors
      const { data: companies, error: dataError } = await supabase
        .from(TABLES.COMPANIES)
        .select('country, sector')

      if (dataError) {
        throw new Error(`Failed to fetch company data: ${dataError.message}`)
      }

      const uniqueCountries = new Set(companies?.map(c => c.country) || [])
      const uniqueSectors = new Set(companies?.map(c => c.sector) || [])

      return {
        totalCompanies: totalCompanies || 0,
        totalCountries: uniqueCountries.size,
        totalSectors: uniqueSectors.size,
        averageRecoveryRate: 65, // Mock for now
        totalWasteManaged: 1500000, // Mock for now
        highPerformers: Math.floor((totalCompanies || 0) * 0.2) // Top 20%
      }
    } catch (error) {
      console.error('Error fetching global stats:', error)
      throw error
    }
  }
}

export const supabaseService = new SupabaseService()

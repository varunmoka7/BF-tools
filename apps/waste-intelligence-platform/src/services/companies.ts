import { supabase } from '@/lib/supabase'
import { Company, CompanyMetric, WasteStream } from '@/types/waste'

/**
 * Get all companies with basic information and latest metrics
 */
export async function getAllCompanies(): Promise<Company[]> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('company_name', { ascending: true })

    if (error) {
      console.error('Error fetching companies:', error)
      throw new Error(`Failed to fetch companies: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllCompanies:', error)
    throw error
  }
}

/**
 * Get company by ID with fallback to waste_streams if company_metrics unavailable
 */
export async function getCompanyById(companyId: number): Promise<Company | null> {
  try {
    // First try to get from companies table
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('company_id', companyId)
      .single()

    if (companyError) {
      console.error('Error fetching company:', companyError)
      throw new Error(`Failed to fetch company: ${companyError.message}`)
    }

    return company
  } catch (error) {
    console.error('Error in getCompanyById:', error)
    throw error
  }
}

/**
 * Get company metrics with fallback to waste_streams aggregation
 */
export async function getCompanyMetrics(companyId: number): Promise<CompanyMetric | null> {
  try {
    // Try company_metrics table first
    const { data: metrics, error: metricsError } = await supabase
      .from('company_metrics')
      .select('*')
      .eq('company_id', companyId)
      .order('reporting_year', { ascending: false })
      .limit(1)
      .single()

    if (!metricsError && metrics) {
      return metrics
    }

    // Fallback to waste_streams aggregation
    console.log('Falling back to waste_streams for company:', companyId)
    
    const { data: streams, error: streamsError } = await supabase
      .from('waste_streams')
      .select('*')
      .eq('company_id', companyId)
      .order('reporting_year', { ascending: false })

    if (streamsError) {
      console.error('Error fetching waste streams:', streamsError)
      throw new Error(`Failed to fetch waste streams: ${streamsError.message}`)
    }

    if (!streams || streams.length === 0) {
      return null
    }

    // Aggregate metrics from latest year
    const latestYear = streams[0].reporting_year
    const latestStreams = streams.filter(s => s.reporting_year === latestYear)

    const totalGenerated = latestStreams.reduce((sum, s) => sum + (s.waste_generated_tonnes || 0), 0)
    const totalRecovered = latestStreams.reduce((sum, s) => sum + (s.waste_recovered_tonnes || 0), 0)
    const totalDisposed = latestStreams.reduce((sum, s) => sum + (s.waste_disposed_tonnes || 0), 0)

    // Calculate recovery rate using standardized formula
    const recoveryRate = totalGenerated > 0 ? (totalRecovered / totalGenerated) * 100 : 0

    const aggregatedMetric: CompanyMetric = {
      company_id: companyId,
      company_name: streams[0].company_name,
      country: streams[0].country,
      sector: streams[0].sector,
      industry: streams[0].industry,
      total_waste_generated: totalGenerated,
      total_waste_recovered: totalRecovered,
      total_waste_disposed: totalDisposed,
      recovery_rate: Math.round(recoveryRate * 100) / 100, // Round to 2 decimal places
      reporting_year: latestYear
    }

    return aggregatedMetric
  } catch (error) {
    console.error('Error in getCompanyMetrics:', error)
    throw error
  }
}

/**
 * Test Supabase connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('count')
      .limit(1)

    if (error) {
      console.error('Connection test failed:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Connection test error:', error)
    return false
  }
}
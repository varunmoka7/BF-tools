import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { loadAggregatedCompanyMetrics } from '@/lib/local-data'

const CACHE_KEY = '__waste_recovery_distribution_cache__'
const CACHE_TTL = 1000 * 60 * 5 // 5 minutes

type RecoveryCompany = {
  company_id: string
  company_name: string
  sector: string
  country: string
  recovery_rate: number
  total_waste_generated: number
  total_waste_recovered: number
  reporting_period: number
}

type CacheEntry = {
  timestamp: number
  payload: {
    success: true
    data: {
      chartData: Array<{
        range: string
        count: number
        percentage: number
        companies: Array<{
          name: string
          sector: string
          country: string
          recovery_rate: number
          waste_generated: number
        }>
      }>
      statistics: {
        total_companies: number
        average_recovery_rate: number
        median_recovery_rate: number
        min_recovery_rate: number
        max_recovery_rate: number
        standard_deviation: number
      }
      sectorBreakdown: Array<{
        sector: string
        company_count: number
        average_recovery_rate: number
        companies: RecoveryCompany[]
      }>
      rawData: RecoveryCompany[]
    }
  }
}

function getCache(): CacheEntry | undefined {
  return (globalThis as any)[CACHE_KEY]
}

function setCache(entry: CacheEntry) {
  ;(globalThis as any)[CACHE_KEY] = entry
}

async function buildResponseFromLocalData() {
  const aggregatedMetrics = await loadAggregatedCompanyMetrics()

  const metricsWithDetails: RecoveryCompany[] = aggregatedMetrics
    .map((company) => {
      const latestMetric = [...company.metrics]
        .sort((a, b) => b.reporting_period - a.reporting_period)
        .find((metric) => metric.totalGenerated > 0 || metric.totalRecovered > 0)

      if (!latestMetric) {
        return null
      }

      const recoveryRate = latestMetric.totalGenerated > 0
        ? (latestMetric.totalRecovered / latestMetric.totalGenerated) * 100
        : 0

      return {
        company_id: company.company_id,
        company_name: company.company_name,
        sector: company.sector,
        country: company.country,
        recovery_rate: Math.round(recoveryRate * 100) / 100,
        total_waste_generated: Math.round(latestMetric.totalGenerated),
        total_waste_recovered: Math.round(latestMetric.totalRecovered),
        reporting_period: latestMetric.reporting_period
      }
    })
    .filter((company): company is RecoveryCompany => company !== null)

  if (metricsWithDetails.length === 0) {
    return {
      success: true as const,
      data: {
        chartData: [],
        statistics: {
          total_companies: 0,
          average_recovery_rate: 0,
          median_recovery_rate: 0,
          min_recovery_rate: 0,
          max_recovery_rate: 0,
          standard_deviation: 0
        },
        sectorBreakdown: [],
        rawData: []
      }
    }
  }

  const bins = [
    { range: '0-20%', min: 0, max: 20, count: 0, companies: [] as RecoveryCompany[] },
    { range: '20-40%', min: 20, max: 40, count: 0, companies: [] as RecoveryCompany[] },
    { range: '40-60%', min: 40, max: 60, count: 0, companies: [] as RecoveryCompany[] },
    { range: '60-80%', min: 60, max: 80, count: 0, companies: [] as RecoveryCompany[] },
    { range: '80-100%', min: 80, max: 100, count: 0, companies: [] as RecoveryCompany[] }
  ]

  metricsWithDetails.forEach((company) => {
    for (const bin of bins) {
      if (company.recovery_rate >= bin.min && company.recovery_rate < bin.max) {
        bin.count++
        bin.companies.push(company)
        break
      }
    }
  })

  const recoveryRates = metricsWithDetails.map((company) => company.recovery_rate)
  const averageRecoveryRate = recoveryRates.reduce((sum, rate) => sum + rate, 0) / recoveryRates.length
  const sortedRates = [...recoveryRates].sort((a, b) => a - b)
  const medianRecoveryRate = sortedRates[Math.floor(sortedRates.length / 2)]
  const minRecoveryRate = Math.min(...recoveryRates)
  const maxRecoveryRate = Math.max(...recoveryRates)
  const standardDeviation = Math.sqrt(
    recoveryRates.reduce((sum, rate) => sum + Math.pow(rate - averageRecoveryRate, 2), 0) / recoveryRates.length
  )

  const chartData = bins.map((bin) => ({
    range: bin.range,
    count: bin.count,
    percentage: metricsWithDetails.length > 0 ? (bin.count / metricsWithDetails.length) * 100 : 0,
    companies: bin.companies.map((company) => ({
      name: company.company_name,
      sector: company.sector,
      country: company.country,
      recovery_rate: company.recovery_rate,
      waste_generated: company.total_waste_generated
    }))
  }))

  const sectorGroups = metricsWithDetails.reduce((acc, company) => {
    const sectorKey = company.sector || 'Unknown Sector'
    const group = acc.get(sectorKey) ?? { companies: [] as RecoveryCompany[] }
    group.companies.push(company)
    acc.set(sectorKey, group)
    return acc
  }, new Map<string, { companies: RecoveryCompany[] }>())

  const sectorBreakdown = Array.from(sectorGroups.entries()).map(([sector, group]) => ({
    sector,
    company_count: group.companies.length,
    average_recovery_rate:
      group.companies.reduce((sum, company) => sum + company.recovery_rate, 0) / group.companies.length,
    companies: group.companies
  }))

  return {
    success: true as const,
    data: {
      chartData,
      statistics: {
        total_companies: metricsWithDetails.length,
        average_recovery_rate: averageRecoveryRate,
        median_recovery_rate: medianRecoveryRate,
        min_recovery_rate: minRecoveryRate,
        max_recovery_rate: maxRecoveryRate,
        standard_deviation: standardDeviation
      },
      sectorBreakdown,
      rawData: metricsWithDetails
    }
  }
}

export async function GET() {
  const cached = getCache()
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.payload)
  }

  try {
    const supabase = getSupabaseClient()

    if (!supabase) {
      const payload = await buildResponseFromLocalData()
      setCache({ timestamp: Date.now(), payload })
      return NextResponse.json(payload)
    }

    // Fetch company metrics with recovery rates from Supabase
    const { data: companyMetrics, error } = await supabase
      .from('company_metrics')
      .select(`
        company_id,
        recovery_rate,
        total_waste_generated,
        total_waste_recovered,
        reporting_period
      `)
      .not('recovery_rate', 'is', null)
      .gt('recovery_rate', 0)
      .order('recovery_rate', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch company metrics from database'
      }, { status: 500 })
    }

    if (!companyMetrics || companyMetrics.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No company metrics data found'
      }, { status: 404 })
    }

    // Get company details for additional context
    const companyIds = companyMetrics.map(cm => cm.company_id)
    const { data: companies, error: companiesError } = await supabase!
      .from('companies')
      .select('id, company_name, sector, country')
      .in('id', companyIds)

    if (companiesError) {
      console.warn('Companies fetch error:', companiesError)
    }

    // Create company lookup map
    const companyMap = new Map()
    companies?.forEach(company => {
      companyMap.set(company.id, company)
    })

    // Get latest metrics for each company (most recent reporting period)
    const latestMetrics = new Map()
    companyMetrics.forEach(metric => {
      const existing = latestMetrics.get(metric.company_id)
      if (!existing || metric.reporting_period > existing.reporting_period) {
        latestMetrics.set(metric.company_id, metric)
      }
    })

    // Convert to array and add company details
    const metricsWithDetails: RecoveryCompany[] = Array.from(latestMetrics.values()).map(metric => {
      const company = companyMap.get(metric.company_id)
      return {
        company_id: metric.company_id,
        company_name: company?.company_name || 'Unknown Company',
        sector: company?.sector || 'Unknown Sector',
        country: company?.country || 'Unknown Country',
        recovery_rate: metric.recovery_rate,
        total_waste_generated: metric.total_waste_generated,
        total_waste_recovered: metric.total_waste_recovered,
        reporting_period: metric.reporting_period
      }
    })

    // Create histogram bins for recovery rate distribution
    const bins: Array<{
      range: string
      min: number
      max: number
      count: number
      companies: Array<{
        name: string
        sector: string
        country: string
        recovery_rate: number
        waste_generated: number
      }>
    }> = [
      { range: '0-20%', min: 0, max: 20, count: 0, companies: [] },
      { range: '20-40%', min: 20, max: 40, count: 0, companies: [] },
      { range: '40-60%', min: 40, max: 60, count: 0, companies: [] },
      { range: '60-80%', min: 60, max: 80, count: 0, companies: [] },
      { range: '80-100%', min: 80, max: 100, count: 0, companies: [] }
    ]

    // Distribute companies into bins
    metricsWithDetails.forEach(company => {
      const rate = company.recovery_rate
      for (const bin of bins) {
        if (rate >= bin.min && rate < bin.max) {
          bin.count++
          bin.companies.push({
            name: company.company_name,
            sector: company.sector,
            country: company.country,
            recovery_rate: rate,
            waste_generated: company.total_waste_generated
          })
        }
      }
    })

    // Calculate statistics
    const recoveryRates = metricsWithDetails.map(c => c.recovery_rate)
    const averageRecoveryRate = recoveryRates.reduce((sum, rate) => sum + rate, 0) / recoveryRates.length
    const sortedRates = [...recoveryRates].sort((a, b) => a - b)
    const medianRecoveryRate = sortedRates[Math.floor(sortedRates.length / 2)]
    const minRecoveryRate = Math.min(...recoveryRates)
    const maxRecoveryRate = Math.max(...recoveryRates)
    const standardDeviation = Math.sqrt(
      recoveryRates.reduce((sum, rate) => sum + Math.pow(rate - averageRecoveryRate, 2), 0) / recoveryRates.length
    )

    const stats = {
      total_companies: metricsWithDetails.length,
      average_recovery_rate: averageRecoveryRate,
      median_recovery_rate: medianRecoveryRate,
      min_recovery_rate: minRecoveryRate,
      max_recovery_rate: maxRecoveryRate,
      standard_deviation: standardDeviation
    }

    // Prepare chart data
    const chartData = bins.map(bin => ({
      range: bin.range,
      count: bin.count,
      percentage: (bin.count / stats.total_companies) * 100,
      companies: bin.companies
    }))

    // Sector breakdown
    const sectorBreakdown = metricsWithDetails.reduce((acc, company) => {
      if (!acc[company.sector]) {
        acc[company.sector] = {
          count: 0,
          total_recovery_rate: 0,
          companies: []
        }
      }
      acc[company.sector].count++
      acc[company.sector].total_recovery_rate += company.recovery_rate
      acc[company.sector].companies.push(company)
      return acc
    }, {} as Record<string, any>)

    // Calculate average recovery rate by sector
    Object.keys(sectorBreakdown).forEach(sector => {
      sectorBreakdown[sector].average_recovery_rate = 
        sectorBreakdown[sector].total_recovery_rate / sectorBreakdown[sector].count
    })

    const payload = {
      success: true as const,
      data: {
        chartData,
        statistics: stats,
        sectorBreakdown: Object.entries(sectorBreakdown).map(([sector, data]) => ({
          sector,
          company_count: data.count,
          average_recovery_rate: Math.round(data.average_recovery_rate * 100) / 100,
          companies: data.companies
        })).sort((a, b) => b.average_recovery_rate - a.average_recovery_rate),
        rawData: metricsWithDetails
      }
    }

    setCache({
      timestamp: Date.now(),
      payload
    })

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Waste recovery distribution API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to calculate waste recovery distribution'
    }, { status: 500 })
  }
}

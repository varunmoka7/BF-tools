import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Get all companies data for sector mapping
    const companiesPath = path.join(process.cwd(), 'public/companies-with-coordinates.json')
    const companiesContent = await fs.readFile(companiesPath, 'utf8')
    const companies = JSON.parse(companiesContent)
    
    // Create company ID to sector mapping
    const companyToSector = new Map()
    companies.forEach((company: any) => {
      if (company.id && company.sector) {
        companyToSector.set(company.id, company.sector)
      }
    })

    // Fetch waste metrics from Supabase database
    const { data: wasteMetrics, error } = await supabase
      .from('waste_streams')
      .select(`
        company_id,
        reporting_period,
        metric,
        value,
        treatment_method,
        hazardousness
      `)
      .not('value', 'is', null)
      .gte('reporting_period', '2020')
      .order('reporting_period', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch waste data from database'
      }, { status: 500 })
    }

    // Also get company metrics data
    const { data: companyMetrics, error: metricsError } = await supabase
      .from('company_metrics')
      .select(`
        company_id,
        reporting_period,
        total_waste_generated,
        total_waste_recovered,
        total_waste_disposed
      `)
      .not('total_waste_generated', 'is', null)
      .gte('reporting_period', '2020')
      .order('reporting_period', { ascending: true })

    if (metricsError) {
      console.warn('Company metrics error:', metricsError)
    }

    // Group data by reporting period and calculate insights
    const periodData = new Map()
    
    // Process waste streams data
    wasteMetrics?.forEach((record: any) => {
      const period = record.reporting_period
      if (!period) return

      if (!periodData.has(period)) {
        periodData.set(period, {
          period,
          totalGenerated: 0,
          totalRecovered: 0,
          totalDisposed: 0,
          totalRecycled: 0,
          hazardousWaste: 0,
          companiesReporting: new Set(),
          sectorBreakdown: new Map()
        })
      }

      const data = periodData.get(period)
      data.companiesReporting.add(record.company_id)

      // Add sector information
      const sector = companyToSector.get(record.company_id) || 'Unknown'
      if (!data.sectorBreakdown.has(sector)) {
        data.sectorBreakdown.set(sector, {
          generated: 0,
          recovered: 0,
          disposed: 0,
          companiesCount: new Set()
        })
      }
      const sectorData = data.sectorBreakdown.get(sector)
      sectorData.companiesCount.add(record.company_id)

      // Categorize based on metric and treatment method
      const value = record.value || 0
      
      if (record.metric?.toLowerCase().includes('generated') || 
          record.metric?.toLowerCase().includes('total waste')) {
        data.totalGenerated += value
        sectorData.generated += value
      }

      // Categorize recovery based on treatment method
      if (record.treatment_method) {
        const treatment = record.treatment_method.toLowerCase()
        if (treatment.includes('recycl') || 
            treatment.includes('recover') || 
            treatment.includes('reuse') ||
            treatment.includes('composting') ||
            treatment.includes('energy recovery')) {
          data.totalRecovered += value
          sectorData.recovered += value
          
          if (treatment.includes('recycl')) {
            data.totalRecycled += value
          }
        } else if (treatment.includes('disposal') || 
                   treatment.includes('landfill') ||
                   treatment.includes('incineration without energy recovery')) {
          data.totalDisposed += value
          sectorData.disposed += value
        }
      }

      // Track hazardous waste
      if (record.hazardousness?.toLowerCase().includes('hazardous')) {
        data.hazardousWaste += value
      }
    })

    // Supplement with company metrics data where available
    companyMetrics?.forEach((record: any) => {
      const period = record.reporting_period
      if (!period || !periodData.has(period)) return

      const data = periodData.get(period)
      
      // Use company metrics if they provide more comprehensive data
      if (record.total_waste_generated) {
        data.totalGenerated = Math.max(data.totalGenerated, record.total_waste_generated)
      }
      if (record.total_waste_recovered) {
        data.totalRecovered = Math.max(data.totalRecovered, record.total_waste_recovered)
      }
      if (record.total_waste_disposed) {
        data.totalDisposed = Math.max(data.totalDisposed, record.total_waste_disposed)
      }
    })

    // Convert to array and calculate rates
    const trendsData = Array.from(periodData.values())
      .map(data => {
        const totalGenerated = data.totalGenerated || 0
        const totalRecovered = data.totalRecovered || 0
        const totalDisposed = data.totalDisposed || 0
        const totalRecycled = data.totalRecycled || 0

        // Calculate rates as percentages
        const recoveryRate = totalGenerated > 0 ? (totalRecovered / totalGenerated) * 100 : 0
        const recyclingRate = totalGenerated > 0 ? (totalRecycled / totalGenerated) * 100 : 0
        const disposalRate = totalGenerated > 0 ? (totalDisposed / totalGenerated) * 100 : 0

        // Calculate top performing sector for this period
        let topSector = 'N/A'
        let topSectorRate = 0
        
        for (const [sector, sectorData] of data.sectorBreakdown.entries()) {
          if (sectorData.generated > 0) {
            const sectorRecoveryRate = (sectorData.recovered / sectorData.generated) * 100
            if (sectorRecoveryRate > topSectorRate) {
              topSectorRate = sectorRecoveryRate
              topSector = sector
            }
          }
        }

        return {
          period: data.period,
          month: String(data.period), // Use year as display since we have yearly data
          totalGenerated: Math.round(totalGenerated),
          totalRecovered: Math.round(totalRecovered),
          totalDisposed: Math.round(totalDisposed),
          totalRecycled: Math.round(totalRecycled),
          hazardousWaste: Math.round(data.hazardousWaste),
          companiesReporting: data.companiesReporting.size,
          recoveryRate: Math.round(recoveryRate * 100) / 100,
          recyclingRate: Math.round(recyclingRate * 100) / 100,
          disposalRate: Math.round(disposalRate * 100) / 100,
          topSector,
          topSectorRate: Math.round(topSectorRate * 100) / 100,
          dataQuality: data.companiesReporting.size > 10 ? 'High' : 
                      data.companiesReporting.size > 5 ? 'Medium' : 'Low'
        }
      })
      .filter(data => data.totalGenerated > 0) // Only include periods with actual data
      .sort((a, b) => String(a.period).localeCompare(String(b.period)))

    // Calculate overall statistics
    const totalPeriods = trendsData.length
    const latestPeriod = trendsData[trendsData.length - 1]
    const avgRecoveryRate = trendsData.length > 0 
      ? trendsData.reduce((sum, data) => sum + data.recoveryRate, 0) / trendsData.length 
      : 0

    // Calculate trend direction
    const trendDirection = trendsData.length >= 2 
      ? trendsData[trendsData.length - 1].recoveryRate - trendsData[trendsData.length - 2].recoveryRate
      : 0

    return NextResponse.json({
      success: true,
      data: trendsData,
      summary: {
        totalPeriods,
        avgRecoveryRate: Math.round(avgRecoveryRate * 100) / 100,
        trendDirection: Math.round(trendDirection * 100) / 100,
        latestPeriod: latestPeriod?.period || 'N/A',
        latestRecoveryRate: latestPeriod?.recoveryRate || 0,
        dataSource: 'Supabase Database + Company Registry'
      }
    })
  } catch (error) {
    console.error('Waste recovery trends API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to calculate waste recovery trends'
    }, { status: 500 })
  }
}
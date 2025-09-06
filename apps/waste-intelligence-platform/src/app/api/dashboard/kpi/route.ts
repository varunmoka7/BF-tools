import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Read the companies data
    const companiesPath = path.join(process.cwd(), 'public/companies-with-coordinates.json')
    const companiesContent = await fs.readFile(companiesPath, 'utf8')
    const companies = JSON.parse(companiesContent)

    // Read the waste metrics data
    const wasteMetricsPath = path.join(process.cwd(), '../../data/structured/waste-metrics.json')
    const wasteMetricsContent = await fs.readFile(wasteMetricsPath, 'utf8')
    const wasteMetrics = JSON.parse(wasteMetricsContent)

    const totalCompanies = companies.length || 0
    const countriesCovered = new Set()
    const sectorMetrics = new Map()
    
    // Process companies for basic info
    companies.forEach((company: any) => {
      if (company.country) {
        countriesCovered.add(company.country)
      }
    })

    // Process waste metrics data for real calculations
    let totalWasteGenerated = 0
    let totalHazardousWaste = 0
    let totalNonHazardousWaste = 0
    let companiesWithRecentData = new Set()
    const currentYear = new Date().getFullYear()
    
    wasteMetrics.forEach((metric: any) => {
      const year = parseInt(metric.reporting_period)
      
      // Track companies with recent data (2022-2024)
      if (year >= 2022) {
        companiesWithRecentData.add(metric.company_id)
      }
      
      // Use most recent data (2023-2024) for calculations
      if (year >= 2023) {
        if (metric.metric === "Total Waste Generated") {
          totalWasteGenerated += metric.value || 0
        } else if (metric.metric === "Total Hazardous Waste Generated") {
          totalHazardousWaste += metric.value || 0
        } else if (metric.metric === "Total Non-Hazardous Waste Generated") {
          totalNonHazardousWaste += metric.value || 0
        }
      }
    })

    // Calculate sector performance for top performing sector
    const sectorRecoveryRates = new Map()
    const sectorWasteData = new Map()
    
    companies.forEach((company: any) => {
      if (!company.sector) return
      
      const companyWasteData = wasteMetrics.filter((metric: any) => 
        metric.company_id === company.id && 
        parseInt(metric.reporting_period) >= 2023
      )
      
      let generated = 0
      let recovered = 0
      
      companyWasteData.forEach((metric: any) => {
        if (metric.metric === "Total Waste Generated") {
          generated += metric.value || 0
        } else if (metric.metric === "Total Waste Recovered") {
          recovered += metric.value || 0
        }
      })
      
      if (generated > 0) {
        const recoveryRate = (recovered / generated) * 100
        
        if (!sectorWasteData.has(company.sector)) {
          sectorWasteData.set(company.sector, { totalGenerated: 0, totalRecovered: 0, count: 0 })
        }
        
        const sectorData = sectorWasteData.get(company.sector)
        sectorData.totalGenerated += generated
        sectorData.totalRecovered += recovered
        sectorData.count += 1
      }
    })
    
    // Find top performing sector
    let topSector = null
    let topSectorRate = 0
    
    for (const [sector, data] of sectorWasteData.entries()) {
      if (data.totalGenerated > 0) {
        const sectorRecoveryRate = (data.totalRecovered / data.totalGenerated) * 100
        if (sectorRecoveryRate > topSectorRate) {
          topSectorRate = sectorRecoveryRate
          topSector = sector
        }
      }
    }
    
    // Calculate hazardous vs non-hazardous percentage
    const totalClassifiedWaste = totalHazardousWaste + totalNonHazardousWaste
    const hazardousPercentage = totalClassifiedWaste > 0 
      ? (totalHazardousWaste / totalClassifiedWaste) * 100 
      : 0
    
    // Calculate data coverage
    const dataCoveragePercentage = totalCompanies > 0 
      ? (companiesWithRecentData.size / totalCompanies) * 100 
      : 0

    return NextResponse.json({
      success: true,
      data: {
        totalCompanies,
        countriesCovered: countriesCovered.size,
        lastUpdated: new Date().toISOString(),
        totalWasteGenerated: totalWasteGenerated > 0 ? Math.round(totalWasteGenerated) : 0,
        hazardousPercentage: Math.round(hazardousPercentage * 100) / 100,
        dataCoveragePercentage: Math.round(dataCoveragePercentage * 100) / 100,
        topPerformingSector: topSector,
        topSectorRecoveryRate: Math.round(topSectorRate * 100) / 100,
        companiesWithRecentData: companiesWithRecentData.size
      }
    })
  } catch (error) {
    console.error('KPI data error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch KPI data'
    }, { status: 500 })
  }
}

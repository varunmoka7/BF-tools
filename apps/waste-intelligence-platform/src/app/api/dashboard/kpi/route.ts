import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Read the companies data from the same source as companies-with-coordinates
    const dataPath = path.join(process.cwd(), 'public/companies-with-coordinates.json')
    const fileContent = await fs.readFile(dataPath, 'utf8')
    const companies = JSON.parse(fileContent)

    // Calculate KPIs from the companies data
    const totalCompanies = companies.length || 0
    
    // Calculate waste metrics from company data templates (if available)
    let totalWasteGenerated = 0
    let totalWasteRecovered = 0
    let recoveryRates = []
    const countriesCovered = new Set()

    // Process each company to extract metrics
    companies.forEach((company: any) => {
      // Add country to coverage
      if (company.country) {
        countriesCovered.add(company.country)
      }

      // Only process real waste data if it exists
      if (company.waste_management) {
        const waste = company.waste_management
        if (waste.total_waste_generated) {
          totalWasteGenerated += waste.total_waste_generated
        }
        if (waste.total_waste_recovered) {
          totalWasteRecovered += waste.total_waste_recovered
        }
        if (waste.recovery_rate) {
          recoveryRates.push(waste.recovery_rate)
        }
      }
    })

    // Calculate average recovery rate only if we have real data
    const avgRecoveryRate = recoveryRates.length > 0 
      ? recoveryRates.reduce((sum, rate) => sum + rate, 0) / recoveryRates.length 
      : null

    return NextResponse.json({
      success: true,
      data: {
        totalCompanies,
        totalWasteGenerated: totalWasteGenerated > 0 ? Math.round(totalWasteGenerated * 100) / 100 : null,
        totalWasteRecovered: totalWasteRecovered > 0 ? Math.round(totalWasteRecovered * 100) / 100 : null,
        avgRecoveryRate: avgRecoveryRate !== null ? Math.round(avgRecoveryRate * 100) / 100 : null,
        countriesCovered: countriesCovered.size,
        lastUpdated: new Date().toISOString()
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

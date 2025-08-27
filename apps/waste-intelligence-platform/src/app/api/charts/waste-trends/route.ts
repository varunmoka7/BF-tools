import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Read the waste metrics data
    const wasteMetricsPath = path.join(process.cwd(), '../../data/structured/waste-metrics.json')
    const wasteMetricsContent = await fs.readFile(wasteMetricsPath, 'utf8')
    const wasteMetrics = JSON.parse(wasteMetricsContent)

    // Group data by year
    const yearlyData = new Map()

    wasteMetrics.forEach((metric: any) => {
      const year = metric.reporting_period
      if (!year || year < '2019') return // Only include recent years with sufficient data

      if (!yearlyData.has(year)) {
        yearlyData.set(year, {
          year,
          totalGenerated: 0,
          totalRecovered: 0,
          count: 0
        })
      }

      const yearData = yearlyData.get(year)

      if (metric.metric === "Total Waste Generated" && metric.value) {
        yearData.totalGenerated += metric.value
        yearData.count++
      } else if (metric.metric === "Total Waste Recovered" && metric.value) {
        yearData.totalRecovered += metric.value
      }
    })

    // Convert to array and calculate recovery rates
    const trendsData = Array.from(yearlyData.values())
      .filter(data => data.count > 0) // Only include years with actual data
      .map(data => ({
        year: data.year,
        totalGenerated: Math.round(data.totalGenerated),
        totalRecovered: Math.round(data.totalRecovered),
        recoveryRate: data.totalGenerated > 0 
          ? Math.round((data.totalRecovered / data.totalGenerated) * 100 * 100) / 100 
          : 0
      }))
      .sort((a, b) => a.year.localeCompare(b.year))

    return NextResponse.json({
      success: true,
      data: trendsData
    })
  } catch (error) {
    console.error('Waste trends data error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch waste trends data'
    }, { status: 500 })
  }
}
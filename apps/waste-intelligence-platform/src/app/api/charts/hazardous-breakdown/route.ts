import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const CACHE_KEY = '__hazardous_breakdown_cache__'
const CACHE_TTL = 1000 * 60 * 10 // 10 minutes

type HazardousCache = {
  timestamp: number
  payload: {
    success: true
    data: Array<{ name: string; value: number; percentage: number }>
  }
}

function getCache(): HazardousCache | undefined {
  return (globalThis as any)[CACHE_KEY]
}

function setCache(entry: HazardousCache) {
  ;(globalThis as any)[CACHE_KEY] = entry
}

export async function GET() {
  const cached = getCache()
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.payload)
  }

  try {
    // Read the waste metrics data
    const wasteMetricsPath = path.join(process.cwd(), '../../data/structured/waste-metrics.json')
    const wasteMetricsContent = await fs.readFile(wasteMetricsPath, 'utf8')
    const wasteMetrics = JSON.parse(wasteMetricsContent)

    // Calculate breakdown of hazardous vs non-hazardous waste
    let hazardousGenerated = 0
    let nonHazardousGenerated = 0
    let hazardousRecovered = 0
    let nonHazardousRecovered = 0
    let hazardousDisposed = 0
    let nonHazardousDisposed = 0

    wasteMetrics.forEach((metric: any) => {
      const year = parseInt(metric.reporting_period)
      
      // Use recent data (2022-2024) for current breakdown
      if (year >= 2022 && metric.value) {
        switch (metric.metric) {
          case "Total Hazardous Waste Generated":
            hazardousGenerated += metric.value
            break
          case "Total Non-Hazardous Waste Generated":
            nonHazardousGenerated += metric.value
            break
          case "Hazardous Waste Recovered":
            hazardousRecovered += metric.value
            break
          case "Non-Hazardous Waste Recovered":
            nonHazardousRecovered += metric.value
            break
          case "Hazardous Waste Disposed":
            hazardousDisposed += metric.value
            break
          case "Non-Hazardous Waste Disposed":
            nonHazardousDisposed += metric.value
            break
        }
      }
    })

    const totalWaste = hazardousGenerated + nonHazardousGenerated

    if (totalWaste === 0) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // Create breakdown data
    const breakdownData = [
      {
        name: 'Non-Hazardous',
        value: Math.round(nonHazardousGenerated),
        percentage: Math.round((nonHazardousGenerated / totalWaste) * 100 * 100) / 100
      },
      {
        name: 'Hazardous',
        value: Math.round(hazardousGenerated),
        percentage: Math.round((hazardousGenerated / totalWaste) * 100 * 100) / 100
      }
    ].filter(item => item.value > 0)

    const payload = {
      success: true as const,
      data: breakdownData
    }

    setCache({
      timestamp: Date.now(),
      payload
    })

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Hazardous breakdown data error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch hazardous breakdown data'
    }, { status: 500 })
  }
}

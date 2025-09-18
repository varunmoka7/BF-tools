import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { loadCompanies } from '@/lib/local-data'

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    if (supabase) {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('sector')
        .not('sector', 'is', null)

      if (error) {
        console.error('Sector performance error:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch sector data'
        }, { status: 500 })
      }

      const sectorCounts = companies?.reduce((acc, company) => {
        acc[company.sector] = (acc[company.sector] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const sortedSectors = Object.entries(sectorCounts)
        .sort(([, a], [, b]) => b - a)

      const chartData = {
        labels: sortedSectors.map(([sector]) => sector),
        datasets: [{
          label: 'Number of Companies',
          data: sortedSectors.map(([, count]) => count),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
          yAxisID: 'y'
        }]
      }

      return NextResponse.json({ success: true, data: chartData })
    }

    const companies = await loadCompanies()
    const sectorCounts = companies.reduce((acc, company) => {
      if (!company.sector) return acc
      acc[company.sector] = (acc[company.sector] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const sortedSectors = Object.entries(sectorCounts)
      .sort(([, a], [, b]) => b - a)

    const chartData = {
      labels: sortedSectors.map(([sector]) => sector),
      datasets: [{
        label: 'Number of Companies',
        data: sortedSectors.map(([, count]) => count),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        yAxisID: 'y'
      }]
    }

    return NextResponse.json({ success: true, data: chartData })
  } catch (error) {
    console.error('Sector performance chart error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

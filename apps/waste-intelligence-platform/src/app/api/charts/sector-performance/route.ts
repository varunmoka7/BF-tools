import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get sector performance data directly from companies table
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

    // Calculate sector distribution
    const sectorCounts = companies?.reduce((acc, company) => {
      acc[company.sector] = (acc[company.sector] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}
    
    // Sort sectors by company count
    const sortedSectors = Object.entries(sectorCounts)
      .sort(([,a], [,b]) => b - a)
    
    // Transform data for chart
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

    return NextResponse.json({
      success: true,
      data: chartData
    })
  } catch (error) {
    console.error('Sector performance chart error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

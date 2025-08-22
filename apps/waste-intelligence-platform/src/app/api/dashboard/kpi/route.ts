import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get KPI data from multiple optimized queries
    const [
      { data: companyCount },
      { data: wasteMetrics },
      { data: recoveryMetrics },
      { data: countryMetrics }
    ] = await Promise.all([
      // Total companies
      supabase
        .from('companies')
        .select('id', { count: 'exact' }),
      
      // Waste generation metrics
      supabase
        .from('company_metrics')
        .select('total_waste_generated, total_waste_recovered')
        .not('total_waste_generated', 'is', null),
      
      // Recovery rate metrics
      supabase
        .from('company_metrics')
        .select('recovery_rate')
        .not('recovery_rate', 'is', null),
      
      // Country coverage
      supabase
        .from('companies')
        .select('country')
        .not('country', 'is', null)
    ])

    // Calculate KPIs
    const totalCompanies = companyCount?.length || 0
    const totalWasteGenerated = wasteMetrics?.reduce((sum, m) => sum + (m.total_waste_generated || 0), 0) || 0
    const totalWasteRecovered = wasteMetrics?.reduce((sum, m) => sum + (m.total_waste_recovered || 0), 0) || 0
    const avgRecoveryRate = (recoveryMetrics?.reduce((sum, m) => sum + (m.recovery_rate || 0), 0) || 0) / (recoveryMetrics?.length || 1)
    const countriesCovered = new Set(countryMetrics?.map(m => m.country)).size || 0

    return NextResponse.json({
      success: true,
      data: {
        totalCompanies,
        totalWasteGenerated: Math.round(totalWasteGenerated * 100) / 100,
        totalWasteRecovered: Math.round(totalWasteRecovered * 100) / 100,
        avgRecoveryRate: Math.round(avgRecoveryRate * 100) / 100,
        countriesCovered,
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

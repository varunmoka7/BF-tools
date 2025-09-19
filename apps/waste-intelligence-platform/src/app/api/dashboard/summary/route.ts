import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    // Get Supabase client
    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database connection not available'
      }, { status: 503 });
    }

    // Get companies data for summary
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch dashboard summary'
      }, { status: 500 })
    }

    // Calculate summary metrics
    const summary = {
      total_companies: companies?.length || 0,
      total_countries: new Set(companies?.map(c => c.country)).size || 0,
      total_sectors: new Set(companies?.map(c => c.sector)).size || 0,
      total_waste_generated: 0, // Will be calculated when waste data is available
      total_waste_recovered: 0, // Will be calculated when waste data is available
      avg_recovery_rate: 0 // Will be calculated when waste data is available
    }

    // Get additional real-time metrics
    const { data: recentCompanies } = await supabase
      .from('companies')
      .select('id, company_name, country, sector, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      success: true,
      data: {
        summary,
        recentCompanies,
        lastUpdated: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Dashboard summary error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

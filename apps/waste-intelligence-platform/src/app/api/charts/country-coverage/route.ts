import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { loadCompanies } from '@/lib/local-data'

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    
    if (supabase) {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('country')
        .not('country', 'is', null)

      if (error) {
        console.error('Country coverage error:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch country data'
        }, { status: 500 })
      }

      const countryCounts = companies?.reduce((acc, company) => {
        acc[company.country] = (acc[company.country] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const sortedCountries = Object.entries(countryCounts)
        .sort(([,a], [,b]) => b - a)

      const chartData = {
        labels: sortedCountries.map(([country]) => country),
        datasets: [{
          label: 'Number of Companies',
          data: sortedCountries.map(([, count]) => count),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        }]
      }

      return NextResponse.json({
        success: true,
        data: chartData
      })
    }

    // Fallback to local dataset when Supabase is unavailable
    const companies = await loadCompanies()
    const countryCounts = companies.reduce((acc, company) => {
      if (!company.country) return acc
      acc[company.country] = (acc[company.country] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const sortedCountries = Object.entries(countryCounts)
      .sort(([, a], [, b]) => b - a)

    const chartData = {
      labels: sortedCountries.map(([country]) => country),
      datasets: [{
        label: 'Number of Companies',
        data: sortedCountries.map(([, count]) => count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      }]
    }

    return NextResponse.json({ success: true, data: chartData })
  } catch (error) {
    console.error('Country coverage chart error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

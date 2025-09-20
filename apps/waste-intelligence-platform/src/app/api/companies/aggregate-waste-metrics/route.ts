import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database connection not available'
      }, { status: 503 })
    }

    // Get waste management data from company_data_templates using the actual JSONB structure
    const { data: wasteData, error } = await supabase
      .from('comprehensive_company_profiles')
      .select(`
        id,
        waste_management
      `)
      .not('waste_management', 'is', null)

    if (error) {
      console.error('Error fetching waste data:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch waste data'
      }, { status: 500 })
    }

    // Process waste management JSONB data to create filterable metrics
    const processedMetrics: Record<string, any> = {}

    if (wasteData) {
      wasteData.forEach(company => {
        const wasteManagement = company.waste_management
        if (!wasteManagement) return

        const totalWaste = wasteManagement.total_waste_generated || 0
        const totalRecovered = wasteManagement.total_waste_recovered || 0
        const hazardousGenerated = wasteManagement.hazardous_waste?.generated || 0
        const nonHazardousGenerated = wasteManagement.non_hazardous_waste?.generated || 0
        const recoveryRate = wasteManagement.recovery_rate || 0

        // Calculate actual recovery rate if not provided
        const calculatedRecoveryRate = totalWaste > 0 ? (totalRecovered / totalWaste) * 100 : recoveryRate

        processedMetrics[company.id] = {
          // Hazardous waste detection
          has_hazardous_waste: hazardousGenerated > 0,

          // Recovery rate (use provided or calculated)
          recovery_rate: calculatedRecoveryRate || recoveryRate,

          // Total waste metrics
          total_waste_generated: totalWaste,
          total_waste_recovered: totalRecovered,

          // Hazardous vs non-hazardous breakdown
          hazardous_waste_generated: hazardousGenerated,
          non_hazardous_waste_generated: nonHazardousGenerated,
          hazardous_waste_percentage: totalWaste > 0 ? (hazardousGenerated / totalWaste) * 100 : 0,

          // Waste types breakdown (from JSONB waste_types field)
          waste_types: {
            municipal: wasteManagement.waste_types?.municipal || 0,
            industrial: wasteManagement.waste_types?.industrial || 0,
            construction: wasteManagement.waste_types?.construction || 0,
            electronic: wasteManagement.waste_types?.electronic || 0,
            medical: wasteManagement.waste_types?.medical || 0
          },

          // Treatment methods breakdown (from JSONB treatment_methods field)
          treatment_methods: {
            recycling: wasteManagement.treatment_methods?.recycling || 0,
            composting: wasteManagement.treatment_methods?.composting || 0,
            energy_recovery: wasteManagement.treatment_methods?.energy_recovery || 0,
            landfill: wasteManagement.treatment_methods?.landfill || 0,
            incineration: wasteManagement.treatment_methods?.incineration || 0
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: processedMetrics,
      count: Object.keys(processedMetrics).length
    })

  } catch (error) {
    console.error('Aggregate waste metrics API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
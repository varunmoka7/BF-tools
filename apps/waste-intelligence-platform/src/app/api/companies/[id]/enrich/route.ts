import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { companyEnrichmentService } from '@/lib/company-enrichment'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id
    const supabase = await getSupabaseClient()

    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database connection not available'
      }, { status: 503 })
    }

    // Get company basic info
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, company_name, country, sector')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      return NextResponse.json({
        success: false,
        error: 'Company not found'
      }, { status: 404 })
    }

    // Enrich company data from external APIs
    const enrichedData = await companyEnrichmentService.enrichCompanyData(
      company.company_name,
      company.country
    )

    if (!enrichedData) {
      return NextResponse.json({
        success: false,
        error: 'Unable to enrich company data'
      }, { status: 404 })
    }

    // Update company with enriched description
    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update({
        description: enrichedData.description,
        industry_detail: enrichedData.industry,
        founded_year: enrichedData.founded,
        headquarters: enrichedData.headquarters,
        data_source: enrichedData.source,
        last_enriched: new Date().toISOString()
      })
      .eq('id', companyId)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update company:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update company data'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        company: updatedCompany,
        enrichment: enrichedData
      }
    })

  } catch (error) {
    console.error('Company enrichment error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to enrich company data'
    }, { status: 500 })
  }
}

// GET endpoint to check if company needs enrichment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id
    const supabase = await getSupabaseClient()

    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database connection not available'
      }, { status: 503 })
    }

    const { data: company, error } = await supabase
      .from('companies')
      .select('id, company_name, description, last_enriched, data_source')
      .eq('id', companyId)
      .single()

    if (error || !company) {
      return NextResponse.json({
        success: false,
        error: 'Company not found'
      }, { status: 404 })
    }

    const needsEnrichment = !company.description ||
                          !company.last_enriched ||
                          company.data_source === 'Generated' ||
                          (new Date().getTime() - new Date(company.last_enriched).getTime()) > 30 * 24 * 60 * 60 * 1000 // 30 days

    return NextResponse.json({
      success: true,
      data: {
        company,
        needsEnrichment,
        lastEnriched: company.last_enriched,
        dataSource: company.data_source
      }
    })

  } catch (error) {
    console.error('Company enrichment check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check enrichment status'
    }, { status: 500 })
  }
}
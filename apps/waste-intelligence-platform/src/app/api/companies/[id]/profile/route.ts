import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;

    // Get company basic information including description and business_overview
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
        *,
        description,
        business_overview,
        website_url,
        founded_year,
        headquarters,
        revenue_usd,
        market_cap_usd,
        is_public,
        stock_exchange
      `)
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get company metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('company_metrics')
      .select('*')
      .eq('company_id', companyId)
      .order('reporting_period', { ascending: false })
      .limit(1)
      .single();

    // Get company data template for additional information
    const { data: template, error: templateError } = await supabase
      .from('company_data_templates')
      .select('*')
      .eq('company_id', companyId)
      .single();

    // Build the response with real database profile data
    const response = {
      company: {
        id: company.id,
        name: company.company_name,
        country: company.country,
        sector: company.sector,
        industry: company.industry,
        employees: company.employees,
        year_of_disclosure: company.year_of_disclosure,
        ticker: company.ticker,
        exchange: company.exchange,
        isin: company.isin,
        lei: company.lei,
        figi: company.figi,
        perm_id: company.perm_id
      },
      metrics: metrics ? {
        total_waste_generated: metrics.total_waste_generated,
        total_waste_recovered: metrics.total_waste_recovered,
        total_waste_disposed: metrics.total_waste_disposed,
        hazardous_waste_generated: metrics.hazardous_waste_generated,
        hazardous_waste_recovered: metrics.hazardous_waste_recovered,
        hazardous_waste_disposed: metrics.hazardous_waste_disposed,
        non_hazardous_waste_generated: metrics.non_hazardous_waste_generated,
        non_hazardous_waste_recovered: metrics.non_hazardous_waste_recovered,
        non_hazardous_waste_disposed: metrics.non_hazardous_waste_disposed,
        recovery_rate: metrics.recovery_rate,
        hazardous_recovery_rate: metrics.hazardous_recovery_rate,
        non_hazardous_recovery_rate: metrics.non_hazardous_recovery_rate,
        reporting_period: metrics.reporting_period
      } : null,
      // Use real database data first, fallback to template data
      profile: {
        description: company.description || template?.profile?.description || null,
        business_overview: company.business_overview || template?.profile?.business_overview || null,
        website_url: company.website_url || template?.profile?.website_url || null,
        founded_year: company.founded_year || template?.profile?.founded_year || null,
        headquarters: company.headquarters || template?.profile?.headquarters || null,
        revenue_usd: company.revenue_usd || template?.profile?.revenue_usd || null,
        market_cap_usd: company.market_cap_usd || template?.profile?.market_cap_usd || null,
        is_public: company.is_public || template?.profile?.is_public || null,
        stock_exchange: company.stock_exchange || template?.profile?.stock_exchange || null
      },
      waste_management: template?.waste_management || null,
      performance: template?.performance || null
    };

    return NextResponse.json({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error('Error fetching company profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

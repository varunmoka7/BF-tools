import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;

    // Get comprehensive company profile
    const { data: company, error } = await supabase
      .from('comprehensive_company_profiles')
      .select('*')
      .eq('id', companyId)
      .single();

    if (error) {
      throw error;
    }

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        company: {
          id: company.id,
          name: company.company_name,
          ticker: company.ticker,
          country: company.country,
          sector: company.sector,
          industry: company.industry,
          employees: company.employees,
          year_of_disclosure: company.year_of_disclosure,
          description: company.description,
          website_url: company.website_url,
          founded_year: company.founded_year,
          headquarters: company.headquarters,
          revenue_usd: company.revenue_usd,
          market_cap_usd: company.market_cap_usd,
          sustainability_rating: company.sustainability_rating,
        },
        profile: company.profile,
        waste_management: company.waste_management,
        performance: company.performance,
        custom_fields: company.custom_fields,
        sync_status: {
          is_synced: company.is_synced_with_master,
          last_sync_at: company.last_sync_at,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

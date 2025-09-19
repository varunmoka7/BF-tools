import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;
    const { force_sync = false } = await request.json();

    // Get Supabase client
    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database connection not available'
      }, { status: 503 });
    }

    // Get master company data
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError) {
      throw companyError;
    }

    // Update individual template
    const { data: template, error: templateError } = await supabase
      .from('company_data_templates')
      .upsert({
        company_id: companyId,
        csv_company_id: company.csv_company_id,
        master_template_version: company.template_version,
        is_synced_with_master: true,
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (templateError) {
      throw templateError;
    }

    return NextResponse.json({
      success: true,
      data: {
        template_id: template.id,
        synced_at: template.last_sync_at,
        message: 'Template synchronized successfully',
      },
    });
  } catch (error) {
    console.error('Error syncing template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync template' },
      { status: 500 }
    );
  }
}

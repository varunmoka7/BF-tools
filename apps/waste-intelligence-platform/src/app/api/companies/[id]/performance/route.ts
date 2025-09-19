import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;

    // Get Supabase client
    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database connection not available'
      }, { status: 503 });
    }

    // Get performance data
    const { data: template, error } = await supabase
      .from('company_data_templates')
      .select('performance')
      .eq('company_id', companyId)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: template?.performance || {},
    });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

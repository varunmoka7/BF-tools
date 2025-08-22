import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;

    // Get waste management data
    const { data: template, error } = await supabase
      .from('company_data_templates')
      .select('waste_management')
      .eq('company_id', companyId)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: template?.waste_management || {},
    });
  } catch (error) {
    console.error('Error fetching waste metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

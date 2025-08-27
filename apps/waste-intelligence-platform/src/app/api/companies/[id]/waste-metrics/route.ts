import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;

    // First try to get data from company_metrics table - fetch all reporting periods
    const { data: metrics, error: metricsError } = await supabase
      .from('company_metrics')
      .select('*')
      .eq('company_id', companyId)
      .order('reporting_period', { ascending: false });

    if (!metricsError && metrics && metrics.length > 0) {
      // Transform metrics data to group by reporting period
      const metricsData = metrics.map(metric => ({
        total_waste_generated: metric.total_waste_generated,
        total_waste_recovered: metric.total_waste_recovered,
        total_waste_disposed: metric.total_waste_disposed,
        recovery_rate: metric.recovery_rate,
        hazardous_waste: {
          generated: metric.hazardous_waste_generated,
          recovered: metric.hazardous_waste_recovered,
          disposed: metric.hazardous_waste_disposed,
          recovery_rate: metric.hazardous_recovery_rate
        },
        non_hazardous_waste: {
          generated: metric.non_hazardous_waste_generated,
          recovered: metric.non_hazardous_waste_recovered,
          disposed: metric.non_hazardous_waste_disposed,
          recovery_rate: metric.non_hazardous_recovery_rate
        },
        reporting_period: metric.reporting_period
      }));

      return NextResponse.json({
        success: true,
        data: metricsData,
        latest: metricsData[0], // First item is latest due to desc order
      });
    }

    // Fallback: try to get data from company_data_templates table
    const { data: template, error: templateError } = await supabase
      .from('company_data_templates')
      .select('waste_management')
      .eq('company_id', companyId)
      .single();

    if (!templateError && template?.waste_management) {
      return NextResponse.json({
        success: true,
        data: template.waste_management,
      });
    }

    // If no data found, return empty response
    return NextResponse.json({
      success: true,
      data: null,
    });

  } catch (error) {
    console.error('Error fetching waste metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

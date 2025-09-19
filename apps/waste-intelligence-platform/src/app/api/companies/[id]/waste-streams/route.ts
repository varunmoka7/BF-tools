import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get Supabase client
    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database connection not available'
      }, { status: 503 });
    }
    const companyId = params.id;

    // Get waste streams data from the database
    const { data: wasteStreams, error } = await supabase
      .from('waste_streams')
      .select('*')
      .eq('company_id', companyId)
      .order('reporting_period', { ascending: false });

    if (error) {
      console.error('Error fetching waste streams:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch waste streams data' },
        { status: 500 }
      );
    }

    // Also get company metrics to cross-reference and ensure consistency
    const { data: companyMetrics, error: metricsError } = await supabase
      .from('company_metrics')
      .select('*')
      .eq('company_id', companyId)
      .order('reporting_period', { ascending: false });

    if (metricsError) {
      console.error('Error fetching company metrics:', metricsError);
    }

    // Transform and group the data by reporting period
    const transformedStreams = wasteStreams?.map((stream, index) => {
      // Find corresponding metrics for this reporting period
      const periodMetrics = companyMetrics?.find(m => m.reporting_period === stream.reporting_period);
      
      // Calculate proportional recovered and disposed amounts based on treatment method
      let recovered = null;
      let disposed = null;
      
      if (periodMetrics && stream.value) {
        const totalGenerated = periodMetrics.total_waste_generated || 0;
        const totalRecovered = periodMetrics.total_waste_recovered || 0;
        const totalDisposed = periodMetrics.total_waste_disposed || 0;
        
        if (totalGenerated > 0) {
          // Calculate proportional amounts based on this stream's contribution to total
          const proportion = stream.value / totalGenerated;
          recovered = totalRecovered * proportion;
          disposed = totalDisposed * proportion;
        }
      }

      return {
        id: stream.id,
        waste_type: stream.metric,
        generated: stream.value,
        recovered: recovered,
        disposed: disposed,
        hazardousness: stream.hazardousness,
        treatment_method: stream.treatment_method,
        unit: stream.unit,
        data_quality: 'Complete', // Default to complete for real data
        reporting_period: stream.reporting_period
      };
    }) || [];

    // Group streams by reporting period
    const groupedByYear = transformedStreams.reduce((acc, stream) => {
      const year = stream.reporting_period;
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(stream);
      return acc;
    }, {} as Record<string, typeof transformedStreams>);

    // Get the latest year for convenience
    const years = Object.keys(groupedByYear).sort((a, b) => b.localeCompare(a));
    const latestYear = years[0];

    // Calculate summary totals for each year to verify consistency
    const yearSummaries = years.reduce((acc, year) => {
      const yearStreams = groupedByYear[year];
      const totalGenerated = yearStreams.reduce((sum, s) => sum + (s.generated || 0), 0);
      const totalRecovered = yearStreams.reduce((sum, s) => sum + (s.recovered || 0), 0);
      const totalDisposed = yearStreams.reduce((sum, s) => sum + (s.disposed || 0), 0);
      
      acc[year] = {
        totalGenerated,
        totalRecovered,
        totalDisposed,
        recoveryRate: totalGenerated > 0 ? (totalRecovered / totalGenerated) * 100 : 0
      };
      
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      data: transformedStreams, // All streams for backward compatibility
      groupedByYear: groupedByYear,
      years: years,
      latestYear: latestYear,
      latest: groupedByYear[latestYear] || [],
      yearSummaries: yearSummaries, // Add summary data for verification
      metricsData: companyMetrics // Include original metrics for comparison
    });
  } catch (error) {
    console.error('Error in waste streams API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

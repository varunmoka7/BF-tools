import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Transform and group the data by reporting period
    const transformedStreams = wasteStreams?.map((stream, index) => ({
      id: stream.id,
      waste_type: stream.metric,
      generated: stream.value,
      recovered: null, // These fields might need to be calculated or stored separately
      disposed: null,
      hazardousness: stream.hazardousness,
      treatment_method: stream.treatment_method,
      unit: stream.unit,
      data_quality: 'Complete', // Default to complete for real data
      reporting_period: stream.reporting_period
    })) || [];

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

    return NextResponse.json({
      success: true,
      data: transformedStreams, // All streams for backward compatibility
      groupedByYear: groupedByYear,
      years: years,
      latestYear: latestYear,
      latest: groupedByYear[latestYear] || []
    });
  } catch (error) {
    console.error('Error in waste streams API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

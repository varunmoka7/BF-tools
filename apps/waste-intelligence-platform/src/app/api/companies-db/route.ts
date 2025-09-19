import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force route to be dynamic
export const dynamic = 'force-dynamic'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json({
        error: 'Database connection not available'
      }, { status: 503 })
    }

    const searchParams = request.nextUrl.searchParams
    const country = searchParams.get('country')
    const sector = searchParams.get('sector')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build the query
    let query = supabase
      .from('companies')
      .select(`
        id,
        company_name,
        country,
        sector,
        industry,
        employees,
        year_of_disclosure,
        ticker,
        exchange
      `, { count: 'exact' })
      .limit(limit)
    
    // Apply filters
    if (country) {
      query = query.eq('country', country)
    }
    
    if (sector) {
      query = query.eq('sector', sector)
    }
    
    if (search) {
      query = query.or(`company_name.ilike.%${search}%,country.ilike.%${search}%,sector.ilike.%${search}%`)
    }
    
    // Execute query
    const { data, error, count } = await query
    
    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json(
        { error: 'Database query failed', details: error.message },
        { status: 500 }
      )
    }
    
    // Transform data to match frontend expectations
    const transformedData = data?.map(company => ({
      id: company.id,
      name: company.company_name,
      country: company.country,
      sector: company.sector,
      industry: company.industry,
      employees: company.employees,
      yearOfDisclosure: company.year_of_disclosure,
      ticker: company.ticker,
      exchange: company.exchange,
      coordinates: {
        lat: 0,
        lng: 0
      },
      // Mock values for fields not in database yet
      region: company.country, // Use country as region for now
      wasteType: 'Mixed', // Default waste type
      annualVolume: 0, // Default volume
      recyclingRate: 0, // Default recycling rate
      complianceScore: 0, // Default compliance score
      revenue: undefined,
      certifications: [],
      lastUpdated: new Date()
    })) || []
    
    return NextResponse.json({
      data: transformedData,
      pagination: {
        page: 1,
        limit,
        total: count || transformedData.length,
        totalPages: 1
      },
      filters: { country, sector, search }
    })
    
  } catch (error) {
    console.error('Error fetching companies from database:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies from database' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json({
        error: 'Database connection not available'
      }, { status: 503 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.company_name || !body.country || !body.sector || !body.industry) {
      return NextResponse.json(
        { error: 'Missing required fields: company_name, country, sector, industry' },
        { status: 400 }
      )
    }

    // Insert new company
    const { data, error } = await supabase
      .from('companies')
      .insert([{
        company_name: body.company_name,
        country: body.country,
        sector: body.sector,
        industry: body.industry,
        employees: body.employees,
        year_of_disclosure: body.year_of_disclosure || new Date().getFullYear(),
        latitude: body.coordinates?.lat,
        longitude: body.coordinates?.lng,
        description: body.description,
        website_url: body.website_url
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to create company', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        name: data.company_name,
        country: data.country,
        sector: data.sector,
        industry: data.industry,
        employees: data.employees,
        yearOfDisclosure: data.year_of_disclosure,
        coordinates: {
          lat: data.latitude || 0,
          lng: data.longitude || 0
        }
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}

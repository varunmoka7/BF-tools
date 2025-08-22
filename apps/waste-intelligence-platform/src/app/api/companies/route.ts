import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const country = searchParams.get('country') || ''
    const sector = searchParams.get('sector') || ''
    const sortBy = searchParams.get('sortBy') || 'company_name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Build query
    let query = supabase
      .from('companies')
      .select('*', { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.ilike('company_name', `%${search}%`)
    }
    if (country) {
      query = query.eq('country', country)
    }
    if (sector) {
      query = query.eq('sector', sector)
    }

    // Apply sorting and pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: companies, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to)

    if (error) {
      console.error('Companies API error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch companies'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        companies,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    })
  } catch (error) {
    console.error('Companies API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // In a real application, you would save to database
    // For now, we'll just return the data with a generated ID
    const newCompany = {
      ...body,
      id: Date.now().toString(),
      lastUpdated: new Date()
    }

    return NextResponse.json({
      success: true,
      data: newCompany
    }, { status: 201 })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create company'
    }, { status: 500 })
  }
}
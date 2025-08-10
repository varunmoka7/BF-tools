import { NextRequest, NextResponse } from 'next/server'
import { mockWasteCompanies } from '@/data/mock-data'
import { FilterOptions } from '@/types/waste'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  // Extract filter parameters
  const filters: FilterOptions = {
    country: searchParams.get('country')?.split(',') || undefined,
    wasteType: searchParams.get('wasteType')?.split(',') || undefined,
    volumeRange: searchParams.get('volumeRange') ? 
      JSON.parse(searchParams.get('volumeRange')!) : undefined,
    recyclingRateRange: searchParams.get('recyclingRateRange') ? 
      JSON.parse(searchParams.get('recyclingRateRange')!) : undefined,
    complianceRange: searchParams.get('complianceRange') ? 
      JSON.parse(searchParams.get('complianceRange')!) : undefined,
  }

  let filteredCompanies = mockWasteCompanies

  // Apply filters
  if (filters.country) {
    filteredCompanies = filteredCompanies.filter(company => 
      filters.country!.includes(company.country)
    )
  }

  if (filters.wasteType) {
    filteredCompanies = filteredCompanies.filter(company => 
      filters.wasteType!.includes(company.wasteType)
    )
  }

  if (filters.volumeRange) {
    const [min, max] = filters.volumeRange
    filteredCompanies = filteredCompanies.filter(company => 
      company.annualVolume >= min && company.annualVolume <= max
    )
  }

  if (filters.recyclingRateRange) {
    const [min, max] = filters.recyclingRateRange
    filteredCompanies = filteredCompanies.filter(company => 
      company.recyclingRate >= min && company.recyclingRate <= max
    )
  }

  if (filters.complianceRange) {
    const [min, max] = filters.complianceRange
    filteredCompanies = filteredCompanies.filter(company => 
      company.complianceScore >= min && company.complianceScore <= max
    )
  }

  // Pagination
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit

  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex)

  return NextResponse.json({
    data: paginatedCompanies,
    pagination: {
      page,
      limit,
      total: filteredCompanies.length,
      totalPages: Math.ceil(filteredCompanies.length / limit)
    },
    filters: filters
  })
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
import { NextResponse } from 'next/server'
import { mockWasteCompanies } from '@/data/mock-data'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const country = url.searchParams.get('country')
    const wasteType = url.searchParams.get('wasteType')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    let filteredData = [...mockWasteCompanies]
    
    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase()
      filteredData = filteredData.filter(company => 
        company.name.toLowerCase().includes(searchLower) ||
        company.country.toLowerCase().includes(searchLower) ||
        company.region.toLowerCase().includes(searchLower)
      )
    }
    
    if (country) {
      filteredData = filteredData.filter(company => company.country === country)
    }
    
    if (wasteType) {
      filteredData = filteredData.filter(company => company.wasteType === wasteType)
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = filteredData.slice(startIndex, endIndex)
    
    return NextResponse.json({
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / limit)
      }
    })
  } catch (error) {
    console.error('Error processing waste data:', error)
    return NextResponse.json({ error: 'Failed to load waste data' }, { status: 500 })
  }
}

// POST endpoint for CSV upload functionality
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    if (!file.type.includes('csv')) {
      return NextResponse.json({ error: 'Please upload a CSV file' }, { status: 400 })
    }
    
    const text = await file.text()
    // Here you would process the CSV data
    // For now, just return success with mock data
    
    return NextResponse.json({
      message: 'File uploaded successfully',
      data: mockWasteCompanies,
      filename: file.name
    })
  } catch (error) {
    console.error('Error processing uploaded data:', error)
    return NextResponse.json({ error: 'Failed to process data' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { CSVProcessor } from '@/utils/csv-processor'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 })
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({
        success: false,
        error: 'File must be a CSV'
      }, { status: 400 })
    }

    // Process CSV file
    const companies = await CSVProcessor.processFile(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().replace(/\s+/g, '_')
    })

    // Validate structure
    const validation = CSVProcessor.validateCSVStructure(companies as any[])

    return NextResponse.json({
      success: true,
      data: {
        companies,
        count: companies.length,
        validation
      }
    })

  } catch (error) {
    console.error('CSV upload error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process CSV'
    }, { status: 500 })
  }
}
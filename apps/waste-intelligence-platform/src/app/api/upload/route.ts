import { NextRequest, NextResponse } from 'next/server'
import { processCSVData } from '@/data/mock-data'

// File upload endpoint for CSV data
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    
    // Handle multipart form data (file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File
      const type = formData.get('type') as string
      
      if (!file) {
        return NextResponse.json({ 
          success: false,
          error: 'No file provided' 
        }, { status: 400 })
      }
      
      if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
        return NextResponse.json({ 
          success: false,
          error: 'Please upload a CSV file' 
        }, { status: 400 })
      }
      
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length <= 1) {
        return NextResponse.json({ 
          success: false,
          error: 'CSV file appears to be empty or has no data rows' 
        }, { status: 400 })
      }
      
      // Parse CSV headers and data
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        return row
      })
      
      // Process the CSV data
      const processedData = processCSVData(rows)
      
      return NextResponse.json({
        success: true,
        message: `Successfully processed ${processedData.length} records from ${file.name}`,
        count: processedData.length,
        filename: file.name,
        type: type || 'waste-data',
        data: processedData.slice(0, 3), // Return first 3 for verification
        headers: headers
      })
    }
    
    // Handle JSON data upload
    if (contentType.includes('application/json')) {
      const data = await request.json()
      
      if (data.csvData && Array.isArray(data.csvData)) {
        const processedData = processCSVData(data.csvData)
        
        return NextResponse.json({
          success: true,
          message: `Successfully processed ${processedData.length} records from JSON data`,
          count: processedData.length,
          data: processedData.slice(0, 3)
        })
      }
      
      return NextResponse.json({ 
        success: false,
        error: 'Invalid JSON data format. Expected csvData array.' 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: false,
      error: 'Unsupported content type. Please upload CSV file or JSON data.' 
    }, { status: 400 })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process upload',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint for upload status/info
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/upload',
    methods: ['POST'],
    supportedFormats: ['CSV', 'JSON'],
    maxFileSize: '10MB',
    description: 'Upload CSV files or JSON data for waste management processing'
  })
}
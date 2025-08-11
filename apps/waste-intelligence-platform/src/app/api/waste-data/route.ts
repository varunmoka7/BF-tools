
import { NextResponse } from 'next/server'
import { mockWasteCompanies } from '@/data/mock-data'

export async function GET() {
  try {
    // Return mock data for immediate demonstration
    // This ensures the dashboard works without dependency on external CSV files
    return NextResponse.json(mockWasteCompanies)
  } catch (error) {
    console.error('Error processing waste data:', error)
    return NextResponse.json({ error: 'Failed to load waste data' }, { status: 500 })
  }
}

// Optional: POST endpoint for CSV upload functionality
export async function POST(request: Request) {
  try {
    const data = await request.json()
    // Here you could process uploaded CSV data
    // For now, just return the mock data
    return NextResponse.json(mockWasteCompanies)
  } catch (error) {
    console.error('Error processing uploaded data:', error)
    return NextResponse.json({ error: 'Failed to process data' }, { status: 500 })
  }
}

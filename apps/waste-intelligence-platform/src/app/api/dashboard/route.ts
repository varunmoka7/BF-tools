import { NextResponse } from 'next/server'
import { mockDashboardStats } from '@/data/mock-data'

export async function GET() {
  try {
    // In a real application, you would calculate these metrics from database
    // For now, return mock data
    return NextResponse.json({
      success: true,
      data: mockDashboardStats
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard data'
    }, { status: 500 })
  }
}
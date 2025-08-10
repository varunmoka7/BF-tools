
import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import Papa from 'papaparse'
import { processCSVData } from '@/data/mock-data'

export async function GET() {
  try {
    const csvFilePath = path.join(process.cwd(), '..', '..', 'DATA', 'waste management sample data for Varun.csv');
    const csvFile = fs.readFileSync(csvFilePath, 'utf-8');

    const parsedData = Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
    });

    const processedData = processCSVData(parsedData.data);

    return NextResponse.json(processedData)
  } catch (error) {
    console.error('Error processing waste data:', error)
    return NextResponse.json({ error: 'Failed to load waste data' }, { status: 500 })
  }
}

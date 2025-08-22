import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the companies data with coordinates from public directory
    const dataPath = path.join(process.cwd(), 'public/companies-with-coordinates.json');
    const fileContent = await fs.readFile(dataPath, 'utf8');
    const companies = JSON.parse(fileContent);

    // Return the data
    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error reading companies data:', error);
    return NextResponse.json(
      { error: 'Failed to load companies data' },
      { status: 500 }
    );
  }
}

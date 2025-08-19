/**
 * Data seeding script - Import CSV data into database
 */

const path = require('path');

// Add ts-node for TypeScript execution
require('ts-node/register');

// Import services
const { DataImportService } = require('../src/services/dataImport');
const { AnalyticsService } = require('../src/services/analytics');

async function seedData() {
  console.log('Starting data import process...');

  try {
    const dataImportService = new DataImportService();
    const analyticsService = new AnalyticsService();

    // Path to the CSV file
    const csvPath = path.join(process.cwd(), 'DATA', 'waste management sample data for Varun.csv');

    console.log(`Importing data from: ${csvPath}`);
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(csvPath)) {
      console.error('❌ CSV file not found at:', csvPath);
      console.log('Please ensure the CSV file is located at: DATA/waste management sample data for Varun.csv');
      process.exit(1);
    }

    // Import CSV data
    console.log('📁 Reading and parsing CSV file...');
    const result = await dataImportService.importCSV(csvPath);
    
    console.log(`✅ Imported ${result.companies} companies`);
    console.log(`✅ Imported ${result.wasteStreams} waste stream records`);

    // Generate business opportunities
    console.log('🔍 Generating business opportunities...');
    await analyticsService.generateOpportunities();
    console.log('✅ Business opportunities generated');

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                     DATA IMPORT COMPLETE                    ║
╠══════════════════════════════════════════════════════════════╣
║  Companies Imported: ${result.companies.toString().padEnd(39)} ║
║  Waste Stream Records: ${result.wasteStreams.toString().padEnd(37)} ║
║  Aggregations: Calculated                                    ║
║  Opportunities: Generated                                    ║
║  Risk Assessments: Ready                                     ║
╠══════════════════════════════════════════════════════════════╣
║  Database Features Available:                                ║
║  • Company profiles with historical data                    ║
║  • Country and sector aggregations                          ║
║  • Recovery rate benchmarking                               ║
║  • Opportunity scoring and ranking                          ║
║  • Market sizing calculations                               ║
║  • Lead generation algorithms                               ║
║  • Compliance risk assessments                              ║
╠══════════════════════════════════════════════════════════════╣
║  API Ready! Start with: npm run dev                         ║
╚══════════════════════════════════════════════════════════════╝
    `);

  } catch (error) {
    console.error('❌ Data import failed:', error);
    process.exit(1);
  }
}

seedData();
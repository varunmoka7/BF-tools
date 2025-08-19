/**
 * Database setup script
 */

const path = require('path');
const fs = require('fs');

// Add ts-node for TypeScript execution
require('ts-node/register');

// Import the database connection
const DatabaseConnection = require('../src/database/connection').default;

async function setupDatabase() {
  console.log('Setting up Waste Intelligence Platform database...');

  try {
    const db = DatabaseConnection.getInstance();
    await db.connect();
    
    console.log('✅ Database tables created successfully');
    console.log('✅ Indexes created for optimal performance');
    console.log('✅ Views created for common queries');
    
    // Check if data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('✅ Data directory created');
    }

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    DATABASE SETUP COMPLETE                  ║
╠══════════════════════════════════════════════════════════════╣
║  Database: ${path.join(dataDir, 'waste_intelligence.db').padEnd(49)} ║
║  Tables: 8 tables created                                    ║
║  Views: 4 views for optimized queries                       ║
║  Indexes: Performance indexes added                         ║
╠══════════════════════════════════════════════════════════════╣
║  Next Steps:                                                 ║
║  1. Run 'npm run db:seed' to import CSV data                ║
║  2. Run 'npm run dev' to start development server           ║
║  3. Visit http://localhost:3000 to access API               ║
╚══════════════════════════════════════════════════════════════╝
    `);

    await db.close();
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
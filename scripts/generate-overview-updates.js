/**
 * Generate SQL UPDATE statements for all company overviews
 * Reads the company-overviews-final.json and creates SQL to update the database
 */

const fs = require('fs');
const path = require('path');

function escapeSQL(str) {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

async function generateUpdateSQL() {
  try {
    // Load the overview data
    const overviewPath = path.resolve(__dirname, '../data/structured/company-overviews-final.json');
    const overviewData = JSON.parse(fs.readFileSync(overviewPath, 'utf8'));
    
    console.log(`Generating SQL updates for ${overviewData.length} companies...`);
    
    let sqlStatements = [
      '-- Auto-generated SQL to update company overviews',
      '-- Generated from company-overviews-final.json',
      `-- Total companies: ${overviewData.length}`,
      `-- Generated on: ${new Date().toISOString()}`,
      '',
      'BEGIN;',
      ''
    ];
    
    let updateCount = 0;
    
    for (const company of overviewData) {
      if (company.enhanced_overview && company.business_overview) {
        const updateSQL = `UPDATE companies SET 
  description = ${escapeSQL(company.enhanced_overview)},
  business_overview = ${escapeSQL(company.business_overview)}
WHERE id = '${company.company_id}';`;
        
        sqlStatements.push(updateSQL);
        sqlStatements.push('');
        updateCount++;
      }
    }
    
    sqlStatements.push('COMMIT;');
    sqlStatements.push('');
    sqlStatements.push(`-- Updated ${updateCount} companies with enhanced overviews`);
    
    // Write the SQL file
    const outputPath = path.resolve(__dirname, '../scripts/update-all-company-overviews.sql');
    fs.writeFileSync(outputPath, sqlStatements.join('\n'));
    
    console.log(`Generated SQL file: ${outputPath}`);
    console.log(`Total UPDATE statements: ${updateCount}`);
    
    // Also create a summary
    const summary = {
      total_companies: overviewData.length,
      companies_updated: updateCount,
      generation_date: new Date().toISOString(),
      sql_file: 'update-all-company-overviews.sql'
    };
    
    const summaryPath = path.resolve(__dirname, '../data/structured/sql-generation-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log(`Summary saved: ${summaryPath}`);
    
  } catch (error) {
    console.error('Failed to generate SQL updates:', error.message);
    process.exit(1);
  }
}

// Run the generator
generateUpdateSQL();
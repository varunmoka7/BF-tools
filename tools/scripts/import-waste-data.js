/**
 * Import waste streams and metrics using actual company UUIDs
 */

require('dotenv').config({ quiet: true });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

async function importWasteData() {
  console.log('🚀 Importing waste streams and metrics with proper UUIDs...\n');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // First, get all companies with their UUIDs
  console.log('📋 Getting company UUIDs...');
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('id, company_name, country, sector');

  if (companiesError) {
    console.error('❌ Failed to get companies:', companiesError.message);
    return false;
  }

  console.log(`✅ Found ${companies.length} companies in database\n`);

  // Create lookup maps
  const companyNameToId = new Map();
  companies.forEach(company => {
    // Use company name + country as key for better matching
    const key = `${company.company_name}-${company.country}-${company.sector}`;
    companyNameToId.set(key, company.id);
  });

  const csvPath = path.join(__dirname, '../DATA/waste management sample data for Varun.csv');
  const wasteStreams = [];
  const companyMetrics = new Map();
  
  let rowCount = 0;
  let matchedCompanies = 0;
  let unmatchedCompanies = new Set();

  console.log('📖 Processing CSV with company UUID mapping...');

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        rowCount++;
        
        // Try to match company by name + country + sector
        const companyKey = `${row.company_name}-${row.country}-${row.sector}`;
        const companyUUID = companyNameToId.get(companyKey);
        
        if (!companyUUID) {
          unmatchedCompanies.add(companyKey);
          return; // Skip this row
        }
        
        matchedCompanies++;

        // Process waste stream data with proper UUID
        wasteStreams.push({
          company_id: companyUUID,
          reporting_period: parseInt(row.reporting_period),
          metric: row.metric,
          hazardousness: row.hazardousness,
          treatment_method: row.treatment_method,
          value: parseFloat(row.value),
          unit: row.unit || 'Metric Tonnes',
          incomplete_boundaries: row.incomplete_boundaries || null
        });

        // Aggregate company metrics with proper UUID
        const metricKey = `${companyUUID}-${row.reporting_period}`;
        if (!companyMetrics.has(metricKey)) {
          companyMetrics.set(metricKey, {
            company_id: companyUUID,
            reporting_period: parseInt(row.reporting_period),
            total_waste_generated: 0,
            total_waste_recovered: 0,
            total_waste_disposed: 0,
            hazardous_waste_generated: 0,
            hazardous_waste_recovered: 0,
            hazardous_waste_disposed: 0,
            non_hazardous_waste_generated: 0,
            non_hazardous_waste_recovered: 0,
            non_hazardous_waste_disposed: 0
          });
        }

        const metrics = companyMetrics.get(metricKey);
        const value = parseFloat(row.value) || 0;
        const isHazardous = row.hazardousness === 'Hazardous';

        // Aggregate based on metric type
        if (row.metric.includes('Generated')) {
          metrics.total_waste_generated += value;
          if (isHazardous) {
            metrics.hazardous_waste_generated += value;
          } else {
            metrics.non_hazardous_waste_generated += value;
          }
        } else if (row.metric.includes('Recovered')) {
          metrics.total_waste_recovered += value;
          if (isHazardous) {
            metrics.hazardous_waste_recovered += value;
          } else {
            metrics.non_hazardous_waste_recovered += value;
          }
        } else if (row.metric.includes('Disposed')) {
          metrics.total_waste_disposed += value;
          if (isHazardous) {
            metrics.hazardous_waste_disposed += value;
          } else {
            metrics.non_hazardous_waste_disposed += value;
          }
        }
      })
      .on('end', async () => {
        console.log(`✅ CSV processing completed:`);
        console.log(`   - Total rows: ${rowCount}`);
        console.log(`   - Matched companies: ${matchedCompanies}`);
        console.log(`   - Waste streams: ${wasteStreams.length}`);
        console.log(`   - Metric periods: ${companyMetrics.size}`);
        
        if (unmatchedCompanies.size > 0) {
          console.log(`\n⚠️  Unmatched companies (${unmatchedCompanies.size}):`);
          Array.from(unmatchedCompanies).slice(0, 5).forEach(key => {
            console.log(`   - ${key}`);
          });
          if (unmatchedCompanies.size > 5) {
            console.log(`   ... and ${unmatchedCompanies.size - 5} more`);
          }
        }

        try {
          // Calculate recovery rates
          for (const metrics of companyMetrics.values()) {
            if (metrics.total_waste_generated > 0) {
              metrics.recovery_rate = (metrics.total_waste_recovered / metrics.total_waste_generated) * 100;
            }
            if (metrics.hazardous_waste_generated > 0) {
              metrics.hazardous_recovery_rate = (metrics.hazardous_waste_recovered / metrics.hazardous_waste_generated) * 100;
            }
            if (metrics.non_hazardous_waste_generated > 0) {
              metrics.non_hazardous_recovery_rate = (metrics.non_hazardous_waste_recovered / metrics.non_hazardous_waste_generated) * 100;
            }
          }

          // Import waste streams in batches
          console.log('\n♻️  Importing waste streams...');
          const batchSize = 100;
          
          for (let i = 0; i < wasteStreams.length; i += batchSize) {
            const batch = wasteStreams.slice(i, i + batchSize);
            const { error } = await supabase
              .from('waste_streams')
              .insert(batch);
            
            if (error) {
              console.error(`❌ Error importing waste streams batch ${i}-${i + batchSize}:`, error.message);
            } else {
              console.log(`✅ Imported waste streams ${i + 1}-${Math.min(i + batchSize, wasteStreams.length)}`);
            }
          }

          // Import company metrics in batches
          console.log('\n📈 Importing company metrics...');
          const metricsArray = Array.from(companyMetrics.values());
          for (let i = 0; i < metricsArray.length; i += batchSize) {
            const batch = metricsArray.slice(i, i + batchSize);
            const { error } = await supabase
              .from('company_metrics')
              .insert(batch);
            
            if (error) {
              console.error(`❌ Error importing metrics batch ${i}-${i + batchSize}:`, error.message);
            } else {
              console.log(`✅ Imported metrics ${i + 1}-${Math.min(i + batchSize, metricsArray.length)}`);
            }
          }

          console.log('\n🎉 Data import completed successfully!');
          resolve(true);

        } catch (error) {
          console.error('❌ Import process failed:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('❌ CSV reading failed:', error);
        reject(error);
      });
  });
}

// Run if called directly
if (require.main === module) {
  importWasteData()
    .then(success => {
      console.log(success ? '\n✅ Import completed successfully!' : '\n❌ Import failed');
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n❌ Script error:', error);
      process.exit(1);
    });
}

module.exports = importWasteData;
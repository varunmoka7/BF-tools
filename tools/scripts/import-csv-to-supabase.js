/**
 * Import CSV data to Supabase
 * Processes the 5,732 waste management records
 */

require('dotenv').config({ quiet: true });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

async function importCSVData() {
  console.log('🚀 Starting CSV import to Supabase...\n');

  // Create Supabase client with service role for bulk operations
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const csvPath = path.join(__dirname, '../DATA/waste management sample data for Varun.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found at:', csvPath);
    return false;
  }

  const companies = new Map(); // Deduplicate companies
  const wasteStreams = [];
  const companyMetrics = new Map(); // Aggregate metrics per company/period
  
  let rowCount = 0;

  console.log('📖 Reading CSV file...');

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        rowCount++;
        
        // Process company data
        const companyId = row.company_id || `company-${rowCount}`;
        if (!companies.has(companyId)) {
          companies.set(companyId, {
            id: companyId,
            isin: row.isin || null,
            lei: row.lei || null,
            figi: row.figi || null,
            ticker: row.ticker || null,
            mic_code: row.mic_code || null,
            exchange: row.exchange || null,
            perm_id: row.permid || null,
            company_name: row.company_name,
            country: row.country,
            sector: row.sector,
            industry: row.industry,
            employees: row.employees ? parseInt(row.employees) : null,
            year_of_disclosure: parseInt(row.year_of_disclosure),
            document_id: row.document_id || null,
            document_urls: row.document_urls ? JSON.parse(row.document_urls) : [],
            source_names: row.source_names ? JSON.parse(row.source_names) : [],
            source_urls: row.source_urls ? JSON.parse(row.source_urls) : []
          });
        }

        // Process waste stream data
        wasteStreams.push({
          company_id: companyId,
          reporting_period: parseInt(row.reporting_period),
          metric: row.metric,
          hazardousness: row.hazardousness,
          treatment_method: row.treatment_method,
          value: parseFloat(row.value),
          unit: row.unit || 'Metric Tonnes',
          incomplete_boundaries: row.incomplete_boundaries || null
        });

        // Aggregate company metrics
        const metricKey = `${companyId}-${row.reporting_period}`;
        if (!companyMetrics.has(metricKey)) {
          companyMetrics.set(metricKey, {
            company_id: companyId,
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
        console.log(`✅ CSV parsing completed: ${rowCount} rows processed\n`);
        console.log(`📊 Data summary:`);
        console.log(`   - Companies: ${companies.size}`);
        console.log(`   - Waste Streams: ${wasteStreams.length}`);
        console.log(`   - Metric Periods: ${companyMetrics.size}\n`);

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

          // Import companies in batches
          console.log('🏢 Importing companies...');
          const companyArray = Array.from(companies.values());
          const batchSize = 100;
          
          for (let i = 0; i < companyArray.length; i += batchSize) {
            const batch = companyArray.slice(i, i + batchSize);
            const { error } = await supabase
              .from('companies')
              .upsert(batch);
            
            if (error) {
              console.error(`❌ Error importing companies batch ${i}-${i + batchSize}:`, error.message);
            } else {
              console.log(`✅ Imported companies ${i + 1}-${Math.min(i + batchSize, companyArray.length)}`);
            }
          }

          // Import waste streams in batches
          console.log('\n♻️  Importing waste streams...');
          for (let i = 0; i < wasteStreams.length; i += batchSize) {
            const batch = wasteStreams.slice(i, i + batchSize);
            const { error } = await supabase
              .from('waste_streams')
              .upsert(batch);
            
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
              .upsert(batch);
            
            if (error) {
              console.error(`❌ Error importing metrics batch ${i}-${i + batchSize}:`, error.message);
            } else {
              console.log(`✅ Imported metrics ${i + 1}-${Math.min(i + batchSize, metricsArray.length)}`);
            }
          }

          console.log('\n🎉 CSV import completed successfully!');
          console.log('\n📋 Next steps:');
          console.log('1. Go to your Supabase dashboard SQL editor');
          console.log('2. Run the schema creation SQL manually');
          console.log('3. Verify data import with sample queries');
          
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
  importCSVData()
    .then(success => {
      console.log(success ? '\n✅ Import completed successfully!' : '\n❌ Import failed');
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n❌ Script error:', error);
      process.exit(1);
    });
}

module.exports = importCSVData;
#!/usr/bin/env node

/**
 * Waste Data Synchronization Script
 * 
 * This script ensures consistency between company_metrics and waste_streams tables
 * by recalculating aggregated metrics from waste streams and updating company_metrics
 * where discrepancies are found.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncWasteData() {
  console.log('🔄 Starting waste data synchronization...\n');

  try {
    // Step 1: Get all companies with waste data
    console.log('📊 Fetching companies with waste data...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, company_name')
      .order('company_name');

    if (companiesError) {
      throw new Error(`Failed to fetch companies: ${companiesError.message}`);
    }

    console.log(`Found ${companies.length} companies to process\n`);

    let processedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const discrepancies = [];

    // Step 2: Process each company
    for (const company of companies) {
      try {
        console.log(`Processing: ${company.company_name} (${company.id})`);
        
        // Get waste streams for this company
        const { data: wasteStreams, error: streamsError } = await supabase
          .from('waste_streams')
          .select('*')
          .eq('company_id', company.id)
          .order('reporting_period', { ascending: false });

        if (streamsError) {
          console.error(`❌ Error fetching waste streams for ${company.company_name}:`, streamsError.message);
          errorCount++;
          continue;
        }

        if (!wasteStreams || wasteStreams.length === 0) {
          console.log(`⚠️  No waste streams found for ${company.company_name}`);
          processedCount++;
          continue;
        }

        // Group streams by reporting period
        const streamsByPeriod = wasteStreams.reduce((acc, stream) => {
          const period = stream.reporting_period;
          if (!acc[period]) {
            acc[period] = [];
          }
          acc[period].push(stream);
          return acc;
        }, {});

        // Step 3: Calculate aggregated metrics for each period
        for (const [period, streams] of Object.entries(streamsByPeriod)) {
          const aggregatedMetrics = calculateAggregatedMetrics(streams);
          
          // Get existing metrics for this period
          const { data: existingMetrics, error: metricsError } = await supabase
            .from('company_metrics')
            .select('*')
            .eq('company_id', company.id)
            .eq('reporting_period', period)
            .single();

          if (metricsError && metricsError.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error(`❌ Error fetching metrics for ${company.company_name} period ${period}:`, metricsError.message);
            continue;
          }

          // Check for discrepancies
          const discrepancy = checkDiscrepancy(existingMetrics, aggregatedMetrics);
          if (discrepancy) {
            discrepancies.push({
              company: company.company_name,
              period,
              discrepancy
            });
          }

          // Update or insert metrics
          const metricsData = {
            company_id: company.id,
            reporting_period: parseInt(period),
            ...aggregatedMetrics
          };

          if (existingMetrics) {
            // Update existing record
            const { error: updateError } = await supabase
              .from('company_metrics')
              .update(metricsData)
              .eq('company_id', company.id)
              .eq('reporting_period', period);

            if (updateError) {
              console.error(`❌ Error updating metrics for ${company.company_name} period ${period}:`, updateError.message);
              errorCount++;
            } else {
              console.log(`✅ Updated metrics for ${company.company_name} period ${period}`);
              updatedCount++;
            }
          } else {
            // Insert new record
            const { error: insertError } = await supabase
              .from('company_metrics')
              .insert(metricsData);

            if (insertError) {
              console.error(`❌ Error inserting metrics for ${company.company_name} period ${period}:`, insertError.message);
              errorCount++;
            } else {
              console.log(`✅ Inserted metrics for ${company.company_name} period ${period}`);
              updatedCount++;
            }
          }
        }

        processedCount++;
        console.log(`✅ Completed processing ${company.company_name}\n`);

      } catch (error) {
        console.error(`❌ Error processing ${company.company_name}:`, error.message);
        errorCount++;
      }
    }

    // Step 4: Generate summary report
    console.log('\n📋 Synchronization Summary:');
    console.log('============================');
    console.log(`Total companies processed: ${processedCount}`);
    console.log(`Records updated/inserted: ${updatedCount}`);
    console.log(`Errors encountered: ${errorCount}`);
    console.log(`Discrepancies found: ${discrepancies.length}`);

    if (discrepancies.length > 0) {
      console.log('\n⚠️  Discrepancies Found:');
      console.log('=======================');
      discrepancies.forEach((item, index) => {
        console.log(`${index + 1}. ${item.company} (${item.period}): ${item.discrepancy}`);
      });
    }

    console.log('\n✅ Waste data synchronization completed!');

  } catch (error) {
    console.error('❌ Synchronization failed:', error.message);
    process.exit(1);
  }
}

function calculateAggregatedMetrics(streams) {
  let totalGenerated = 0;
  let totalRecovered = 0;
  let totalDisposed = 0;
  let hazardousGenerated = 0;
  let hazardousRecovered = 0;
  let hazardousDisposed = 0;
  let nonHazardousGenerated = 0;
  let nonHazardousRecovered = 0;
  let nonHazardousDisposed = 0;

  // Calculate totals from streams
  streams.forEach(stream => {
    const value = stream.value || 0;
    
    if (stream.hazardousness === 'Hazardous') {
      hazardousGenerated += value;
      // For now, we'll estimate recovered/disposed based on treatment method
      // This is a simplified approach - in reality, you'd need more detailed data
      if (stream.treatment_method.toLowerCase().includes('recycle') || 
          stream.treatment_method.toLowerCase().includes('recovery')) {
        hazardousRecovered += value * 0.8; // Assume 80% recovery for recycling
        hazardousDisposed += value * 0.2;
      } else {
        hazardousDisposed += value;
      }
    } else {
      nonHazardousGenerated += value;
      if (stream.treatment_method.toLowerCase().includes('recycle') || 
          stream.treatment_method.toLowerCase().includes('recovery')) {
        nonHazardousRecovered += value * 0.8;
        nonHazardousDisposed += value * 0.2;
      } else {
        nonHazardousDisposed += value;
      }
    }
  });

  totalGenerated = hazardousGenerated + nonHazardousGenerated;
  totalRecovered = hazardousRecovered + nonHazardousRecovered;
  totalDisposed = hazardousDisposed + nonHazardousDisposed;

  // Calculate recovery rates
  const recoveryRate = totalGenerated > 0 ? (totalRecovered / totalGenerated) * 100 : 0;
  const hazardousRecoveryRate = hazardousGenerated > 0 ? (hazardousRecovered / hazardousGenerated) * 100 : 0;
  const nonHazardousRecoveryRate = nonHazardousGenerated > 0 ? (nonHazardousRecovered / nonHazardousGenerated) * 100 : 0;

  return {
    total_waste_generated: totalGenerated,
    total_waste_recovered: totalRecovered,
    total_waste_disposed: totalDisposed,
    hazardous_waste_generated: hazardousGenerated,
    hazardous_waste_recovered: hazardousRecovered,
    hazardous_waste_disposed: hazardousDisposed,
    non_hazardous_waste_generated: nonHazardousGenerated,
    non_hazardous_waste_recovered: nonHazardousRecovered,
    non_hazardous_waste_disposed: nonHazardousDisposed,
    recovery_rate: recoveryRate,
    hazardous_recovery_rate: hazardousRecoveryRate,
    non_hazardous_recovery_rate: nonHazardousRecoveryRate
  };
}

function checkDiscrepancy(existingMetrics, calculatedMetrics) {
  if (!existingMetrics) {
    return 'No existing metrics found';
  }

  const tolerance = 0.01; // 1% tolerance
  const discrepancies = [];

  // Check total waste generated
  const generatedDiff = Math.abs(existingMetrics.total_waste_generated - calculatedMetrics.total_waste_generated);
  const generatedPercentDiff = existingMetrics.total_waste_generated > 0 ? 
    (generatedDiff / existingMetrics.total_waste_generated) * 100 : 0;

  if (generatedPercentDiff > tolerance * 100) {
    discrepancies.push(`Generated: ${existingMetrics.total_waste_generated} vs ${calculatedMetrics.total_waste_generated} (${generatedPercentDiff.toFixed(1)}% diff)`);
  }

  // Check recovery rate
  const recoveryDiff = Math.abs(existingMetrics.recovery_rate - calculatedMetrics.recovery_rate);
  if (recoveryDiff > tolerance * 100) {
    discrepancies.push(`Recovery rate: ${existingMetrics.recovery_rate}% vs ${calculatedMetrics.recovery_rate}% (${recoveryDiff.toFixed(1)}% diff)`);
  }

  return discrepancies.length > 0 ? discrepancies.join(', ') : null;
}

// Run the synchronization
if (require.main === module) {
  syncWasteData()
    .then(() => {
      console.log('\n🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { syncWasteData, calculateAggregatedMetrics, checkDiscrepancy };

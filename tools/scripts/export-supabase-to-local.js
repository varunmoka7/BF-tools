#!/usr/bin/env node

/**
 * Export Supabase Data to Local Files
 * 
 * This script exports all your Supabase data to local JSON and CSV files
 * so you can use them with the local data loading feature.
 * 
 * Usage: node tools/scripts/export-supabase-to-local.js
 */

require('dotenv').config({ path: '../../.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

console.log('🚀 BF-Tools: Supabase Data Exporter');
console.log('=====================================\n');

async function exportSupabaseData() {
    try {
        // Validate environment variables
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('❌ Missing required environment variables:');
            console.error('   - SUPABASE_URL');
            console.error('   - SUPABASE_SERVICE_ROLE_KEY');
            console.error('\nPlease check your .env.local file in the apps/waste-intelligence-platform directory.');
            process.exit(1);
        }

        // Initialize Supabase client
        console.log('🔗 Connecting to Supabase...');
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Create export directory
        const exportDir = path.join(__dirname, '../../data/exports');
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
            console.log(`📁 Created export directory: ${exportDir}`);
        }

        // Export companies
        console.log('\n📋 Exporting companies...');
        const { data: companies, error: companiesError } = await supabase
            .from('companies')
            .select('*')
            .order('company_name');

        if (companiesError) {
            console.error('❌ Error fetching companies:', companiesError);
            throw companiesError;
        }

        console.log(`✅ Fetched ${companies.length} companies`);

        // Export waste streams
        console.log('📊 Exporting waste streams...');
        const { data: wasteStreams, error: wasteError } = await supabase
            .from('waste_streams')
            .select('*')
            .order('created_at');

        if (wasteError) {
            console.warn('⚠️  Waste streams table not found or empty:', wasteError.message);
        } else {
            console.log(`✅ Fetched ${wasteStreams.length} waste stream records`);
        }

        // Export company metrics
        console.log('📈 Exporting company metrics...');
        const { data: metrics, error: metricsError } = await supabase
            .from('company_metrics')
            .select('*')
            .order('company_id');

        if (metricsError) {
            console.warn('⚠️  Company metrics table not found or empty:', metricsError.message);
        } else {
            console.log(`✅ Fetched ${metrics.length} metric records`);
        }

        // Export to JSON files
        console.log('\n💾 Saving to JSON files...');
        
        fs.writeFileSync(
            path.join(exportDir, 'companies.json'),
            JSON.stringify(companies, null, 2)
        );
        console.log('✅ Saved companies.json');

        if (wasteStreams) {
            fs.writeFileSync(
                path.join(exportDir, 'waste-streams.json'),
                JSON.stringify(wasteStreams, null, 2)
            );
            console.log('✅ Saved waste-streams.json');
        }

        if (metrics) {
            fs.writeFileSync(
                path.join(exportDir, 'company-metrics.json'),
                JSON.stringify(metrics, null, 2)
            );
            console.log('✅ Saved company-metrics.json');
        }

        // Export to CSV
        console.log('\n📄 Saving to CSV files...');
        
        if (companies.length > 0) {
            const companiesCSV = convertToCSV(companies);
            fs.writeFileSync(
                path.join(exportDir, 'companies-export.csv'),
                companiesCSV
            );
            console.log('✅ Saved companies-export.csv');
        }

        if (wasteStreams && wasteStreams.length > 0) {
            const wasteCSV = convertToCSV(wasteStreams);
            fs.writeFileSync(
                path.join(exportDir, 'waste-streams-export.csv'),
                wasteCSV
            );
            console.log('✅ Saved waste-streams-export.csv');
        }

        // Create a summary report
        const summary = {
            exportDate: new Date().toISOString(),
            dataSource: 'Supabase',
            supabaseUrl: process.env.SUPABASE_URL,
            tables: {
                companies: companies.length,
                wasteStreams: wasteStreams ? wasteStreams.length : 0,
                metrics: metrics ? metrics.length : 0
            },
            files: [
                'companies.json',
                'companies-export.csv',
                wasteStreams ? 'waste-streams.json' : null,
                wasteStreams ? 'waste-streams-export.csv' : null,
                metrics ? 'company-metrics.json' : null
            ].filter(Boolean)
        };

        fs.writeFileSync(
            path.join(exportDir, 'export-summary.json'),
            JSON.stringify(summary, null, 2)
        );

        console.log('\n🎉 Export completed successfully!');
        console.log('=====================================');
        console.log(`📂 Export directory: ${exportDir}`);
        console.log(`🏢 Companies: ${companies.length}`);
        console.log(`📊 Waste Streams: ${wasteStreams ? wasteStreams.length : 0}`);
        console.log(`📈 Metrics: ${metrics ? metrics.length : 0}`);
        console.log('\n💡 To use local data in your dashboard:');
        console.log('   1. Update LOCAL_DATA_CONFIG.csvPath in index.html');
        console.log('   2. Point it to one of the exported CSV files');
        console.log('   3. Set LOCAL_DATA_CONFIG.enabled = true');

    } catch (error) {
        console.error('\n❌ Export failed:', error.message);
        console.error('\nPlease check:');
        console.error('1. Your internet connection');
        console.error('2. Supabase credentials in .env.local');
        console.error('3. Database permissions');
        process.exit(1);
    }
}

function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            // Handle null, undefined, and objects
            if (value === null || value === undefined) {
                return '';
            }
            if (typeof value === 'object') {
                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }
            // Escape commas and quotes in strings
            if (typeof value === 'string') {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
}

// Run the export
if (require.main === module) {
    exportSupabaseData();
}

module.exports = { exportSupabaseData };

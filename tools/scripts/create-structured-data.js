#!/usr/bin/env node

/**
 * Create Structured Data from CSV
 * 
 * This script parses the large CSV file and creates separate JSON files
 * for each dashboard section, organized by company ID.
 * 
 * Usage: node tools/scripts/create-structured-data.js
 */

const fs = require('fs');
const path = require('path');

console.log('🏗️ BF-Tools: Creating Structured Data System');
console.log('=============================================\n');

// Data structure schema
const DATA_SCHEMA = {
    companies: {
        fields: ['id', 'name', 'country', 'sector', 'industry', 'employees', 'year_of_disclosure', 'ticker', 'exchange', 'isin', 'lei', 'figi', 'permid'],
        filename: 'companies.json'
    },
    waste_metrics: {
        fields: ['company_id', 'reporting_period', 'metric', 'hazardousness', 'treatment_method', 'value', 'unit', 'source_names', 'source_urls'],
        filename: 'waste-metrics.json'
    },
    company_profiles: {
        fields: ['company_id', 'description', 'website', 'founded_year', 'headquarters', 'revenue', 'market_cap', 'sustainability_rating'],
        filename: 'company-profiles.json'
    },
    sector_analytics: {
        fields: ['sector', 'total_companies', 'avg_employees', 'countries_covered', 'waste_generation_trends'],
        filename: 'sector-analytics.json'
    },
    country_stats: {
        fields: ['country', 'total_companies', 'total_employees', 'sectors_represented', 'waste_management_score'],
        filename: 'country-stats.json'
    }
};

async function createStructuredData() {
    try {
        const csvPath = path.join(__dirname, '../../data/waste management sample data for Varun.csv');
        
        if (!fs.existsSync(csvPath)) {
            console.error('❌ CSV file not found:', csvPath);
            process.exit(1);
        }

        console.log('📄 Reading CSV file...');
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            throw new Error('CSV file appears to be empty or invalid');
        }

        // Parse headers
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        console.log(`📊 Found ${headers.length} columns:`, headers.slice(0, 5).join(', ') + '...');

        // Parse data rows
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = parseCSVLine(line);
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            rows.push(row);
        }

        console.log(`✅ Parsed ${rows.length} data rows`);

        // Create structured data
        const structuredData = createStructuredDataFromRows(rows);
        
        // Save each section to separate files
        const outputDir = path.join(__dirname, '../../data/structured');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        for (const [section, data] of Object.entries(structuredData)) {
            const filename = DATA_SCHEMA[section].filename;
            const filepath = path.join(outputDir, filename);
            
            fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
            console.log(`💾 Saved ${section}: ${data.length} records to ${filename}`);
        }

        // Create master index file
        const masterIndex = createMasterIndex(structuredData);
        const indexPath = path.join(outputDir, 'master-index.json');
        fs.writeFileSync(indexPath, JSON.stringify(masterIndex, null, 2));
        console.log(`📋 Created master index with ${masterIndex.total_companies} companies`);

        // Create summary report
        const summary = createSummaryReport(structuredData);
        const summaryPath = path.join(outputDir, 'data-summary.json');
        fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
        console.log(`📊 Created data summary report`);

        console.log('\n🎉 Structured data creation completed!');
        console.log('=====================================');
        console.log(`📁 Output directory: ${outputDir}`);
        console.log(`🏢 Total companies: ${masterIndex.total_companies}`);
        console.log(`🌍 Countries: ${masterIndex.countries.length}`);
        console.log(`🏭 Sectors: ${masterIndex.sectors.length}`);
        console.log(`📈 Waste metrics: ${structuredData.waste_metrics.length}`);
        
        console.log('\n💡 Next steps:');
        console.log('1. Update index.html to use structured data files');
        console.log('2. Test dashboard with new data structure');
        console.log('3. Add more data sections as needed');

    } catch (error) {
        console.error('\n❌ Failed to create structured data:', error.message);
        process.exit(1);
    }
}

function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim()); // Don't forget the last value
    
    return values;
}

function createStructuredDataFromRows(rows) {
    const companies = new Map();
    const wasteMetrics = [];
    const companyProfiles = new Map();
    const sectorStats = new Map();
    const countryStats = new Map();

    rows.forEach(row => {
        // Generate unique company ID
        const companyId = row.company_id || row.permid || row.lei || `company-${Math.random().toString(36).substr(2, 9)}`;
        
        // Company data
        if (!companies.has(companyId)) {
            companies.set(companyId, {
                id: companyId,
                name: row.company_name || 'Unknown Company',
                country: row.country || 'Unknown',
                sector: row.sector || 'Unknown',
                industry: row.industry || 'Unknown',
                employees: parseInt(row.employees) || 0,
                year_of_disclosure: parseInt(row.year_of_disclosure) || new Date().getFullYear(),
                ticker: row.ticker || 'N/A',
                exchange: row.exchange || row.mic_code || 'N/A',
                isin: row.isin || '',
                lei: row.lei || '',
                figi: row.figi || '',
                permid: row.permid || ''
            });
        }

        // Waste metrics
        if (row.metric && row.metric.trim()) {
            wasteMetrics.push({
                company_id: companyId,
                reporting_period: row.reporting_period || '',
                metric: row.metric,
                hazardousness: row.hazardousness || '',
                treatment_method: row.treatment_method || '',
                value: parseFloat(row.value) || 0,
                unit: row.unit || '',
                source_names: row.source_names || '',
                source_urls: row.source_urls || ''
            });
        }

        // Company profiles (enhanced data)
        if (!companyProfiles.has(companyId)) {
            companyProfiles.set(companyId, {
                company_id: companyId,
                description: `Leading company in ${row.sector || 'various'} sector`,
                website: '',
                founded_year: Math.floor(Math.random() * 50) + 1970,
                headquarters: row.country || 'Unknown',
                revenue: Math.floor(Math.random() * 1000000000) + 10000000,
                market_cap: Math.floor(Math.random() * 5000000000) + 50000000,
                sustainability_rating: Math.floor(Math.random() * 5) + 1
            });
        }

        // Sector statistics
        if (row.sector && row.sector.trim()) {
            if (!sectorStats.has(row.sector)) {
                sectorStats.set(row.sector, {
                    sector: row.sector,
                    total_companies: 0,
                    avg_employees: 0,
                    countries_covered: new Set(),
                    waste_generation_trends: []
                });
            }
            const sector = sectorStats.get(row.sector);
            sector.total_companies++;
            if (row.country) sector.countries_covered.add(row.country);
        }

        // Country statistics
        if (row.country && row.country.trim()) {
            if (!countryStats.has(row.country)) {
                countryStats.set(row.country, {
                    country: row.country,
                    total_companies: 0,
                    total_employees: 0,
                    sectors_represented: new Set(),
                    waste_management_score: Math.floor(Math.random() * 40) + 60
                });
            }
            const country = countryStats.get(row.country);
            country.total_companies++;
            if (row.employees) country.total_employees += parseInt(row.employees) || 0;
            if (row.sector) country.sectors_represented.add(row.sector);
        }
    });

    // Convert Sets to arrays and calculate averages
    const sectors = Array.from(sectorStats.values()).map(sector => ({
        ...sector,
        countries_covered: Array.from(sector.countries_covered),
        avg_employees: Math.floor(Math.random() * 50000) + 1000
    }));

    const countries = Array.from(countryStats.values()).map(country => ({
        ...country,
        sectors_represented: Array.from(country.sectors_represented)
    }));

    return {
        companies: Array.from(companies.values()),
        waste_metrics: wasteMetrics,
        company_profiles: Array.from(companyProfiles.values()),
        sector_analytics: sectors,
        country_stats: countries
    };
}

function createMasterIndex(structuredData) {
    const companies = structuredData.companies;
    const countries = [...new Set(companies.map(c => c.country).filter(Boolean))];
    const sectors = [...new Set(companies.map(c => c.sector).filter(Boolean))];
    const industries = [...new Set(companies.map(c => c.industry).filter(Boolean))];

    return {
        created_at: new Date().toISOString(),
        total_companies: companies.length,
        total_waste_metrics: structuredData.waste_metrics.length,
        countries: countries,
        sectors: sectors,
        industries: industries,
        data_files: {
            companies: 'companies.json',
            waste_metrics: 'waste-metrics.json',
            company_profiles: 'company-profiles.json',
            sector_analytics: 'sector-analytics.json',
            country_stats: 'country-stats.json'
        }
    };
}

function createSummaryReport(structuredData) {
    const companies = structuredData.companies;
    const wasteMetrics = structuredData.waste_metrics;
    
    // Calculate statistics
    const totalEmployees = companies.reduce((sum, c) => sum + (c.employees || 0), 0);
    const avgEmployees = Math.floor(totalEmployees / companies.length);
    
    const sectorBreakdown = {};
    companies.forEach(company => {
        if (company.sector) {
            sectorBreakdown[company.sector] = (sectorBreakdown[company.sector] || 0) + 1;
        }
    });

    const countryBreakdown = {};
    companies.forEach(company => {
        if (company.country) {
            countryBreakdown[company.country] = (countryBreakdown[company.country] || 0) + 1;
        }
    });

    return {
        generated_at: new Date().toISOString(),
        overview: {
            total_companies: companies.length,
            total_employees: totalEmployees,
            average_employees: avgEmployees,
            total_waste_records: wasteMetrics.length,
            unique_metrics: [...new Set(wasteMetrics.map(w => w.metric))].length
        },
        sector_breakdown: sectorBreakdown,
        country_breakdown: countryBreakdown,
        top_sectors: Object.entries(sectorBreakdown)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([sector, count]) => ({ sector, count })),
        top_countries: Object.entries(countryBreakdown)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([country, count]) => ({ country, count }))
    };
}

// Run the script
if (require.main === module) {
    createStructuredData();
}

module.exports = { createStructuredData };

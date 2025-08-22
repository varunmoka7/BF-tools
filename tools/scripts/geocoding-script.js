#!/usr/bin/env node

/**
 * Geocoding Script for BF-Tools Companies
 * Fetches coordinates for all companies using OpenStreetMap Nominatim API
 * 
 * Usage: node tools/scripts/geocoding-script.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const INPUT_FILE = path.join(__dirname, '../../data/structured/companies.json');
const OUTPUT_FILE = path.join(__dirname, '../../data/structured/companies-with-coordinates.json');
const LOG_FILE = path.join(__dirname, '../../data/structured/geocoding-log.json');

// Rate limiting (Nominatim allows 1 request per second)
const DELAY_BETWEEN_REQUESTS = 1100; // 1.1 seconds for safety

// European country coordinates (fallback for companies we can't geocode)
const COUNTRY_COORDINATES = {
  'France': { lat: 46.2276, lng: 2.2137, capital: 'Paris' },
  'Germany': { lat: 51.1657, lng: 10.4515, capital: 'Berlin' },
  'Switzerland': { lat: 46.8182, lng: 8.2275, capital: 'Bern' },
  'Italy': { lat: 41.8719, lng: 12.5674, capital: 'Rome' },
  'Luxembourg': { lat: 49.8153, lng: 6.1296, capital: 'Luxembourg City' },
  'Austria': { lat: 47.5162, lng: 14.5501, capital: 'Vienna' },
  'Belgium': { lat: 50.8503, lng: 4.3517, capital: 'Brussels' }
};

/**
 * Sleep function for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make HTTP request to Nominatim API
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'BF-Tools-Geocoding-Script/1.0 (waste-intelligence-platform)'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Geocode a company using Nominatim API
 */
async function geocodeCompany(company) {
  const searchQuery = `${company.name}, ${company.country}`;
  const encodedQuery = encodeURIComponent(searchQuery);
  const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1&addressdetails=1&countrycodes=${getCountryCode(company.country)}`;
  
  try {
    console.log(`🔍 Geocoding: ${company.name} (${company.country})`);
    
    const response = await makeRequest(url);
    
    if (response && response.length > 0) {
      const result = response[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        accuracy: result.importance || 0,
        address: result.display_name || '',
        source: 'nominatim'
      };
    } else {
      console.log(`⚠️  No results for: ${company.name}`);
      return getFallbackCoordinates(company.country);
    }
  } catch (error) {
    console.error(`❌ Error geocoding ${company.name}: ${error.message}`);
    return getFallbackCoordinates(company.country);
  }
}

/**
 * Get fallback coordinates for a country
 */
function getFallbackCoordinates(country) {
  const coords = COUNTRY_COORDINATES[country];
  if (coords) {
    console.log(`📍 Using fallback coordinates for ${country}: ${coords.lat}, ${coords.lng}`);
    return {
      lat: coords.lat,
      lng: coords.lng,
      accuracy: 0.1,
      address: `${coords.capital}, ${country}`,
      source: 'fallback'
    };
  }
  
  // Default to center of Europe if country not found
  return {
    lat: 48.8566,
    lng: 2.3522,
    accuracy: 0.1,
    address: 'Europe',
    source: 'default'
  };
}

/**
 * Get ISO country code for Nominatim API
 */
function getCountryCode(country) {
  const countryCodes = {
    'France': 'fr',
    'Germany': 'de',
    'Switzerland': 'ch',
    'Italy': 'it',
    'Luxembourg': 'lu',
    'Austria': 'at',
    'Belgium': 'be'
  };
  return countryCodes[country] || '';
}

/**
 * Main geocoding function
 */
async function geocodeAllCompanies() {
  try {
    console.log('🚀 Starting geocoding process...');
    
    // Read companies data
    const companiesData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    console.log(`📊 Found ${companiesData.length} companies to geocode`);
    
    const enhancedCompanies = [];
    const geocodingLog = {
      timestamp: new Date().toISOString(),
      totalCompanies: companiesData.length,
      successful: 0,
      fallback: 0,
      errors: 0,
      details: []
    };
    
    // Process companies with rate limiting
    for (let i = 0; i < companiesData.length; i++) {
      const company = companiesData[i];
      console.log(`\n[${i + 1}/${companiesData.length}] Processing: ${company.name}`);
      
      try {
        const coordinates = await geocodeCompany(company);
        
        // Add coordinates to company data
        const enhancedCompany = {
          ...company,
          coordinates: coordinates
        };
        
        enhancedCompanies.push(enhancedCompany);
        
        // Log the result
        const logEntry = {
          company: company.name,
          country: company.country,
          coordinates: coordinates,
          timestamp: new Date().toISOString()
        };
        
        geocodingLog.details.push(logEntry);
        
        if (coordinates.source === 'nominatim') {
          geocodingLog.successful++;
        } else {
          geocodingLog.fallback++;
        }
        
        // Rate limiting delay
        if (i < companiesData.length - 1) {
          console.log(`⏳ Waiting ${DELAY_BETWEEN_REQUESTS}ms before next request...`);
          await sleep(DELAY_BETWEEN_REQUESTS);
        }
        
      } catch (error) {
        console.error(`❌ Failed to process ${company.name}: ${error.message}`);
        geocodingLog.errors++;
        
        // Add company with fallback coordinates
        const fallbackCoords = getFallbackCoordinates(company.country);
        const enhancedCompany = {
          ...company,
          coordinates: fallbackCoords
        };
        enhancedCompanies.push(enhancedCompany);
      }
    }
    
    // Save enhanced companies data
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enhancedCompanies, null, 2));
    console.log(`\n💾 Enhanced companies data saved to: ${OUTPUT_FILE}`);
    
    // Save geocoding log
    fs.writeFileSync(LOG_FILE, JSON.stringify(geocodingLog, null, 2));
    console.log(`📝 Geocoding log saved to: ${LOG_FILE}`);
    
    // Print summary
    console.log('\n🎉 Geocoding completed successfully!');
    console.log(`✅ Successful geocoding: ${geocodingLog.successful}`);
    console.log(`📍 Fallback coordinates: ${geocodingLog.fallback}`);
    console.log(`❌ Errors: ${geocodingLog.errors}`);
    console.log(`📊 Total processed: ${enhancedCompanies.length}`);
    
    // Create summary statistics
    const summary = {
      totalCompanies: enhancedCompanies.length,
      countriesWithCoordinates: [...new Set(enhancedCompanies.map(c => c.country))].length,
      averageAccuracy: enhancedCompanies.reduce((sum, c) => sum + c.coordinates.accuracy, 0) / enhancedCompanies.length,
      geocodingStats: geocodingLog
    };
    
    const summaryFile = path.join(__dirname, '../../data/structured/geocoding-summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    console.log(`📊 Summary statistics saved to: ${summaryFile}`);
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  geocodeAllCompanies();
}

module.exports = { geocodeAllCompanies, geocodeCompany };

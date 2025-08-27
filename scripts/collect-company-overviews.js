/**
 * Company Overview Data Collection Script
 * Fetches company descriptions and business overviews from free APIs
 * for all 325 companies in the waste intelligence platform
 */

const fs = require('fs');
const path = require('path');

// Configuration for free APIs
const CONFIG = {
  SEC_EDGAR_BASE: 'https://data.sec.gov/api/xbrl/companyfacts',
  FMP_BASE: 'https://financialmodelingprep.com/api/v3/profile',
  OPENCORPORATES_BASE: 'https://api.opencorporates.com/v0.4/companies/search',
  RATE_LIMIT_DELAY: 120, // 120ms = ~8 req/sec (under SEC's 10 req/sec limit)
  OUTPUT_FILE: '../data/structured/company-overviews.json',
  INPUT_FILE: '../data/structured/company-profiles.json'
};

class CompanyOverviewCollector {
  constructor() {
    this.results = [];
    this.errors = [];
    this.processed = 0;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Fetch from SEC EDGAR API (completely free)
  async fetchFromSEC(ticker, cik = null) {
    try {
      // If we have CIK, use it directly
      if (cik) {
        const paddedCik = cik.toString().padStart(10, '0');
        const url = `${CONFIG.SEC_EDGAR_BASE}/CIK${paddedCik}.json`;
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Waste Intelligence Platform team@wasteintelligence.com'
          }
        });

        if (response.ok) {
          const data = await response.json();
          return {
            source: 'SEC',
            description: data.description || null,
            business: data.entityName || null,
            sic: data.sic || null,
            sicDescription: data.sicDescription || null,
            website: data.website || null
          };
        }
      }
      
      // TODO: Implement ticker-to-CIK lookup if needed
      return null;
    } catch (error) {
      console.error(`SEC API error for ${ticker}:`, error.message);
      return null;
    }
  }

  // Fetch from Financial Modeling Prep (free tier)
  async fetchFromFMP(ticker) {
    try {
      const url = `${CONFIG.FMP_BASE}/${ticker}?apikey=demo`; // Demo API key for testing
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const company = data[0];
          return {
            source: 'FMP',
            description: company.description || null,
            business: company.companyName || null,
            industry: company.industry || null,
            sector: company.sector || null,
            website: company.website || null,
            ceo: company.ceo || null,
            headquarters: company.address || null
          };
        }
      }
      return null;
    } catch (error) {
      console.error(`FMP API error for ${ticker}:`, error.message);
      return null;
    }
  }

  // Fetch from OpenCorporates (free with limits)
  async fetchFromOpenCorporates(companyName, country) {
    try {
      const query = encodeURIComponent(companyName);
      const jurisdiction = this.mapCountryToJurisdiction(country);
      const url = `${CONFIG.OPENCORPORATES_BASE}?q=${query}&jurisdiction_code=${jurisdiction}&format=json`;
      
      // Note: Requires API key for actual use
      // const response = await fetch(url + '&api_token=YOUR_API_TOKEN');
      
      // For now, return null since we need API key
      return null;
    } catch (error) {
      console.error(`OpenCorporates API error for ${companyName}:`, error.message);
      return null;
    }
  }

  mapCountryToJurisdiction(country) {
    const mapping = {
      'United States': 'us',
      'Germany': 'de',
      'France': 'fr',
      'United Kingdom': 'gb',
      'Canada': 'ca',
      // Add more mappings as needed
    };
    return mapping[country] || 'us';
  }

  async processCompany(company) {
    console.log(`Processing ${company.name} (${this.processed + 1}/325)...`);
    
    const result = {
      company_id: company.id,
      company_name: company.name,
      ticker: company.ticker,
      country: company.country,
      sector: company.sector,
      enhanced_overview: null,
      business_overview: null,
      source: null,
      last_updated: new Date().toISOString()
    };

    // Try SEC EDGAR first (if we can identify ticker/CIK)
    let apiData = null;
    
    // Try Financial Modeling Prep with demo key
    if (!apiData && company.ticker) {
      apiData = await this.fetchFromFMP(company.ticker);
    }

    // Try SEC EDGAR if we have better company identification
    if (!apiData) {
      apiData = await this.fetchFromSEC(company.ticker || company.name);
    }

    if (apiData) {
      result.enhanced_overview = apiData.description;
      result.business_overview = apiData.business;
      result.source = apiData.source;
    }

    this.results.push(result);
    this.processed++;

    // Rate limiting
    await this.delay(CONFIG.RATE_LIMIT_DELAY);

    return result;
  }

  async loadCompanies() {
    try {
      // Load from the companies.json file which has our 325 companies
      const inputPath = path.resolve(__dirname, '../data/structured/companies.json');
      const data = fs.readFileSync(inputPath, 'utf8');
      const companies = JSON.parse(data);
      
      console.log(`Loaded ${companies.length} companies from companies.json`);
      return companies;
    } catch (error) {
      console.error('Error loading company data:', error.message);
      throw error;
    }
  }

  async saveResults() {
    try {
      const outputPath = path.resolve(__dirname, CONFIG.OUTPUT_FILE);
      fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
      console.log(`Results saved to ${outputPath}`);
    } catch (error) {
      console.error('Error saving results:', error.message);
      throw error;
    }
  }

  async run() {
    console.log('Starting company overview collection...');
    console.log('Using free APIs: SEC EDGAR, Financial Modeling Prep');
    
    try {
      const companies = await this.loadCompanies();
      console.log(`Found ${companies.length} companies to process`);
      
      // Process companies in batches to respect rate limits
      const batchSize = 10;
      for (let i = 0; i < companies.length; i += batchSize) {
        const batch = companies.slice(i, i + batchSize);
        
        console.log(`\nProcessing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(companies.length/batchSize)}`);
        
        const batchPromises = batch.map(company => this.processCompany(company));
        await Promise.all(batchPromises);
        
        // Longer delay between batches
        if (i + batchSize < companies.length) {
          console.log('Waiting between batches...');
          await this.delay(2000);
        }
      }

      await this.saveResults();
      
      console.log('\n=== Collection Summary ===');
      console.log(`Total processed: ${this.processed}`);
      console.log(`Successfully enhanced: ${this.results.filter(r => r.enhanced_overview).length}`);
      console.log(`No data found: ${this.results.filter(r => !r.enhanced_overview).length}`);
      
      if (this.errors.length > 0) {
        console.log(`Errors encountered: ${this.errors.length}`);
      }
      
    } catch (error) {
      console.error('Collection failed:', error.message);
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const collector = new CompanyOverviewCollector();
  collector.run().catch(console.error);
}

module.exports = CompanyOverviewCollector;
/**
 * Enhanced Company Overview Collector
 * Uses multiple free APIs to collect company overviews for European and international companies
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  // APIs that work well with European companies
  YAHOO_FINANCE_BASE: 'https://query1.finance.yahoo.com/v1/finance/search',
  ALPHA_VANTAGE_BASE: 'https://www.alphavantage.co/query',
  FMP_BASE: 'https://financialmodelingprep.com/api/v3/profile',
  
  // Wikipedia/DBpedia for company information
  WIKIPEDIA_API: 'https://en.wikipedia.org/api/rest_v1/page/summary',
  
  RATE_LIMIT_DELAY: 200, // 200ms between requests
  OUTPUT_FILE: '../data/structured/company-overviews-enhanced.json',
  BATCH_SIZE: 5 // Smaller batches for better success rate
};

class EnhancedCompanyOverviewCollector {
  constructor() {
    this.results = [];
    this.errors = [];
    this.processed = 0;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Try to get company overview from Yahoo Finance search
  async fetchFromYahooFinance(ticker, companyName) {
    try {
      const query = encodeURIComponent(ticker || companyName);
      const url = `${CONFIG.YAHOO_FINANCE_BASE}?q=${query}&quotesCount=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WasteIntelligencePlatform/1.0)'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.quotes && data.quotes.length > 0) {
          const quote = data.quotes[0];
          return {
            source: 'Yahoo Finance',
            description: quote.longName || quote.shortName,
            business: quote.industry || null,
            sector: quote.sector || null,
            exchange: quote.exchange || null
          };
        }
      }
      return null;
    } catch (error) {
      console.error(`Yahoo Finance error for ${ticker}:`, error.message);
      return null;
    }
  }

  // Try Wikipedia for company information
  async fetchFromWikipedia(companyName) {
    try {
      // Clean company name for Wikipedia search
      const cleanName = companyName
        .replace(/ SA$/, '')
        .replace(/ AG$/, '')
        .replace(/ SE$/, '')
        .replace(/ SpA$/, '')
        .replace(/ NV$/, '')
        .replace(/ Ltd$/, '')
        .replace(/ PLC$/, '')
        .replace(/ Group$/, '');
      
      const query = encodeURIComponent(cleanName);
      const url = `${CONFIG.WIKIPEDIA_API}/${query}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'WasteIntelligencePlatform/1.0 (team@wasteintelligence.com)'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.extract && data.extract.length > 50) {
          return {
            source: 'Wikipedia',
            description: data.extract,
            business: data.description || null,
            title: data.title
          };
        }
      }
      return null;
    } catch (error) {
      console.error(`Wikipedia error for ${companyName}:`, error.message);
      return null;
    }
  }

  // Create a comprehensive overview from multiple sources
  async fetchCompanyOverview(company) {
    const strategies = [
      () => this.fetchFromYahooFinance(company.ticker, company.name),
      () => this.fetchFromWikipedia(company.name)
    ];

    for (const strategy of strategies) {
      const result = await strategy();
      if (result && result.description && result.description.length > 50) {
        return result;
      }
      // Small delay between API attempts
      await this.delay(100);
    }

    return null;
  }

  // Generate a basic overview if no API data is available
  generateFallbackOverview(company) {
    const templates = {
      'Technology': `${company.name} is a technology company based in ${company.country}, operating in the ${company.industry} sector. The company specializes in innovative solutions and has ${company.employees?.toLocaleString() || 'a significant number of'} employees.`,
      
      'Healthcare': `${company.name} is a healthcare company headquartered in ${company.country}, focused on ${company.industry}. With ${company.employees?.toLocaleString() || 'a substantial'} workforce, the company contributes to advancing medical solutions and patient care.`,
      
      'Industrials': `${company.name} is an industrial company based in ${company.country}, specializing in ${company.industry}. The company operates with ${company.employees?.toLocaleString() || 'a large team of'} employees and serves global markets.`,
      
      'Consumer Discretionary': `${company.name} is a consumer-focused company in ${company.country}, operating in the ${company.industry} space. The company employs ${company.employees?.toLocaleString() || 'thousands of'} people and serves consumer markets.`,
      
      'Financial Services': `${company.name} is a financial services company based in ${company.country}, providing ${company.industry} solutions. With ${company.employees?.toLocaleString() || 'a dedicated team of'} employees, the company serves clients across multiple markets.`,
      
      'Energy': `${company.name} is an energy company headquartered in ${company.country}, focused on ${company.industry}. The company has ${company.employees?.toLocaleString() || 'a significant'} workforce dedicated to energy solutions.`,
      
      'Materials': `${company.name} is a materials company based in ${company.country}, specializing in ${company.industry}. With ${company.employees?.toLocaleString() || 'numerous'} employees, the company produces essential materials for various industries.`
    };

    const template = templates[company.sector] || templates['Industrials'];
    
    return {
      source: 'Generated',
      description: template,
      business: `A ${company.sector.toLowerCase()} company operating in ${company.industry} based in ${company.country}.`
    };
  }

  async processCompany(company) {
    console.log(`Processing ${company.name} (${this.processed + 1}/325)...`);
    
    const result = {
      company_id: company.id,
      company_name: company.name,
      ticker: company.ticker,
      country: company.country,
      sector: company.sector,
      industry: company.industry,
      enhanced_overview: null,
      business_overview: null,
      source: null,
      last_updated: new Date().toISOString()
    };

    try {
      // Try to get real data from APIs
      let apiData = await this.fetchCompanyOverview(company);
      
      // If no API data, generate a professional fallback
      if (!apiData) {
        apiData = this.generateFallbackOverview(company);
      }

      result.enhanced_overview = apiData.description;
      result.business_overview = apiData.business || `${company.name} operates in the ${company.industry} sector, providing specialized services and solutions from its base in ${company.country}.`;
      result.source = apiData.source;

    } catch (error) {
      console.error(`Error processing ${company.name}:`, error.message);
      this.errors.push({ company: company.name, error: error.message });
      
      // Still generate fallback for failed companies
      const fallback = this.generateFallbackOverview(company);
      result.enhanced_overview = fallback.description;
      result.business_overview = fallback.business;
      result.source = 'Generated';
    }

    this.results.push(result);
    this.processed++;

    // Rate limiting
    await this.delay(CONFIG.RATE_LIMIT_DELAY);
    return result;
  }

  async loadCompanies() {
    try {
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
      
      // Also create a summary report
      const summaryPath = path.resolve(__dirname, '../data/structured/overview-collection-summary.json');
      const summary = {
        total_processed: this.processed,
        api_successes: this.results.filter(r => r.source && r.source !== 'Generated').length,
        fallback_generated: this.results.filter(r => r.source === 'Generated').length,
        errors: this.errors.length,
        collection_date: new Date().toISOString(),
        sources_used: [...new Set(this.results.map(r => r.source).filter(Boolean))]
      };
      
      fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
      
      console.log(`Results saved to ${outputPath}`);
      console.log(`Summary saved to ${summaryPath}`);
    } catch (error) {
      console.error('Error saving results:', error.message);
      throw error;
    }
  }

  async run() {
    console.log('Starting enhanced company overview collection...');
    console.log('Using: Yahoo Finance, Wikipedia, and intelligent fallbacks');
    
    try {
      const companies = await this.loadCompanies();
      console.log(`Found ${companies.length} companies to process`);
      
      // Process in smaller batches for better reliability
      for (let i = 0; i < companies.length; i += CONFIG.BATCH_SIZE) {
        const batch = companies.slice(i, i + CONFIG.BATCH_SIZE);
        
        console.log(`\nProcessing batch ${Math.floor(i/CONFIG.BATCH_SIZE) + 1}/${Math.ceil(companies.length/CONFIG.BATCH_SIZE)}`);
        
        // Process batch sequentially to avoid overwhelming APIs
        for (const company of batch) {
          await this.processCompany(company);
        }
        
        // Delay between batches
        if (i + CONFIG.BATCH_SIZE < companies.length) {
          await this.delay(1000);
        }
      }

      await this.saveResults();
      
      console.log('\n=== Enhanced Collection Summary ===');
      console.log(`Total processed: ${this.processed}`);
      console.log(`API data retrieved: ${this.results.filter(r => r.source && r.source !== 'Generated').length}`);
      console.log(`Intelligent fallbacks: ${this.results.filter(r => r.source === 'Generated').length}`);
      
      if (this.errors.length > 0) {
        console.log(`Errors encountered: ${this.errors.length}`);
        this.errors.forEach(err => console.log(`  - ${err.company}: ${err.error}`));
      }
      
    } catch (error) {
      console.error('Collection failed:', error.message);
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const collector = new EnhancedCompanyOverviewCollector();
  collector.run().catch(console.error);
}

module.exports = EnhancedCompanyOverviewCollector;
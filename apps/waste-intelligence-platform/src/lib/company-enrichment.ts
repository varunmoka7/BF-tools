/**
 * Enhanced Company Enrichment Service
 * Fetches real company data from multiple APIs and web scraping to create comprehensive overviews
 */

import { webScrapingService, ScrapedCompanyData } from './web-scraper'

interface CompanyEnrichmentData {
  description: string
  industry: string
  founded: string | null
  website: string | null
  headquarters: string | null
  size: string | null
  source: string
  confidence?: number
  ceo?: string | null
  revenue?: string | null
  linkedin?: string | null
  logo?: string | null
}

interface CompaniesHouseData {
  company_name: string
  company_status: string
  company_type: string
  date_of_creation: string
  registered_office_address: {
    locality: string
    country: string
  }
  sic_codes: Array<{
    description: string
  }>
}

interface OpenCorporatesData {
  name: string
  company_type: string
  incorporation_date: string
  registered_address: {
    locality: string
    country: string
  }
  industry_codes: Array<{
    description: string
  }>
}

interface AlphaVantageData {
  Symbol: string
  Name: string
  Description: string
  Country: string
  Sector: string
  Industry: string
  Address: string
  FullTimeEmployees: string
}

class CompanyEnrichmentService {
  private readonly ALPHA_VANTAGE_API = 'https://www.alphavantage.co/query'
  private readonly COMPANIES_HOUSE_API = 'https://api.company-information.service.gov.uk'
  private readonly OPENCORPORATES_API = 'https://api.opencorporates.com/v0.4'
  private readonly CLEARBIT_API = 'https://company.clearbit.com/v2'

  /**
   * Main method to enrich company data with web scraping
   */
  async enrichCompanyData(
    companyName: string,
    country: string,
    registrationNumber?: string
  ): Promise<CompanyEnrichmentData | null> {
    try {
      console.log(`🚀 Starting comprehensive enrichment for: ${companyName}`)

      // Try multiple sources in parallel for better performance
      const [
        apiResults,
        scrapedResults
      ] = await Promise.allSettled([
        this.enrichFromAPIs(companyName, country, registrationNumber),
        webScrapingService.scrapeCompanyData(companyName, country)
      ])

      // Combine API and scraped data
      const apiData = apiResults.status === 'fulfilled' ? apiResults.value : null
      const scrapedData = scrapedResults.status === 'fulfilled' ? scrapedResults.value : null

      // Merge data intelligently
      const enrichedData = this.mergeEnrichmentData(apiData, scrapedData, companyName, country)

      console.log(`✅ Enrichment completed for ${companyName}`)
      return enrichedData

    } catch (error) {
      console.error('Company enrichment failed:', error)
      return this.generateFallbackDescription(companyName, country)
    }
  }

  /**
   * Try enrichment from traditional APIs
   */
  private async enrichFromAPIs(
    companyName: string,
    country: string,
    registrationNumber?: string
  ): Promise<CompanyEnrichmentData | null> {
    // Try multiple sources in order of preference
    const enrichmentAttempts = [
      () => this.tryAlphaVantage(companyName),
      () => this.tryCompaniesHouse(companyName, registrationNumber),
      () => this.tryOpenCorporates(companyName, country),
      () => this.tryClearbit(companyName)
    ]

    for (const attempt of enrichmentAttempts) {
      const result = await attempt()
      if (result) {
        return result
      }
    }

    return null
  }

  /**
   * Intelligently merge API and scraped data
   */
  private mergeEnrichmentData(
    apiData: CompanyEnrichmentData | null,
    scrapedData: ScrapedCompanyData | null,
    companyName: string,
    country: string
  ): CompanyEnrichmentData {
    // If we have high-quality API data, use it as base
    if (apiData && apiData.source !== 'Generated') {
      console.log(`📊 Using API data as primary source for ${companyName}`)

      // Enhance with scraped data where API data is missing
      if (scrapedData) {
        return {
          ...apiData,
          description: apiData.description || scrapedData.description,
          website: apiData.website || scrapedData.website,
          ceo: scrapedData.ceo,
          revenue: scrapedData.revenue,
          linkedin: scrapedData.linkedin,
          logo: scrapedData.logo,
          confidence: Math.max(apiData.confidence || 0.7, scrapedData.confidence),
          source: `${apiData.source} + Web Scraping`
        }
      }

      return apiData
    }

    // If we have good scraped data, use it
    if (scrapedData && scrapedData.confidence > 0.5) {
      console.log(`🌐 Using scraped data as primary source for ${companyName}`)

      return {
        description: scrapedData.description,
        industry: scrapedData.industry || 'Business Services',
        founded: scrapedData.founded,
        website: scrapedData.website,
        headquarters: scrapedData.headquarters,
        size: scrapedData.employees,
        source: scrapedData.source,
        confidence: scrapedData.confidence,
        ceo: scrapedData.ceo,
        revenue: scrapedData.revenue,
        linkedin: scrapedData.linkedin,
        logo: scrapedData.logo
      }
    }

    // Fall back to generated description with any available scraped info
    console.log(`📝 Using fallback description for ${companyName}`)
    const fallback = this.generateFallbackDescription(companyName, country)

    if (scrapedData) {
      fallback.website = scrapedData.website || fallback.website
      fallback.linkedin = scrapedData.linkedin
      fallback.source = `${fallback.source} + Partial Web Data`
    }

    return fallback
  }

  /**
   * Try Alpha Vantage API (Public companies)
   */
  private async tryAlphaVantage(companyName: string): Promise<CompanyEnrichmentData | null> {
    try {
      // First try to find the stock symbol by company name
      const searchUrl = `${this.ALPHA_VANTAGE_API}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(companyName)}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`

      const searchResponse = await fetch(searchUrl)
      if (!searchResponse.ok) return null

      const searchData = await searchResponse.json()
      const matches = searchData.bestMatches

      if (!matches || matches.length === 0) return null

      const symbol = matches[0]['1. symbol']

      // Add rate limiting (5 calls per minute)
      await new Promise(resolve => setTimeout(resolve, 12000))

      // Get company overview
      const overviewUrl = `${this.ALPHA_VANTAGE_API}?function=OVERVIEW&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`

      const overviewResponse = await fetch(overviewUrl)
      if (!overviewResponse.ok) return null

      const companyData: AlphaVantageData = await overviewResponse.json()

      if (!companyData.Name) return null

      return {
        description: companyData.Description || this.generateDescriptionFromAlphaVantage(companyData),
        industry: companyData.Industry || companyData.Sector || 'Unknown',
        founded: null,
        website: null,
        headquarters: companyData.Address || companyData.Country,
        size: companyData.FullTimeEmployees ? `${companyData.FullTimeEmployees} employees` : null,
        source: 'Alpha Vantage'
      }
    } catch (error) {
      console.error('Alpha Vantage API error:', error)
      return null
    }
  }

  /**
   * Try Companies House API (UK companies)
   */
  private async tryCompaniesHouse(
    companyName: string,
    registrationNumber?: string
  ): Promise<CompanyEnrichmentData | null> {
    try {
      if (!registrationNumber && !companyName.includes('UK')) return null

      const searchUrl = `${this.COMPANIES_HOUSE_API}/search/companies?q=${encodeURIComponent(companyName)}`

      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Basic ${btoa(process.env.COMPANIES_HOUSE_API_KEY + ':')}`
        }
      })

      if (!response.ok) return null

      const searchData = await response.json()
      const company = searchData.items?.[0]

      if (!company) return null

      // Get detailed company data
      const detailUrl = `${this.COMPANIES_HOUSE_API}/company/${company.company_number}`
      const detailResponse = await fetch(detailUrl, {
        headers: {
          'Authorization': `Basic ${btoa(process.env.COMPANIES_HOUSE_API_KEY + ':')}`
        }
      })

      if (!detailResponse.ok) return null

      const companyData: CompaniesHouseData = await detailResponse.json()

      return {
        description: this.generateDescriptionFromCompaniesHouse(companyData),
        industry: companyData.sic_codes?.[0]?.description || 'Unknown',
        founded: companyData.date_of_creation || null,
        website: null,
        headquarters: `${companyData.registered_office_address.locality}, ${companyData.registered_office_address.country}`,
        size: null,
        source: 'Companies House'
      }
    } catch (error) {
      console.error('Companies House API error:', error)
      return null
    }
  }

  /**
   * Try OpenCorporates API (Global)
   */
  private async tryOpenCorporates(
    companyName: string,
    country: string
  ): Promise<CompanyEnrichmentData | null> {
    try {
      const searchUrl = `${this.OPENCORPORATES_API}/companies/search?q=${encodeURIComponent(companyName)}&country_code=${country.toLowerCase()}&format=json`

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Waste Intelligence Platform/1.0'
        }
      })

      if (!response.ok) return null

      const data = await response.json()
      const company = data.results?.companies?.[0]?.company

      if (!company) return null

      return {
        description: this.generateDescriptionFromOpenCorporates(company),
        industry: company.industry_codes?.[0]?.description || 'Unknown',
        founded: company.incorporation_date || null,
        website: null,
        headquarters: `${company.registered_address?.locality}, ${company.registered_address?.country}`,
        size: null,
        source: 'OpenCorporates'
      }
    } catch (error) {
      console.error('OpenCorporates API error:', error)
      return null
    }
  }

  /**
   * Try Clearbit API
   */
  private async tryClearbit(companyName: string): Promise<CompanyEnrichmentData | null> {
    try {
      // This requires a company domain, which we might not have
      // Could be enhanced to guess domain or find domain first
      return null
    } catch (error) {
      console.error('Clearbit API error:', error)
      return null
    }
  }

  /**
   * Generate professional description from Alpha Vantage data
   */
  private generateDescriptionFromAlphaVantage(data: AlphaVantageData): string {
    const industry = data.Industry || data.Sector || 'business operations'
    const location = data.Country || 'its primary market'
    const size = data.FullTimeEmployees ? ` with ${data.FullTimeEmployees} employees` : ''

    return `${data.Name} is a publicly traded company operating in ${industry.toLowerCase()}${size}. The company is headquartered in ${location} and maintains compliance with public market regulations.`
  }

  /**
   * Generate professional description from Companies House data
   */
  private generateDescriptionFromCompaniesHouse(data: CompaniesHouseData): string {
    const industry = data.sic_codes?.[0]?.description || 'business operations'
    const location = data.registered_office_address.locality
    const founded = data.date_of_creation ? new Date(data.date_of_creation).getFullYear() : null

    return `${data.company_name} is a ${data.company_status.toLowerCase()} ${data.company_type.toLowerCase()} specializing in ${industry.toLowerCase()}. ${founded ? `Established in ${founded}, the` : 'The'} company is headquartered in ${location} and operates under UK corporate governance standards.`
  }

  /**
   * Generate professional description from OpenCorporates data
   */
  private generateDescriptionFromOpenCorporates(data: any): string {
    const industry = data.industry_codes?.[0]?.description || 'business operations'
    const location = data.registered_address?.locality || 'its registered location'
    const founded = data.incorporation_date ? new Date(data.incorporation_date).getFullYear() : null

    return `${data.name} is a registered ${data.company_type?.toLowerCase() || 'company'} engaged in ${industry.toLowerCase()}. ${founded ? `Incorporated in ${founded}, the` : 'The'} organization is based in ${location} and maintains corporate compliance in its jurisdiction.`
  }

  /**
   * Generate fallback description when APIs fail
   */
  private generateFallbackDescription(companyName: string, country: string): CompanyEnrichmentData {
    return {
      description: `${companyName} is a business entity operating in ${country}. The company is engaged in commercial activities within its sector and maintains operations in accordance with local regulatory requirements.`,
      industry: 'Business Services',
      founded: null,
      website: null,
      headquarters: country,
      size: null,
      source: 'Generated'
    }
  }
}

export const companyEnrichmentService = new CompanyEnrichmentService()
export type { CompanyEnrichmentData }
/**
 * Enhanced Web Scraping Service for Company Data Collection
 * Gathers comprehensive company information from multiple sources
 */

import { JSDOM } from 'jsdom'

interface ScrapedCompanyData {
  name: string
  description: string
  industry: string
  founded?: string
  website?: string
  headquarters?: string
  employees?: string
  revenue?: string
  ceo?: string
  linkedin?: string
  logo?: string
  type?: string
  source: string
  confidence: number
}

interface ScrapeSource {
  name: string
  url: string
  priority: number
  selectors: {
    description?: string
    industry?: string
    founded?: string
    headquarters?: string
    employees?: string
    revenue?: string
    ceo?: string
    website?: string
  }
}

class WebScrapingService {
  private readonly sources: ScrapeSource[] = [
    {
      name: 'Google Business',
      url: 'https://www.google.com/search?q=',
      priority: 1,
      selectors: {
        description: '.kno-rdesc span, .hgKElc',
        industry: '.Z1hOCe',
        headquarters: '.LrzXr',
        website: '.zOVa8'
      }
    },
    {
      name: 'Wikipedia',
      url: 'https://en.wikipedia.org/wiki/',
      priority: 2,
      selectors: {
        description: '.mw-parser-output > p:first-of-type',
        industry: '.infobox .industry',
        founded: '.infobox .founded',
        headquarters: '.infobox .headquarters'
      }
    },
    {
      name: 'Bloomberg',
      url: 'https://www.bloomberg.com/profile/company/',
      priority: 3,
      selectors: {
        description: '.company-description',
        industry: '.company-industry',
        employees: '.company-employees'
      }
    }
  ]

  /**
   * Main method to scrape comprehensive company data
   */
  async scrapeCompanyData(
    companyName: string,
    country?: string,
    website?: string
  ): Promise<ScrapedCompanyData | null> {
    try {
      console.log(`🔍 Starting comprehensive scrape for: ${companyName}`)

      // Try multiple approaches in parallel
      const [
        googleResult,
        wikipediaResult,
        websiteResult,
        linkedinResult
      ] = await Promise.allSettled([
        this.scrapeFromGoogle(companyName, country),
        this.scrapeFromWikipedia(companyName),
        website ? this.scrapeFromWebsite(website) : null,
        this.scrapeFromLinkedIn(companyName)
      ])

      // Combine results with priority ranking
      const results = [
        googleResult.status === 'fulfilled' ? googleResult.value : null,
        wikipediaResult.status === 'fulfilled' ? wikipediaResult.value : null,
        websiteResult.status === 'fulfilled' ? websiteResult.value : null,
        linkedinResult.status === 'fulfilled' ? linkedinResult.value : null
      ].filter(Boolean) as ScrapedCompanyData[]

      if (results.length === 0) {
        console.log(`❌ No data found for ${companyName}`)
        return null
      }

      // Merge and prioritize data
      const mergedData = this.mergeCompanyData(results, companyName)
      console.log(`✅ Successfully scraped data for ${companyName}`)

      return mergedData

    } catch (error) {
      console.error(`❌ Error scraping ${companyName}:`, error)
      return null
    }
  }

  /**
   * Scrape from Google Knowledge Graph
   */
  private async scrapeFromGoogle(
    companyName: string,
    country?: string
  ): Promise<ScrapedCompanyData | null> {
    try {
      const query = encodeURIComponent(`${companyName} ${country || ''} company`)
      const url = `https://www.google.com/search?q=${query}&gl=us&hl=en`

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      if (!response.ok) return null

      const html = await response.text()
      const dom = new JSDOM(html)
      const document = dom.window.document

      // Extract knowledge panel data
      const description = this.extractText(document, '.kno-rdesc span, .hgKElc, .V6llnf')
      const industry = this.extractText(document, '.Z1hOCe, .w8qArf')
      const headquarters = this.extractText(document, '.LrzXr')
      const founded = this.extractText(document, '.zloOqf')
      const website = this.extractAttribute(document, 'a[data-ved]', 'href')

      if (!description && !industry) return null

      return {
        name: companyName,
        description: description || `${companyName} is a company operating in the business sector.`,
        industry: industry || 'Business Services',
        founded,
        headquarters,
        website: website?.includes('http') ? website : undefined,
        source: 'Google Knowledge Graph',
        confidence: description ? 0.8 : 0.5
      }

    } catch (error) {
      console.error('Google scraping error:', error)
      return null
    }
  }

  /**
   * Scrape from Wikipedia
   */
  private async scrapeFromWikipedia(companyName: string): Promise<ScrapedCompanyData | null> {
    try {
      // Search for Wikipedia page
      const searchQuery = encodeURIComponent(companyName.replace(/\s+(AG|SA|SpA|SE|NV|Ltd|Inc|Corp|GmbH|PLC)$/i, ''))
      const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${searchQuery}`

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'WasteIntelligencePlatform/1.0 (https://waste-intelligence.com)'
        }
      })

      if (!response.ok) return null

      const data = await response.json()

      if (data.type !== 'standard' || !data.extract) return null

      return {
        name: companyName,
        description: data.extract,
        industry: 'Unknown',
        website: data.content_urls?.desktop?.page,
        source: 'Wikipedia',
        confidence: 0.7
      }

    } catch (error) {
      console.error('Wikipedia scraping error:', error)
      return null
    }
  }

  /**
   * Scrape from company website
   */
  private async scrapeFromWebsite(websiteUrl: string): Promise<ScrapedCompanyData | null> {
    try {
      const response = await fetch(websiteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WasteIntelligencePlatform/1.0)'
        }
      })

      if (!response.ok) return null

      const html = await response.text()
      const dom = new JSDOM(html)
      const document = dom.window.document

      // Extract meta description
      const metaDescription = this.extractAttribute(document, 'meta[name="description"]', 'content')
      const ogDescription = this.extractAttribute(document, 'meta[property="og:description"]', 'content')

      // Look for about sections
      const aboutText = this.extractText(document, '.about, #about, [class*="about"], .company-description, .overview')

      const description = metaDescription || ogDescription || aboutText

      if (!description) return null

      return {
        name: '',
        description,
        industry: 'Unknown',
        website: websiteUrl,
        source: 'Company Website',
        confidence: 0.6
      }

    } catch (error) {
      console.error('Website scraping error:', error)
      return null
    }
  }

  /**
   * Scrape from LinkedIn (limited due to authentication)
   */
  private async scrapeFromLinkedIn(companyName: string): Promise<ScrapedCompanyData | null> {
    try {
      // LinkedIn requires authentication, so we'll use a public search approach
      const query = encodeURIComponent(`${companyName} site:linkedin.com/company`)
      const url = `https://www.google.com/search?q=${query}`

      // This would require more sophisticated handling
      // For now, return null but structure is ready for future implementation
      return null

    } catch (error) {
      console.error('LinkedIn scraping error:', error)
      return null
    }
  }

  /**
   * Merge data from multiple sources with intelligent prioritization
   */
  private mergeCompanyData(results: ScrapedCompanyData[], companyName: string): ScrapedCompanyData {
    // Sort by confidence score
    results.sort((a, b) => b.confidence - a.confidence)

    const merged: ScrapedCompanyData = {
      name: companyName,
      description: '',
      industry: 'Business Services',
      source: 'Multiple Sources',
      confidence: 0
    }

    // Merge data with priority to higher confidence sources
    for (const result of results) {
      if (!merged.description && result.description) {
        merged.description = result.description
      }
      if (!merged.industry || merged.industry === 'Business Services' || merged.industry === 'Unknown') {
        if (result.industry && result.industry !== 'Unknown') {
          merged.industry = result.industry
        }
      }
      if (!merged.founded && result.founded) {
        merged.founded = result.founded
      }
      if (!merged.headquarters && result.headquarters) {
        merged.headquarters = result.headquarters
      }
      if (!merged.employees && result.employees) {
        merged.employees = result.employees
      }
      if (!merged.website && result.website) {
        merged.website = result.website
      }
      if (!merged.linkedin && result.linkedin) {
        merged.linkedin = result.linkedin
      }
    }

    // Calculate overall confidence
    merged.confidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length

    // Ensure we have at least a basic description
    if (!merged.description) {
      merged.description = `${companyName} is a business entity engaged in commercial operations within its industry sector.`
      merged.confidence = Math.max(0.3, merged.confidence)
    }

    // Include source information
    merged.source = results.map(r => r.source).join(', ')

    return merged
  }

  /**
   * Utility method to extract text content
   */
  private extractText(document: Document, selector: string): string | undefined {
    const element = document.querySelector(selector)
    return element?.textContent?.trim() || undefined
  }

  /**
   * Utility method to extract attribute value
   */
  private extractAttribute(document: Document, selector: string, attribute: string): string | undefined {
    const element = document.querySelector(selector)
    return element?.getAttribute(attribute)?.trim() || undefined
  }

  /**
   * Rate limiting helper
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Validate and clean scraped data
   */
  private validateData(data: ScrapedCompanyData): boolean {
    // Basic validation rules
    if (!data.description || data.description.length < 10) return false
    if (data.description.includes('blocked') || data.description.includes('captcha')) return false

    return true
  }
}

export const webScrapingService = new WebScrapingService()
export type { ScrapedCompanyData }
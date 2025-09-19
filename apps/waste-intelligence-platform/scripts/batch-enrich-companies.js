/**
 * Batch Company Enrichment Script
 *
 * This script enriches all companies in the database with real company data
 * Uses Alpha Vantage API with proper rate limiting (5 calls per minute)
 */

const { createClient } = require('@supabase/supabase-js')
const fetch = require('node-fetch')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY

if (!supabaseUrl || !supabaseKey || !alphaVantageKey) {
  console.error('❌ Missing required environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ALPHA_VANTAGE_API_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Rate limiting configuration
const RATE_LIMIT_DELAY = 12000 // 12 seconds between calls (5 per minute)
const MAX_COMPANIES_PER_RUN = 500 // Process all remaining companies

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function enrichCompanyWithAlphaVantage(companyName) {
  try {
    console.log(`🔍 Searching for: ${companyName}`)

    // Search for stock symbol
    const searchUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(companyName)}&apikey=${alphaVantageKey}`
    const searchResponse = await fetch(searchUrl)

    if (!searchResponse.ok) {
      console.log(`❌ Search failed for ${companyName}`)
      return null
    }

    const searchData = await searchResponse.json()
    const matches = searchData.bestMatches

    if (!matches || matches.length === 0) {
      console.log(`❌ No matches found for ${companyName}`)
      return null
    }

    const symbol = matches[0]['1. symbol']
    console.log(`✅ Found symbol: ${symbol} for ${companyName}`)

    // Rate limiting delay
    await sleep(RATE_LIMIT_DELAY)

    // Get company overview
    const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${alphaVantageKey}`
    const overviewResponse = await fetch(overviewUrl)

    if (!overviewResponse.ok) {
      console.log(`❌ Overview failed for ${symbol}`)
      return null
    }

    const companyData = await overviewResponse.json()

    if (!companyData.Name) {
      console.log(`❌ No company data for ${symbol}`)
      return null
    }

    console.log(`🎉 Successfully enriched: ${companyData.Name}`)

    return {
      description: companyData.Description || generateFallbackDescription(companyData),
      industry: companyData.Industry || companyData.Sector || 'Unknown',
      founded: null,
      website: null,
      headquarters: companyData.Address || companyData.Country,
      size: companyData.FullTimeEmployees ? `${companyData.FullTimeEmployees} employees` : null,
      source: 'Alpha Vantage'
    }

  } catch (error) {
    console.error(`❌ Error enriching ${companyName}:`, error.message)
    return null
  }
}

function generateFallbackDescription(companyName, country) {
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

async function enrichAllCompanies() {
  console.log('🚀 Starting batch company enrichment...')
  console.log(`⚡ Rate limit: 1 call per ${RATE_LIMIT_DELAY/1000} seconds`)
  console.log(`📊 Max companies per run: ${MAX_COMPANIES_PER_RUN}`)

  try {
    // Get companies that need business_overview field updated
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, company_name, country, description, business_overview, enrichment_status, last_enriched')
      .not('description', 'is', null)
      .limit(500)

    if (error) {
      console.error('❌ Failed to fetch companies:', error)
      return
    }

    if (!companies || companies.length === 0) {
      console.log('✅ All companies are already enriched!')
      return
    }

    console.log(`📋 Found ${companies.length} companies to enrich`)

    let enriched = 0
    let failed = 0
    let skipped = 0

    for (let i = 0; i < companies.length; i++) {
      const company = companies[i]
      console.log(`\n[${i + 1}/${companies.length}] Processing: ${company.company_name}`)

      // Use existing description if available, otherwise generate new one
      let enrichmentData
      if (company.description && company.description.trim().length > 0) {
        console.log(`📋 Using existing description for ${company.company_name}`)
        enrichmentData = {
          description: company.description,
          industry: 'Business Services',
          founded: null,
          website: null,
          headquarters: company.country,
          size: null,
          source: 'Existing'
        }
        skipped++
      } else {
        // Try Alpha Vantage first
        enrichmentData = await enrichCompanyWithAlphaVantage(company.company_name)

        // If Alpha Vantage fails, use fallback
        if (!enrichmentData) {
          console.log(`📝 Using fallback description for ${company.company_name}`)
          enrichmentData = generateFallbackDescription(company.company_name, company.country)
          skipped++
        } else {
          enriched++
        }
      }

      // Update company in database
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          description: enrichmentData.description,
          business_overview: enrichmentData.description, // Fix: Also update the field the frontend displays
          industry_detail: enrichmentData.industry,
          founded_year: enrichmentData.founded,
          headquarters: enrichmentData.headquarters,
          company_size: enrichmentData.size,
          website_url: enrichmentData.website,
          data_source: enrichmentData.source,
          enrichment_status: 'enriched',
          last_enriched: new Date().toISOString()
        })
        .eq('id', company.id)

      if (updateError) {
        console.error(`❌ Failed to update ${company.company_name}:`, updateError)
        failed++
      } else {
        console.log(`💾 Updated ${company.company_name} in database`)
      }

      // Progress update
      if ((i + 1) % 10 === 0) {
        console.log(`\n📊 Progress: ${i + 1}/${companies.length} companies processed`)
        console.log(`✅ Enriched: ${enriched} | 📝 Generated: ${skipped} | ❌ Failed: ${failed}`)
      }
    }

    console.log('\n🎉 Batch enrichment complete!')
    console.log(`📊 Final Stats:`)
    console.log(`   ✅ Successfully enriched: ${enriched}`)
    console.log(`   📝 Generated descriptions: ${skipped}`)
    console.log(`   ❌ Failed updates: ${failed}`)
    console.log(`   📈 Total processed: ${companies.length}`)

  } catch (error) {
    console.error('❌ Batch enrichment failed:', error)
  }
}

// Run the enrichment
enrichAllCompanies()
  .then(() => {
    console.log('\n✅ Batch enrichment script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
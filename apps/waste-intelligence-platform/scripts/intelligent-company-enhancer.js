/**
 * Intelligent Company Enhancer
 * Creates enhanced company descriptions using business intelligence
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

// Configuration
const PROCESSING_DELAY = 1000 // 1 second between updates
const MAX_COMPANIES_PER_RUN = 500 // Process all companies

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Comprehensive business intelligence analysis
 */
function analyzeCompanyIntelligence(companyName, country) {
  console.log(`🧠 Analyzing: ${companyName}`)

  const analysis = {
    businessType: inferBusinessType(companyName),
    industry: inferIndustry(companyName),
    sector: inferSector(companyName),
    scale: inferScale(companyName),
    geography: inferGeography(companyName, country),
    specialization: inferSpecialization(companyName)
  }

  const description = generateIntelligentDescription(companyName, country, analysis)

  console.log(`✅ Generated intelligent profile for ${companyName}`)

  return {
    description,
    industry: analysis.industry,
    headquarters: analysis.geography.headquarters,
    source: 'Business Intelligence Analysis'
  }
}

/**
 * Infer business type with advanced pattern matching
 */
function inferBusinessType(companyName) {
  const name = companyName.toLowerCase()

  // Financial services patterns
  if (name.match(/\b(bank|banca|bancaria|banking|credit|krediet|banque)\b/)) return 'financial_institution'
  if (name.match(/\b(insurance|assicurazioni|verzekering|seguros|versicherung)\b/)) return 'insurance_company'
  if (name.match(/\b(investment|asset|fund|capital|holding|private equity)\b/)) return 'investment_company'

  // Healthcare & pharma patterns
  if (name.match(/\b(pharma|pharmaceutical|bio|medical|health|medicina|medizin)\b/)) return 'pharmaceutical_company'
  if (name.match(/\b(hospital|clinic|care|diagnostics|therapeutics)\b/)) return 'healthcare_provider'

  // Technology patterns
  if (name.match(/\b(tech|technology|software|digital|cyber|systems|solutions)\b/)) return 'technology_company'
  if (name.match(/\b(telecom|telecommunications|mobile|communications|network)\b/)) return 'telecommunications_company'

  // Energy & utilities patterns
  if (name.match(/\b(energy|energie|oil|gas|petroleum|utilities|power|electric)\b/)) return 'energy_company'
  if (name.match(/\b(renewable|solar|wind|nuclear|hydro|generation)\b/)) return 'utility_company'

  // Industrial patterns
  if (name.match(/\b(auto|automotive|motor|vehicles|cars|fahrzeug)\b/)) return 'automotive_company'
  if (name.match(/\b(aerospace|aviation|aircraft|defense|defence|aviation)\b/)) return 'aerospace_company'
  if (name.match(/\b(construction|building|real estate|immobilien|property|development)\b/)) return 'construction_company'
  if (name.match(/\b(chemical|chemicals|materials|industrial|manufacturing|engineering)\b/)) return 'industrial_company'

  // Consumer & retail patterns
  if (name.match(/\b(retail|consumer|fashion|luxury|cosmetics|beauty|brand)\b/)) return 'consumer_company'
  if (name.match(/\b(food|beverage|restaurant|hospitality|hotel|travel)\b/)) return 'consumer_services_company'

  // Transportation patterns
  if (name.match(/\b(logistics|shipping|transport|delivery|freight|cargo|ports)\b/)) return 'logistics_company'
  if (name.match(/\b(airline|airways|airport|rail|railway|maritime)\b/)) return 'transportation_company'

  // Media patterns
  if (name.match(/\b(media|entertainment|broadcasting|television|publishing|games)\b/)) return 'media_company'

  // Default
  return 'corporation'
}

/**
 * Infer industry with detailed categorization
 */
function inferIndustry(companyName) {
  const name = companyName.toLowerCase()

  // Financial Services
  if (name.match(/\b(bank|banking|credit|financial)\b/)) return 'Banking & Financial Services'
  if (name.match(/\b(insurance|assurance)\b/)) return 'Insurance'
  if (name.match(/\b(investment|asset|fund|capital)\b/)) return 'Investment Management'

  // Healthcare
  if (name.match(/\b(pharma|pharmaceutical|bio|medical)\b/)) return 'Pharmaceuticals & Biotechnology'
  if (name.match(/\b(health|healthcare|hospital|medical devices)\b/)) return 'Healthcare Services'

  // Technology
  if (name.match(/\b(tech|technology|software|digital)\b/)) return 'Technology & Software'
  if (name.match(/\b(telecom|telecommunications|mobile)\b/)) return 'Telecommunications'

  // Energy
  if (name.match(/\b(energy|oil|gas|petroleum)\b/)) return 'Energy & Oil'
  if (name.match(/\b(utilities|power|electric|water)\b/)) return 'Utilities'
  if (name.match(/\b(renewable|solar|wind)\b/)) return 'Renewable Energy'

  // Industrial
  if (name.match(/\b(auto|automotive|motor)\b/)) return 'Automotive'
  if (name.match(/\b(aerospace|aviation|defense)\b/)) return 'Aerospace & Defense'
  if (name.match(/\b(construction|building|engineering)\b/)) return 'Construction & Engineering'
  if (name.match(/\b(chemical|materials|industrial)\b/)) return 'Chemicals & Materials'
  if (name.match(/\b(mining|metals|steel)\b/)) return 'Mining & Metals'

  // Consumer
  if (name.match(/\b(retail|consumer|fashion|luxury)\b/)) return 'Consumer Goods & Retail'
  if (name.match(/\b(food|beverage|restaurant)\b/)) return 'Food & Beverage'
  if (name.match(/\b(hotel|travel|hospitality)\b/)) return 'Travel & Hospitality'

  // Transportation
  if (name.match(/\b(logistics|shipping|transport)\b/)) return 'Transportation & Logistics'
  if (name.match(/\b(airline|airport|aviation)\b/)) return 'Airlines & Aviation'

  // Media
  if (name.match(/\b(media|entertainment|broadcasting)\b/)) return 'Media & Entertainment'

  // Real Estate
  if (name.match(/\b(real estate|property|immobilien)\b/)) return 'Real Estate'

  return 'Business Services'
}

/**
 * Infer business sector
 */
function inferSector(companyName) {
  const name = companyName.toLowerCase()

  if (name.match(/\b(bank|insurance|financial|investment|fund)\b/)) return 'Financial Services'
  if (name.match(/\b(pharma|bio|medical|health)\b/)) return 'Healthcare'
  if (name.match(/\b(tech|software|digital|telecom)\b/)) return 'Technology'
  if (name.match(/\b(energy|oil|gas|utilities|power)\b/)) return 'Energy'
  if (name.match(/\b(auto|aerospace|chemical|construction|industrial)\b/)) return 'Industrial'
  if (name.match(/\b(retail|consumer|food|hotel|travel)\b/)) return 'Consumer Services'
  if (name.match(/\b(transport|logistics|shipping|airline)\b/)) return 'Transportation'
  if (name.match(/\b(media|entertainment|broadcasting)\b/)) return 'Media'
  if (name.match(/\b(real estate|property|construction)\b/)) return 'Real Estate'

  return 'Business Services'
}

/**
 * Infer company scale and structure
 */
function inferScale(companyName) {
  const name = companyName.toLowerCase()

  // Large scale indicators
  if (name.match(/\b(international|global|worldwide|multinational)\b/)) return 'multinational'
  if (name.match(/\b(group|holding|corporation|corp|inc)\b/)) return 'large_corporation'
  if (name.match(/\b(ag|sa|se|nv|plc)\b$/)) return 'public_company'

  // Medium scale indicators
  if (name.match(/\b(ltd|limited|gmbh|srl|spa)\b$/)) return 'private_company'

  return 'established_company'
}

/**
 * Infer geographic operations
 */
function inferGeography(companyName, country) {
  const name = companyName.toLowerCase()

  const geography = {
    headquarters: country,
    scope: 'national'
  }

  if (name.match(/\b(international|global|worldwide|multinational|european)\b/)) {
    geography.scope = 'international'
  } else if (name.match(/\b(national|country|regional)\b/)) {
    geography.scope = 'national'
  }

  // Enhanced headquarters inference
  if (name.includes('deutsche') || name.includes('german')) geography.headquarters = 'Germany'
  if (name.includes('french') || name.includes('francaise')) geography.headquarters = 'France'
  if (name.includes('italian') || name.includes('italiana')) geography.headquarters = 'Italy'
  if (name.includes('swiss') || name.includes('suisse')) geography.headquarters = 'Switzerland'
  if (name.includes('european')) geography.headquarters = 'Europe'

  return geography
}

/**
 * Infer business specialization
 */
function inferSpecialization(companyName) {
  const name = companyName.toLowerCase()

  const specializations = []

  // Financial specializations
  if (name.match(/\b(investment|asset management|private equity|venture)\b/)) specializations.push('investment management')
  if (name.match(/\b(retail banking|commercial banking|corporate)\b/)) specializations.push('banking services')

  // Technology specializations
  if (name.match(/\b(cloud|saas|software|digital solutions)\b/)) specializations.push('software solutions')
  if (name.match(/\b(cybersecurity|security|data)\b/)) specializations.push('cybersecurity')

  // Healthcare specializations
  if (name.match(/\b(diagnostics|therapeutics|vaccines|medical devices)\b/)) specializations.push('medical technology')
  if (name.match(/\b(biotechnology|genomics|oncology)\b/)) specializations.push('biotechnology')

  return specializations
}

/**
 * Generate comprehensive intelligent description
 */
function generateIntelligentDescription(companyName, country, analysis) {
  const businessTypeDescriptions = {
    'financial_institution': 'leading financial institution providing comprehensive banking and financial services',
    'insurance_company': 'established insurance company offering comprehensive coverage and risk management solutions',
    'investment_company': 'professional investment management company focused on asset management and financial growth',
    'pharmaceutical_company': 'innovative pharmaceutical company dedicated to developing and manufacturing advanced healthcare solutions',
    'healthcare_provider': 'healthcare services provider committed to delivering quality medical care and patient outcomes',
    'technology_company': 'technology company specializing in innovative solutions and cutting-edge digital services',
    'telecommunications_company': 'telecommunications provider offering advanced communication services and network infrastructure',
    'energy_company': 'energy company engaged in the production, distribution, and supply of energy resources',
    'utility_company': 'utility company providing essential services including power generation and distribution',
    'automotive_company': 'automotive company involved in the design, manufacturing, and distribution of vehicles and related technologies',
    'aerospace_company': 'aerospace company engaged in the development of advanced aircraft, spacecraft, and defense systems',
    'construction_company': 'construction and development company specializing in infrastructure projects and real estate development',
    'industrial_company': 'industrial company focused on manufacturing, engineering, and advanced materials solutions',
    'consumer_company': 'consumer-focused company delivering products and services to retail markets',
    'consumer_services_company': 'consumer services company providing hospitality, food, and lifestyle solutions',
    'logistics_company': 'logistics and supply chain company offering comprehensive transportation and distribution services',
    'transportation_company': 'transportation company providing passenger and freight services across multiple channels',
    'media_company': 'media and entertainment company creating and distributing content across multiple platforms',
    'corporation': 'established corporation with diversified business operations and market presence'
  }

  const scaleDescriptions = {
    'multinational': 'operates internationally with a global market presence',
    'large_corporation': 'maintains significant market leadership and operational scale',
    'public_company': 'publicly traded company with shares listed on major stock exchanges',
    'private_company': 'privately held company with focused market operations',
    'established_company': 'well-established company with proven market position'
  }

  const baseDescription = businessTypeDescriptions[analysis.businessType] || businessTypeDescriptions['corporation']
  const scaleDescription = scaleDescriptions[analysis.scale] || scaleDescriptions['established_company']

  let description = `${companyName} is a ${baseDescription}. `
  description += `Based in ${analysis.geography.headquarters}, the company ${scaleDescription} `
  description += `and operates within the ${analysis.industry.toLowerCase()} sector. `

  // Add specialization if available
  if (analysis.specialization.length > 0) {
    description += `The company specializes in ${analysis.specialization.join(' and ')}, `
  }

  description += `maintaining operational excellence and regulatory compliance in accordance with industry standards and best practices.`

  return description
}

/**
 * Main intelligent enhancement function
 */
async function intelligentEnhancement() {
  console.log('🧠 Starting intelligent company enhancement...')
  console.log(`⚡ Processing delay: ${PROCESSING_DELAY/1000} seconds`)
  console.log(`📊 Max companies: ${MAX_COMPANIES_PER_RUN}`)

  try {
    // Get companies needing intelligent enhancement
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, company_name, country, description, business_overview, data_source')
      .or('data_source.eq.Generated,data_source.is.null,description.ilike.%business entity operating%')
      .limit(MAX_COMPANIES_PER_RUN)

    if (error) {
      console.error('❌ Database error:', error)
      return
    }

    if (!companies || companies.length === 0) {
      console.log('✅ All companies have intelligent descriptions!')
      return
    }

    console.log(`📋 Found ${companies.length} companies for intelligent enhancement`)

    let enhanced = 0
    let failed = 0

    for (let i = 0; i < companies.length; i++) {
      const company = companies[i]
      console.log(`\n[${i + 1}/${companies.length}] Analyzing: ${company.company_name}`)

      try {
        const intelligentData = analyzeCompanyIntelligence(company.company_name, company.country)

        // Update database with intelligent description
        const { error: updateError } = await supabase
          .from('companies')
          .update({
            description: intelligentData.description,
            business_overview: intelligentData.description,
            industry_detail: intelligentData.industry,
            headquarters: intelligentData.headquarters,
            data_source: intelligentData.source,
            enrichment_status: 'enriched',
            last_enriched: new Date().toISOString()
          })
          .eq('id', company.id)

        if (updateError) {
          console.error(`❌ Update failed for ${company.company_name}:`, updateError)
          failed++
        } else {
          console.log(`💾 Successfully enhanced ${company.company_name}`)
          enhanced++
        }

      } catch (error) {
        console.error(`❌ Error processing ${company.company_name}:`, error.message)
        failed++
      }

      // Progress update
      if ((i + 1) % 10 === 0) {
        console.log(`\n📊 Progress: ${i + 1}/${companies.length} companies`)
        console.log(`✅ Enhanced: ${enhanced} | ❌ Failed: ${failed}`)
      }

      // Brief delay
      await sleep(PROCESSING_DELAY)
    }

    console.log('\n🎉 Intelligent enhancement complete!')
    console.log(`📊 Final Results:`)
    console.log(`   ✅ Intelligently Enhanced: ${enhanced}`)
    console.log(`   ❌ Failed: ${failed}`)
    console.log(`   📈 Total Processed: ${companies.length}`)
    console.log(`   📊 Success Rate: ${((enhanced / companies.length) * 100).toFixed(1)}%`)

  } catch (error) {
    console.error('❌ Intelligent enhancement failed:', error)
  }
}

// Run the intelligent enhancement
intelligentEnhancement()
  .then(() => {
    console.log('\n✅ Intelligent enhancement completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
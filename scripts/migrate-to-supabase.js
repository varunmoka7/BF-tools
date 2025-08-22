const { createClient } = require('@supabase/supabase-js')
const fs = require('fs').promises
const path = require('path')

async function migrateData() {
  try {
    console.log('🚀 Starting data migration to Supabase...')
    
    // Load environment variables
    require('dotenv').config({ path: path.join(__dirname, '../apps/waste-intelligence-platform/.env.local') })
    
    console.log('Environment variables loaded:')
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
    console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required Supabase environment variables')
    }
    
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    // Read existing JSON data
    const companiesPath = path.join(process.cwd(), 'apps/waste-intelligence-platform/public/companies-with-coordinates.json')
    const companiesData = JSON.parse(await fs.readFile(companiesPath, 'utf8'))
    
    console.log(`📊 Found ${companiesData.length} companies to migrate`)
    
    // Transform data for Supabase schema
    const transformedCompanies = companiesData.map((company) => ({
      company_name: company.name,
      country: company.country,
      sector: company.sector,
      industry: company.industry,
      employees: company.employees,
      year_of_disclosure: company.year_of_disclosure,
      ticker: company.ticker,
      exchange: company.exchange,
      isin: company.isin || null,
      lei: company.lei || null,
      figi: company.figi || null,
      perm_id: company.permid || null
    }))
    
    // Insert companies in batches
    const batchSize = 50
    for (let i = 0; i < transformedCompanies.length; i += batchSize) {
      const batch = transformedCompanies.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('companies')
        .insert(batch)
        .select()
      
      if (error) {
        console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error)
        continue
      }
      
      console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} companies)`)
    }
    
    console.log('🎉 Data migration completed successfully!')
    
    // Refresh materialized views
    await supabase.rpc('refresh_dashboard_summary')
    console.log('🔄 Dashboard summary refreshed')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

migrateData()

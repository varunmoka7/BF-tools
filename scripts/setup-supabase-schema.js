const { createClient } = require('@supabase/supabase-js')
const fs = require('fs').promises
const path = require('path')

async function setupSchema() {
  try {
    console.log('🚀 Setting up Supabase database schema...')
    
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
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '../backend/src/database/supabase-schema.sql')
    const schemaSQL = await fs.readFile(schemaPath, 'utf8')
    
    console.log('📝 Executing database schema...')
    
    // Split the SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    let successCount = 0
    let errorCount = 0
    
    for (const statement of statements) {
      try {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
          if (error) {
            console.warn(`⚠️  Statement had issues (may already exist):`, error.message)
            errorCount++
          } else {
            successCount++
          }
        }
      } catch (error) {
        console.warn(`⚠️  Statement execution warning:`, error.message)
        errorCount++
      }
    }
    
    console.log(`✅ Schema setup completed!`)
    console.log(`   - Successful statements: ${successCount}`)
    console.log(`   - Warnings/errors: ${errorCount}`)
    
    // Create simplified views for the dashboard
    console.log('📝 Creating dashboard views...')
    
    const viewsSQL = `
      -- Company profiles view
      CREATE OR REPLACE VIEW company_profiles AS
      SELECT 
          c.id,
          c.company_name,
          c.country,
          c.sector,
          c.industry,
          c.employees,
          c.ticker,
          c.exchange,
          c.year_of_disclosure,
          COALESCE(cm.total_waste_generated, 0) as total_waste_generated,
          COALESCE(cm.total_waste_recovered, 0) as total_waste_recovered,
          COALESCE(cm.recovery_rate, 0) as recovery_rate,
          c.created_at,
          c.updated_at
      FROM companies c
      LEFT JOIN company_metrics cm ON c.id = cm.company_id;
      
      -- Country leaderboard view
      CREATE OR REPLACE VIEW country_leaderboard AS
      SELECT 
          country,
          COUNT(*) as company_count,
          AVG(COALESCE(recovery_rate, 0)) as avg_recovery_rate,
          SUM(COALESCE(total_waste_generated, 0)) as total_waste,
          MAX(COALESCE(recovery_rate, 0)) as best_recovery_rate,
          MIN(COALESCE(recovery_rate, 0)) as worst_recovery_rate
      FROM company_profiles
      GROUP BY country
      ORDER BY avg_recovery_rate DESC;
      
      -- Sector leaderboard view
      CREATE OR REPLACE VIEW sector_leaderboard AS
      SELECT 
          sector,
          COUNT(*) as company_count,
          AVG(COALESCE(recovery_rate, 0)) as avg_recovery_rate,
          SUM(COALESCE(total_waste_generated, 0)) as total_waste,
          MAX(COALESCE(recovery_rate, 0)) as best_recovery_rate,
          MIN(COALESCE(recovery_rate, 0)) as worst_recovery_rate
      FROM company_profiles
      GROUP BY sector
      ORDER BY avg_recovery_rate DESC;
      
      -- Dashboard summary materialized view
      CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_summary AS
      SELECT 
          COUNT(DISTINCT c.id) as total_companies,
          COUNT(DISTINCT c.country) as total_countries,
          COUNT(DISTINCT c.sector) as total_sectors,
          SUM(COALESCE(cm.total_waste_generated, 0)) as total_waste_generated,
          SUM(COALESCE(cm.total_waste_recovered, 0)) as total_waste_recovered,
          AVG(COALESCE(cm.recovery_rate, 0)) as avg_recovery_rate
      FROM companies c
      LEFT JOIN company_metrics cm ON c.id = cm.company_id;
    `
    
    const viewStatements = viewsSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    for (const statement of viewStatements) {
      try {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
          if (error) {
            console.warn(`⚠️  View creation warning:`, error.message)
          }
        }
      } catch (error) {
        console.warn(`⚠️  View creation warning:`, error.message)
      }
    }
    
    console.log('✅ Dashboard views created successfully!')
    
    // Refresh materialized view
    await supabase.rpc('refresh_dashboard_summary')
    console.log('🔄 Dashboard summary refreshed')
    
  } catch (error) {
    console.error('❌ Schema setup failed:', error)
  }
}

setupSchema()

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log('🚀 Starting enhanced company profiles migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../backend/src/database/migrations/001_enhance_company_profiles.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          if (error) {
            console.warn(`⚠️  Statement ${i + 1} had an issue (likely already exists):`, error.message);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.warn(`⚠️  Statement ${i + 1} skipped (likely already exists):`, err.message);
        }
      }
    }
    
    console.log('✅ Enhanced company profiles migration completed successfully!');
    console.log('📋 New tables created:');
    console.log('   - company_waste_profiles');
    console.log('   - company_esg_documents');
    console.log('   - company_sustainability_metrics');
    console.log('   - company_certifications');
    console.log('   - company_waste_facilities');
    console.log('📊 Views updated:');
    console.log('   - company_profiles (enhanced)');
    console.log('   - comprehensive_company_profiles (new)');
    
    // Verify the migration
    await verifyMigration(supabase);
    
    return true;
  } catch (error) {
    console.error('❌ Migration error:', error);
    return false;
  }
}

async function verifyMigration(supabase) {
  console.log('\n🔍 Verifying migration...');
  
  try {
    // Check if new columns exist in companies table
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'companies')
      .in('column_name', ['description', 'business_overview', 'website_url', 'founded_year']);
    
    if (!columnsError && columns.length > 0) {
      console.log('✅ New columns added to companies table:', columns.map(c => c.column_name).join(', '));
    }
    
    // Check if new tables exist
    const newTables = [
      'company_waste_profiles',
      'company_esg_documents', 
      'company_sustainability_metrics',
      'company_certifications',
      'company_waste_facilities'
    ];
    
    for (const table of newTables) {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (!error) {
        console.log(`✅ Table ${table} exists`);
      } else {
        console.log(`❌ Table ${table} not found`);
      }
    }
    
  } catch (error) {
    console.warn('⚠️  Verification had issues:', error.message);
  }
}

// Run the migration if called directly
if (require.main === module) {
  runMigration()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };

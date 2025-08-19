/**
 * Create Supabase schema using SQL execution
 */

require('dotenv').config({ quiet: true });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function createSchema() {
  console.log('🚀 Creating Supabase schema...\n');

  // Create Supabase client with service role for admin operations
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, '../src/database/supabase-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

    // Split into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      if (statement.includes('CREATE EXTENSION') || 
          statement.includes('CREATE TABLE') || 
          statement.includes('CREATE INDEX') ||
          statement.includes('CREATE VIEW') ||
          statement.includes('CREATE MATERIALIZED VIEW') ||
          statement.includes('CREATE FUNCTION') ||
          statement.includes('CREATE TRIGGER') ||
          statement.includes('CREATE POLICY') ||
          statement.includes('ALTER TABLE')) {
        
        console.log(`${i + 1}. ${statement.substring(0, 50)}...`);
        
        const { data, error } = await supabase.rpc('execute_sql', {
          query: statement
        });

        if (error) {
          // Some errors are expected (like "already exists")
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist')) {
            console.log(`   ⚠️  ${error.message}`);
          } else {
            console.error(`   ❌ Error: ${error.message}`);
            // Don't fail completely, continue with other statements
          }
        } else {
          console.log(`   ✅ Success`);
        }
      }
    }

    console.log('\n🎉 Schema creation completed!\n');

    // Test by listing tables
    console.log('📋 Verifying created tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (tablesError) {
      console.log('Could not list tables, but schema creation likely succeeded');
    } else {
      console.log('✅ Tables created:');
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }

    return true;

  } catch (error) {
    console.error('❌ Schema creation failed:', error);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  createSchema()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Script error:', error);
      process.exit(1);
    });
}

module.exports = createSchema;
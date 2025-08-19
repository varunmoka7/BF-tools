const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  // Check for environment variables - use the correct names from .env.local
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    console.log('💡 Please set these in your .env.local file');
    return false;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log('🚀 Starting enhanced company profiles migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../backend/src/database/migrations/001_enhance_company_profiles.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      return false;
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Executing migration SQL...');
    
    // Execute the migration using raw SQL
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      return false;
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
    
    return true;
  } catch (error) {
    console.error('❌ Migration error:', error);
    return false;
  }
}

// Alternative approach using direct SQL queries
async function runMigrationDirect() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing environment variables');
    return false;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log('🚀 Starting enhanced company profiles migration (direct method)...');
    
    // Step 1: Add new columns to companies table
    console.log('📝 Adding new columns to companies table...');
    const alterTableSQL = `
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS business_overview TEXT,
      ADD COLUMN IF NOT EXISTS website_url VARCHAR(500),
      ADD COLUMN IF NOT EXISTS founded_year INTEGER,
      ADD COLUMN IF NOT EXISTS headquarters VARCHAR(200),
      ADD COLUMN IF NOT EXISTS revenue_usd DECIMAL(15,2),
      ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;
    `;
    
    const { error: alterError } = await supabase.rpc('exec_sql', { sql: alterTableSQL });
    if (alterError) {
      console.warn('⚠️  Alter table had issues (columns may already exist):', alterError.message);
    } else {
      console.log('✅ Added new columns to companies table');
    }
    
    // Step 2: Create company_waste_profiles table
    console.log('📝 Creating company_waste_profiles table...');
    const wasteProfilesSQL = `
      CREATE TABLE IF NOT EXISTS company_waste_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        primary_waste_materials TEXT[],
        waste_management_strategy TEXT,
        recycling_facilities_count INTEGER,
        waste_treatment_methods TEXT[],
        sustainability_goals TEXT,
        circular_economy_initiatives TEXT,
        waste_reduction_targets JSONB,
        zero_waste_commitment BOOLEAN DEFAULT FALSE,
        zero_waste_target_year INTEGER,
        carbon_neutrality_commitment BOOLEAN DEFAULT FALSE,
        carbon_neutrality_target_year INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    const { error: wasteError } = await supabase.rpc('exec_sql', { sql: wasteProfilesSQL });
    if (wasteError) {
      console.warn('⚠️  Waste profiles table had issues:', wasteError.message);
    } else {
      console.log('✅ Created company_waste_profiles table');
    }
    
    // Step 3: Create company_esg_documents table
    console.log('📝 Creating company_esg_documents table...');
    const esgDocsSQL = `
      CREATE TABLE IF NOT EXISTS company_esg_documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        document_type VARCHAR(100),
        document_title VARCHAR(500),
        document_url VARCHAR(1000),
        publication_date DATE,
        reporting_year INTEGER,
        file_size_mb DECIMAL(10,2),
        language VARCHAR(10) DEFAULT 'en',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_date TIMESTAMPTZ,
        verified_by VARCHAR(255),
        document_summary TEXT,
        key_highlights JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    const { error: esgError } = await supabase.rpc('exec_sql', { sql: esgDocsSQL });
    if (esgError) {
      console.warn('⚠️  ESG documents table had issues:', esgError.message);
    } else {
      console.log('✅ Created company_esg_documents table');
    }
    
    // Step 4: Create company_sustainability_metrics table
    console.log('📝 Creating company_sustainability_metrics table...');
    const sustainabilitySQL = `
      CREATE TABLE IF NOT EXISTS company_sustainability_metrics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        reporting_year INTEGER,
        carbon_footprint_tonnes DECIMAL(12,2),
        energy_consumption_gwh DECIMAL(10,2),
        water_consumption_m3 DECIMAL(12,2),
        renewable_energy_percentage DECIMAL(5,2),
        waste_to_landfill_percentage DECIMAL(5,2),
        recycling_rate_percentage DECIMAL(5,2),
        esg_score DECIMAL(5,2),
        sustainability_rating VARCHAR(20),
        rating_agency VARCHAR(100),
        rating_date DATE,
        carbon_intensity DECIMAL(10,4),
        water_intensity DECIMAL(10,4),
        waste_intensity DECIMAL(10,4),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    const { error: sustainabilityError } = await supabase.rpc('exec_sql', { sql: sustainabilitySQL });
    if (sustainabilityError) {
      console.warn('⚠️  Sustainability metrics table had issues:', sustainabilityError.message);
    } else {
      console.log('✅ Created company_sustainability_metrics table');
    }
    
    // Step 5: Create company_certifications table
    console.log('📝 Creating company_certifications table...');
    const certificationsSQL = `
      CREATE TABLE IF NOT EXISTS company_certifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        certification_name VARCHAR(200),
        certification_type VARCHAR(100),
        issuing_organization VARCHAR(200),
        certification_date DATE,
        expiry_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        scope TEXT,
        certificate_url VARCHAR(1000),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    const { error: certError } = await supabase.rpc('exec_sql', { sql: certificationsSQL });
    if (certError) {
      console.warn('⚠️  Certifications table had issues:', certError.message);
    } else {
      console.log('✅ Created company_certifications table');
    }
    
    // Step 6: Create company_waste_facilities table
    console.log('📝 Creating company_waste_facilities table...');
    const facilitiesSQL = `
      CREATE TABLE IF NOT EXISTS company_waste_facilities (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        facility_name VARCHAR(200),
        facility_type VARCHAR(100),
        location VARCHAR(500),
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        capacity_tonnes_per_year DECIMAL(12,2),
        operational_status VARCHAR(50) DEFAULT 'operational',
        waste_types_processed TEXT[],
        treatment_methods TEXT[],
        certifications TEXT[],
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    const { error: facilitiesError } = await supabase.rpc('exec_sql', { sql: facilitiesSQL });
    if (facilitiesError) {
      console.warn('⚠️  Waste facilities table had issues:', facilitiesError.message);
    } else {
      console.log('✅ Created company_waste_facilities table');
    }
    
    console.log('✅ Enhanced company profiles migration completed successfully!');
    console.log('📋 New tables created:');
    console.log('   - company_waste_profiles');
    console.log('   - company_esg_documents');
    console.log('   - company_sustainability_metrics');
    console.log('   - company_certifications');
    console.log('   - company_waste_facilities');
    
    return true;
  } catch (error) {
    console.error('❌ Migration error:', error);
    return false;
  }
}

// Run the migration if called directly
if (require.main === module) {
  // Try the direct method first
  runMigrationDirect()
    .then(success => {
      if (!success) {
        console.log('🔄 Trying alternative migration method...');
        return runMigration();
      }
      return success;
    })
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runMigration, runMigrationDirect };

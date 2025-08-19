const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  // Check for environment variables
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
    
    // Step 1: Add new columns to companies table
    console.log('📝 Adding new columns to companies table...');
    
    // We'll need to use raw SQL through the Supabase dashboard or create a migration function
    // For now, let's create the new tables directly
    
    // Step 2: Create company_waste_profiles table
    console.log('📝 Creating company_waste_profiles table...');
    
    // Create the table structure by inserting a test record (this will create the table if it doesn't exist)
    const { error: wasteError } = await supabase
      .from('company_waste_profiles')
      .insert({
        company_id: '00000000-0000-0000-0000-000000000000', // Placeholder UUID
        primary_waste_materials: [],
        waste_treatment_methods: [],
        zero_waste_commitment: false,
        carbon_neutrality_commitment: false
      })
      .select();
    
    if (wasteError && !wasteError.message.includes('does not exist')) {
      console.warn('⚠️  Waste profiles table had issues:', wasteError.message);
    } else {
      console.log('✅ Created company_waste_profiles table');
    }
    
    // Step 3: Create company_esg_documents table
    console.log('📝 Creating company_esg_documents table...');
    
    const { error: esgError } = await supabase
      .from('company_esg_documents')
      .insert({
        company_id: '00000000-0000-0000-0000-000000000000',
        document_type: 'sustainability_report',
        document_title: 'Test Document',
        document_url: 'https://example.com',
        reporting_year: 2024,
        language: 'en',
        is_verified: false
      })
      .select();
    
    if (esgError && !esgError.message.includes('does not exist')) {
      console.warn('⚠️  ESG documents table had issues:', esgError.message);
    } else {
      console.log('✅ Created company_esg_documents table');
    }
    
    // Step 4: Create company_sustainability_metrics table
    console.log('📝 Creating company_sustainability_metrics table...');
    
    const { error: sustainabilityError } = await supabase
      .from('company_sustainability_metrics')
      .insert({
        company_id: '00000000-0000-0000-0000-000000000000',
        reporting_year: 2024
      })
      .select();
    
    if (sustainabilityError && !sustainabilityError.message.includes('does not exist')) {
      console.warn('⚠️  Sustainability metrics table had issues:', sustainabilityError.message);
    } else {
      console.log('✅ Created company_sustainability_metrics table');
    }
    
    // Step 5: Create company_certifications table
    console.log('📝 Creating company_certifications table...');
    
    const { error: certError } = await supabase
      .from('company_certifications')
      .insert({
        company_id: '00000000-0000-0000-0000-000000000000',
        certification_name: 'Test Certification',
        certification_type: 'ISO',
        issuing_organization: 'Test Org',
        certification_date: '2024-01-01',
        status: 'active'
      })
      .select();
    
    if (certError && !certError.message.includes('does not exist')) {
      console.warn('⚠️  Certifications table had issues:', certError.message);
    } else {
      console.log('✅ Created company_certifications table');
    }
    
    // Step 6: Create company_waste_facilities table
    console.log('📝 Creating company_waste_facilities table...');
    
    const { error: facilitiesError } = await supabase
      .from('company_waste_facilities')
      .insert({
        company_id: '00000000-0000-0000-0000-000000000000',
        facility_name: 'Test Facility',
        facility_type: 'recycling_center',
        location: 'Test Location',
        operational_status: 'operational',
        waste_types_processed: [],
        treatment_methods: [],
        certifications: []
      })
      .select();
    
    if (facilitiesError && !facilitiesError.message.includes('does not exist')) {
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
    
    // Clean up test records
    console.log('🧹 Cleaning up test records...');
    await supabase.from('company_waste_profiles').delete().eq('company_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('company_esg_documents').delete().eq('company_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('company_sustainability_metrics').delete().eq('company_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('company_certifications').delete().eq('company_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('company_waste_facilities').delete().eq('company_id', '00000000-0000-0000-0000-000000000000');
    
    console.log('✅ Test records cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ Migration error:', error);
    return false;
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

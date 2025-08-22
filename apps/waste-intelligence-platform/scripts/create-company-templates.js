const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCompanyTemplates() {
  try {
    console.log('Starting company template creation...');

    // Get all companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, company_name, csv_company_id');

    if (companiesError) {
      throw companiesError;
    }

    console.log(`Found ${companies.length} companies to process`);

    // Create templates for each company
    const templatePromises = companies.map(async (company) => {
      const { data: template, error } = await supabase
        .from('company_data_templates')
        .upsert({
          company_id: company.id,
          csv_company_id: company.csv_company_id || company.id,
          template_version: '1.0',
          profile: {
            description: null,
            website_url: null,
            founded_year: null,
            headquarters: null,
            revenue_usd: null,
            market_cap_usd: null,
            sustainability_rating: null,
            business_overview: null,
            ceo: null,
            logo_url: null
          },
          waste_management: {
            total_waste_generated: null,
            total_waste_recovered: null,
            total_waste_disposed: null,
            recovery_rate: null,
            hazardous_waste: {
              generated: null,
              recovered: null,
              disposed: null,
              recovery_rate: null
            },
            non_hazardous_waste: {
              generated: null,
              recovered: null,
              disposed: null,
              recovery_rate: null
            },
            treatment_methods: {
              recycling: null,
              composting: null,
              energy_recovery: null,
              landfill: null,
              incineration: null
            },
            waste_types: {
              municipal: null,
              industrial: null,
              construction: null,
              electronic: null,
              medical: null
            }
          },
          performance: {
            trends: [],
            benchmarks: {
              industry: null,
              regional: null,
              global: null
            },
            performance_score: null,
            opportunity_score: null
          },
          custom_fields: {},
          is_synced_with_master: false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'company_id'
        });

      if (error) {
        console.error(`Error creating template for ${company.company_name}:`, error);
        return { success: false, company: company.company_name, error };
      }

      return { success: true, company: company.company_name, template_id: template?.[0]?.id };
    });

    const results = await Promise.all(templatePromises);
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`\nTemplate creation completed:`);
    console.log(`✅ Successfully created: ${successful.length} templates`);
    console.log(`❌ Failed to create: ${failed.length} templates`);

    if (failed.length > 0) {
      console.log('\nFailed companies:');
      failed.forEach(f => console.log(`- ${f.company}: ${f.error?.message}`));
    }

    console.log('\nCompany template creation process completed!');

  } catch (error) {
    console.error('Error in createCompanyTemplates:', error);
    process.exit(1);
  }
}

// Run the script
createCompanyTemplates();

// Data Import to Supabase for Enhanced Company Profiles
// Waste Management Platform

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

class DataImportManager {
  constructor() {
    // Initialize Supabase client
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    this.importLog = [];
    this.errors = [];
  }

  // Import company profile data
  async importCompanyProfile(companyData) {
    try {
      console.log(`Importing data for ${companyData.company_name}...`);
      
      // Step 1: Update companies table with enhanced profile data
      const { data: companyUpdate, error: companyError } = await this.supabase
        .from('companies')
        .update({
          description: companyData.description,
          business_overview: companyData.business_overview,
          website_url: companyData.website_url,
          founded_year: companyData.founded_year,
          headquarters: companyData.headquarters,
          revenue_usd: companyData.revenue_usd,
          is_public: companyData.is_public,
          stock_exchange: companyData.stock_exchange,
          market_cap_usd: companyData.market_cap_usd,
          primary_contact_email: companyData.primary_contact_email,
          primary_contact_phone: companyData.primary_contact_phone,
          sustainability_contact_email: companyData.sustainability_contact_email,
          sustainability_contact_phone: companyData.sustainability_contact_phone,
          updated_at: new Date().toISOString()
        })
        .eq('company_name', companyData.company_name)
        .select();

      if (companyError) {
        throw new Error(`Company update error: ${companyError.message}`);
      }

      // Step 2: Import waste profile data
      if (companyData.waste_profile) {
        await this.importWasteProfile(companyData.company_name, companyData.waste_profile);
      }

      // Step 3: Import ESG documents
      if (companyData.esg_documents && companyData.esg_documents.length > 0) {
        await this.importESGDocuments(companyData.company_name, companyData.esg_documents);
      }

      // Step 4: Import sustainability metrics
      if (companyData.sustainability_metrics) {
        await this.importSustainabilityMetrics(companyData.company_name, companyData.sustainability_metrics);
      }

      // Step 5: Import certifications
      if (companyData.certifications && companyData.certifications.length > 0) {
        await this.importCertifications(companyData.company_name, companyData.certifications);
      }

      // Step 6: Import waste facilities
      if (companyData.waste_facilities && companyData.waste_facilities.length > 0) {
        await this.importWasteFacilities(companyData.company_name, companyData.waste_facilities);
      }

      this.importLog.push({
        company: companyData.company_name,
        status: 'success',
        timestamp: new Date().toISOString(),
        message: 'Import completed successfully'
      });

      console.log(`✅ Successfully imported data for ${companyData.company_name}`);

    } catch (error) {
      console.error(`❌ Error importing ${companyData.company_name}:`, error.message);
      
      this.errors.push({
        company: companyData.company_name,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Import waste profile
  async importWasteProfile(companyName, wasteProfile) {
    const { data: company } = await this.supabase
      .from('companies')
      .select('id')
      .eq('company_name', companyName)
      .single();

    if (!company) {
      throw new Error(`Company not found: ${companyName}`);
    }

    const { error } = await this.supabase
      .from('company_waste_profiles')
      .upsert({
        company_id: company.id,
        primary_waste_materials: wasteProfile.primary_waste_materials,
        waste_management_strategy: wasteProfile.waste_management_strategy,
        recycling_facilities_count: wasteProfile.recycling_facilities_count,
        waste_treatment_methods: wasteProfile.waste_treatment_methods,
        sustainability_goals: wasteProfile.sustainability_goals,
        circular_economy_initiatives: wasteProfile.circular_economy_initiatives,
        waste_reduction_targets: wasteProfile.waste_reduction_targets,
        zero_waste_commitment: wasteProfile.zero_waste_commitment,
        zero_waste_target_year: wasteProfile.zero_waste_target_year,
        carbon_neutrality_commitment: wasteProfile.carbon_neutrality_commitment,
        carbon_neutrality_target_year: wasteProfile.carbon_neutrality_target_year,
        updated_at: new Date().toISOString()
      });

    if (error) {
      throw new Error(`Waste profile import error: ${error.message}`);
    }
  }

  // Import ESG documents
  async importESGDocuments(companyName, documents) {
    const { data: company } = await this.supabase
      .from('companies')
      .select('id')
      .eq('company_name', companyName)
      .single();

    for (const doc of documents) {
      const { error } = await this.supabase
        .from('company_esg_documents')
        .insert({
          company_id: company.id,
          document_type: doc.document_type,
          document_title: doc.document_title,
          document_url: doc.document_url,
          publication_date: doc.publication_date,
          reporting_year: doc.reporting_year,
          file_size_mb: doc.file_size_mb,
          language: doc.language,
          is_verified: doc.is_verified,
          document_summary: doc.document_summary,
          key_highlights: doc.key_highlights
        });

      if (error) {
        console.warn(`Warning: Could not import ESG document ${doc.document_title}: ${error.message}`);
      }
    }
  }

  // Import sustainability metrics
  async importSustainabilityMetrics(companyName, metrics) {
    const { data: company } = await this.supabase
      .from('companies')
      .select('id')
      .eq('company_name', companyName)
      .single();

    const { error } = await this.supabase
      .from('company_sustainability_metrics')
      .upsert({
        company_id: company.id,
        reporting_year: metrics.reporting_year,
        carbon_footprint_tonnes: metrics.carbon_footprint_tonnes,
        energy_consumption_gwh: metrics.energy_consumption_gwh,
        water_consumption_m3: metrics.water_consumption_m3,
        renewable_energy_percentage: metrics.renewable_energy_percentage,
        waste_to_landfill_percentage: metrics.waste_to_landfill_percentage,
        recycling_rate_percentage: metrics.recycling_rate_percentage,
        esg_score: metrics.esg_score,
        sustainability_rating: metrics.sustainability_rating,
        rating_agency: metrics.rating_agency,
        rating_date: metrics.rating_date,
        carbon_intensity: metrics.carbon_intensity,
        water_intensity: metrics.water_intensity,
        waste_intensity: metrics.waste_intensity
      });

    if (error) {
      throw new Error(`Sustainability metrics import error: ${error.message}`);
    }
  }

  // Import certifications
  async importCertifications(companyName, certifications) {
    const { data: company } = await this.supabase
      .from('companies')
      .select('id')
      .eq('company_name', companyName)
      .single();

    for (const cert of certifications) {
      const { error } = await this.supabase
        .from('company_certifications')
        .insert({
          company_id: company.id,
          certification_name: cert.certification_name,
          certification_type: cert.certification_type,
          issuing_organization: cert.issuing_organization,
          certification_date: cert.certification_date,
          expiry_date: cert.expiry_date,
          status: cert.status,
          scope: cert.scope,
          certificate_url: cert.certificate_url
        });

      if (error) {
        console.warn(`Warning: Could not import certification ${cert.certification_name}: ${error.message}`);
      }
    }
  }

  // Import waste facilities
  async importWasteFacilities(companyName, facilities) {
    const { data: company } = await this.supabase
      .from('companies')
      .select('id')
      .eq('company_name', companyName)
      .single();

    for (const facility of facilities) {
      const { error } = await this.supabase
        .from('company_waste_facilities')
        .insert({
          company_id: company.id,
          facility_name: facility.facility_name,
          facility_type: facility.facility_type,
          location: facility.location,
          latitude: facility.latitude,
          longitude: facility.longitude,
          capacity_tonnes_per_year: facility.capacity_tonnes_per_year,
          operational_status: facility.operational_status,
          waste_types_processed: facility.waste_types_processed,
          treatment_methods: facility.treatment_methods,
          certifications: facility.certifications
        });

      if (error) {
        console.warn(`Warning: Could not import facility ${facility.facility_name}: ${error.message}`);
      }
    }
  }

  // Import from CSV file
  async importFromCSV(csvFilePath) {
    console.log(`Starting import from CSV: ${csvFilePath}`);
    
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        const companyData = {};
        
        headers.forEach((header, index) => {
          companyData[header.trim()] = values[index]?.trim() || '';
        });
        
        await this.importCompanyProfile(companyData);
      }
    }
  }

  // Generate import report
  generateImportReport() {
    console.log('\n=== Data Import Report ===');
    console.log(`Total processed: ${this.importLog.length}`);
    console.log(`Successful imports: ${this.importLog.filter(log => log.status === 'success').length}`);
    console.log(`Errors: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\nErrors:');
      this.errors.forEach(error => {
        console.log(`- ${error.company}: ${error.error}`);
      });
    }
    
    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      total_processed: this.importLog.length,
      successful: this.importLog.filter(log => log.status === 'success').length,
      errors: this.errors.length,
      import_log: this.importLog,
      error_log: this.errors
    };
    
    fs.writeFileSync('import-report.json', JSON.stringify(report, null, 2));
    console.log('\n📁 Import report saved to: import-report.json');
  }
}

// Example usage
async function main() {
  const importManager = new DataImportManager();
  
  try {
    // Example company data
    const sampleCompany = {
      company_name: 'Siemens AG',
      description: 'Siemens AG is a German multinational conglomerate...',
      business_overview: 'Siemens operates in industry, infrastructure, transport, and healthcare...',
      website_url: 'https://www.siemens.com',
      founded_year: 1847,
      headquarters: 'Munich, Germany',
      revenue_usd: 77800000000,
      is_public: true,
      stock_exchange: 'XETR',
      market_cap_usd: 120000000000,
      waste_profile: {
        primary_waste_materials: ['Electronic waste', 'Metal scrap', 'Plastic waste'],
        waste_management_strategy: 'Comprehensive circular economy approach...',
        recycling_facilities_count: 15,
        waste_treatment_methods: ['Mechanical recycling', 'Chemical recycling'],
        zero_waste_commitment: true,
        zero_waste_target_year: 2025
      }
    };
    
    await importManager.importCompanyProfile(sampleCompany);
    importManager.generateImportReport();
    
  } catch (error) {
    console.error('❌ Import error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { DataImportManager };

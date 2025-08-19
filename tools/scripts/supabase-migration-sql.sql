-- Enhanced Company Profiles Migration SQL (FIXED)
-- Run this in your Supabase SQL Editor

-- Step 1: Add enhanced profile fields to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS business_overview TEXT,
ADD COLUMN IF NOT EXISTS website_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS founded_year INTEGER,
ADD COLUMN IF NOT EXISTS headquarters VARCHAR(200),
ADD COLUMN IF NOT EXISTS revenue_usd DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stock_exchange VARCHAR(50),
ADD COLUMN IF NOT EXISTS market_cap_usd DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS primary_contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS primary_contact_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS sustainability_contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS sustainability_contact_phone VARCHAR(50);

-- Step 2: Create company waste profiles table
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

-- Step 3: Create ESG documents and reports table
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

-- Step 4: Create company sustainability metrics table
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

-- Step 5: Create company certifications and awards table
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

-- Step 6: Create company waste facilities table
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

-- Step 7: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_website ON companies(website_url);
CREATE INDEX IF NOT EXISTS idx_companies_founded_year ON companies(founded_year);
CREATE INDEX IF NOT EXISTS idx_companies_headquarters ON companies(headquarters);
CREATE INDEX IF NOT EXISTS idx_companies_is_public ON companies(is_public);

CREATE INDEX IF NOT EXISTS idx_company_waste_profiles_company_id ON company_waste_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_company_waste_profiles_zero_waste ON company_waste_profiles(zero_waste_commitment);

CREATE INDEX IF NOT EXISTS idx_company_esg_documents_company_id ON company_esg_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_company_esg_documents_type ON company_esg_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_company_esg_documents_year ON company_esg_documents(reporting_year);
CREATE INDEX IF NOT EXISTS idx_company_esg_documents_verified ON company_esg_documents(is_verified);

CREATE INDEX IF NOT EXISTS idx_company_sustainability_metrics_company_id ON company_sustainability_metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_company_sustainability_metrics_year ON company_sustainability_metrics(reporting_year);
CREATE INDEX IF NOT EXISTS idx_company_sustainability_metrics_rating ON company_sustainability_metrics(sustainability_rating);

CREATE INDEX IF NOT EXISTS idx_company_certifications_company_id ON company_certifications(company_id);
CREATE INDEX IF NOT EXISTS idx_company_certifications_type ON company_certifications(certification_type);
CREATE INDEX IF NOT EXISTS idx_company_certifications_status ON company_certifications(status);

CREATE INDEX IF NOT EXISTS idx_company_waste_facilities_company_id ON company_waste_facilities(company_id);
CREATE INDEX IF NOT EXISTS idx_company_waste_facilities_type ON company_waste_facilities(facility_type);
CREATE INDEX IF NOT EXISTS idx_company_waste_facilities_status ON company_waste_facilities(operational_status);

-- Step 8: Update the company_profiles view (FIXED - removed risk_assessments reference)
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
    c.description,
    c.business_overview,
    c.website_url,
    c.founded_year,
    c.headquarters,
    c.revenue_usd,
    c.is_public,
    c.market_cap_usd,
    cm.reporting_period,
    cm.total_waste_generated,
    cm.total_waste_recovered,
    cm.recovery_rate,
    cm.hazardous_waste_generated,
    cm.non_hazardous_waste_generated,
    cwp.zero_waste_commitment,
    cwp.zero_waste_target_year,
    cwp.carbon_neutrality_commitment,
    cwp.carbon_neutrality_target_year,
    csm.esg_score,
    csm.sustainability_rating,
    csm.rating_agency,
    c.created_at,
    c.updated_at
FROM companies c
LEFT JOIN company_metrics cm ON c.id = cm.company_id
LEFT JOIN company_waste_profiles cwp ON c.id = cwp.company_id
LEFT JOIN company_sustainability_metrics csm ON c.id = csm.company_id;

-- Step 9: Create comprehensive company profile view
CREATE OR REPLACE VIEW comprehensive_company_profiles AS
SELECT 
    c.*,
    cwp.primary_waste_materials,
    cwp.waste_management_strategy,
    cwp.recycling_facilities_count,
    cwp.waste_treatment_methods,
    cwp.sustainability_goals,
    cwp.circular_economy_initiatives,
    cwp.waste_reduction_targets,
    csm.carbon_footprint_tonnes,
    csm.energy_consumption_gwh,
    csm.water_consumption_m3,
    csm.renewable_energy_percentage,
    csm.waste_to_landfill_percentage,
    csm.recycling_rate_percentage,
    csm.esg_score,
    csm.sustainability_rating,
    csm.rating_agency,
    csm.rating_date,
    csm.carbon_intensity,
    csm.water_intensity,
    csm.waste_intensity,
    (SELECT COUNT(*) FROM company_esg_documents ced WHERE ced.company_id = c.id) as esg_documents_count,
    (SELECT COUNT(*) FROM company_certifications cc WHERE cc.company_id = c.id AND cc.status = 'active') as active_certifications_count,
    (SELECT COUNT(*) FROM company_waste_facilities cwf WHERE cwf.company_id = c.id AND cwf.operational_status = 'operational') as operational_facilities_count
FROM companies c
LEFT JOIN company_waste_profiles cwp ON c.id = cwp.company_id
LEFT JOIN company_sustainability_metrics csm ON c.id = csm.company_id;

-- Step 10: Enable Row Level Security on new tables
ALTER TABLE company_waste_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_esg_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_sustainability_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_waste_facilities ENABLE ROW LEVEL SECURITY;

-- Step 11: Create RLS policies
CREATE POLICY "Allow all operations on company_waste_profiles" ON company_waste_profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations on company_esg_documents" ON company_esg_documents FOR ALL USING (true);
CREATE POLICY "Allow all operations on company_sustainability_metrics" ON company_sustainability_metrics FOR ALL USING (true);
CREATE POLICY "Allow all operations on company_certifications" ON company_certifications FOR ALL USING (true);
CREATE POLICY "Allow all operations on company_waste_facilities" ON company_waste_facilities FOR ALL USING (true);

-- Success message
SELECT 'Enhanced company profiles migration completed successfully!' as status;

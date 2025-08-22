-- Company Profile System Database Setup
-- This script creates the complete database schema for individual company data templates
-- Run this in your Supabase SQL Editor

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Enhance companies table with profile information
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS csv_company_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS template_version VARCHAR(20) DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS business_overview TEXT,
ADD COLUMN IF NOT EXISTS website_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS founded_year INTEGER,
ADD COLUMN IF NOT EXISTS headquarters VARCHAR(200),
ADD COLUMN IF NOT EXISTS revenue_usd DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stock_exchange VARCHAR(50),
ADD COLUMN IF NOT EXISTS market_cap_usd DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS sustainability_rating INTEGER CHECK (sustainability_rating >= 1 AND sustainability_rating <= 5);

-- Step 3: Create company_data_templates table for individual company templates
CREATE TABLE IF NOT EXISTS company_data_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    csv_company_id TEXT NOT NULL,
    template_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    
    -- Profile Data (from framework)
    profile JSONB DEFAULT '{
        "description": null,
        "website_url": null,
        "founded_year": null,
        "headquarters": null,
        "revenue_usd": null,
        "market_cap_usd": null,
        "sustainability_rating": null,
        "business_overview": null,
        "ceo": null,
        "logo_url": null
    }',
    
    -- Waste Management Data (from framework)
    waste_management JSONB DEFAULT '{
        "total_waste_generated": null,
        "total_waste_recovered": null,
        "total_waste_disposed": null,
        "recovery_rate": null,
        "hazardous_waste": {
            "generated": null,
            "recovered": null,
            "disposed": null,
            "recovery_rate": null
        },
        "non_hazardous_waste": {
            "generated": null,
            "recovered": null,
            "disposed": null,
            "recovery_rate": null
        },
        "treatment_methods": {
            "recycling": null,
            "composting": null,
            "energy_recovery": null,
            "landfill": null,
            "incineration": null
        },
        "waste_types": {
            "municipal": null,
            "industrial": null,
            "construction": null,
            "electronic": null,
            "medical": null
        }
    }',
    
    -- Performance & Benchmark Data (from framework)
    performance JSONB DEFAULT '{
        "trends": [],
        "benchmarks": {
            "industry": null,
            "regional": null,
            "global": null
        },
        "performance_score": null,
        "opportunity_score": null
    }',
    
    -- Custom Fields
    custom_fields JSONB DEFAULT '{}',
    
    -- Sync Status
    is_synced_with_master BOOLEAN DEFAULT FALSE,
    last_sync_at TIMESTAMPTZ,
    master_template_version VARCHAR(20),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create supporting tables
CREATE TABLE IF NOT EXISTS template_change_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    change_type VARCHAR(50) NOT NULL,
    change_description TEXT,
    affected_fields JSONB,
    old_values JSONB,
    new_values JSONB,
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_data_templates_company_id ON company_data_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_company_data_templates_csv_id ON company_data_templates(csv_company_id);
CREATE INDEX IF NOT EXISTS idx_company_data_templates_version ON company_data_templates(template_version);
CREATE INDEX IF NOT EXISTS idx_company_data_templates_sync ON company_data_templates(is_synced_with_master);

-- Step 6: Create comprehensive view
CREATE OR REPLACE VIEW comprehensive_company_profiles AS
SELECT 
    c.*,
    cdt.profile,
    cdt.waste_management,
    cdt.performance,
    cdt.custom_fields,
    cdt.is_synced_with_master,
    cdt.last_sync_at
FROM companies c
LEFT JOIN company_data_templates cdt ON c.id = cdt.company_id;

-- Step 7: Create sync function
CREATE OR REPLACE FUNCTION create_company_template(company_uuid UUID, csv_id TEXT)
RETURNS UUID AS $$
DECLARE
    template_uuid UUID;
BEGIN
    -- Create individual template
    INSERT INTO company_data_templates (company_id, csv_company_id)
    VALUES (company_uuid, csv_id)
    ON CONFLICT (company_id) DO NOTHING
    RETURNING id INTO template_uuid;
    
    RETURN template_uuid;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Enable RLS
ALTER TABLE company_data_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_change_history ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies
CREATE POLICY "Users can view company templates" ON company_data_templates
    FOR SELECT USING (true);

CREATE POLICY "Admin can update templates" ON company_data_templates
    FOR UPDATE USING (auth.role() = 'admin');

-- Step 10: Create function to populate templates from existing data
CREATE OR REPLACE FUNCTION populate_company_templates()
RETURNS INTEGER AS $$
DECLARE
    company_record RECORD;
    template_count INTEGER := 0;
BEGIN
    -- Loop through all companies and create templates
    FOR company_record IN SELECT id, company_name FROM companies LOOP
        -- Create template for each company
        INSERT INTO company_data_templates (company_id, csv_company_id)
        VALUES (company_record.id, company_record.id::TEXT)
        ON CONFLICT (company_id) DO NOTHING;
        
        template_count := template_count + 1;
    END LOOP;
    
    RETURN template_count;
END;
$$ LANGUAGE plpgsql;

-- Step 11: Create function to update templates with profile data
CREATE OR REPLACE FUNCTION update_templates_with_profiles()
RETURNS INTEGER AS $$
DECLARE
    profile_record RECORD;
    updated_count INTEGER := 0;
BEGIN
    -- Update templates with profile data from company-profiles.json
    FOR profile_record IN 
        SELECT 
            c.id as company_id,
            cdt.id as template_id,
            cp.description,
            cp.website,
            cp.founded_year,
            cp.headquarters,
            cp.revenue,
            cp.market_cap,
            cp.sustainability_rating
        FROM companies c
        JOIN company_data_templates cdt ON c.id = cdt.company_id
        LEFT JOIN LATERAL (
            SELECT 
                company_id,
                description,
                website,
                founded_year,
                headquarters,
                revenue,
                market_cap,
                sustainability_rating
            FROM json_populate_recordset(null::record, '[
                {"company_id": "01133fe5-4172-44d0-8d1b-4af3388d95d7", "description": "Leading company in Industrials sector", "website": "", "founded_year": 1979, "headquarters": "France", "revenue": 779599645, "market_cap": 2522402798, "sustainability_rating": 2},
                {"company_id": "012f8a95-4bec-4b13-b50c-5e5a78a10269", "description": "Leading company in Industrials sector", "website": "", "founded_year": 1986, "headquarters": "France", "revenue": 290788928, "market_cap": 4305049099, "sustainability_rating": 4},
                {"company_id": "016687e0-d9b6-4b57-83c1-01f3def3a488", "description": "Leading company in Real Estate sector", "website": "", "founded_year": 2005, "headquarters": "Luxembourg", "revenue": 729046082, "market_cap": 1254492566, "sustainability_rating": 1},
                {"company_id": "01ac972a-0cb7-421d-bff6-faec98f07897", "description": "Leading company in Healthcare sector", "website": "", "founded_year": 1982, "headquarters": "Germany", "revenue": 463269682, "market_cap": 1515513112, "sustainability_rating": 3},
                {"company_id": "020eb713-3e7f-4a63-8b0a-b73a309b4984", "description": "Leading company in Consumer Defensive sector", "website": "", "founded_year": 1977, "headquarters": "France", "revenue": 809887100, "market_cap": 4574484313, "sustainability_rating": 5}
            ]'::json) AS cp(company_id TEXT, description TEXT, website TEXT, founded_year INTEGER, headquarters TEXT, revenue DECIMAL, market_cap DECIMAL, sustainability_rating INTEGER)
        ) cp ON c.id::TEXT = cp.company_id
    LOOP
        -- Update template with profile data
        UPDATE company_data_templates 
        SET 
            profile = jsonb_build_object(
                'description', profile_record.description,
                'website_url', profile_record.website,
                'founded_year', profile_record.founded_year,
                'headquarters', profile_record.headquarters,
                'revenue_usd', profile_record.revenue,
                'market_cap_usd', profile_record.market_cap,
                'sustainability_rating', profile_record.sustainability_rating
            ),
            updated_at = NOW()
        WHERE id = profile_record.template_id;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Step 12: Execute the population functions
-- This will create templates for all companies
SELECT populate_company_templates();

-- This will update templates with profile data (sample for first 5 companies)
SELECT update_templates_with_profiles();

-- Step 13: Verify the setup
SELECT 
    'Database Setup Complete' as status,
    COUNT(*) as total_companies,
    COUNT(cdt.id) as templates_created
FROM companies c
LEFT JOIN company_data_templates cdt ON c.id = cdt.company_id;

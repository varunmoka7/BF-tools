-- Enhanced Company Profile System Database Migration
-- Run this in your Supabase SQL Editor

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Enhance companies table
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

-- Step 3: Create company_data_templates table
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

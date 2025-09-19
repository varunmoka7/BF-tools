-- Simple Database Migration: Add Company Enrichment Fields
-- Run each statement one by one in Supabase SQL editor

-- Step 1: Add enrichment columns to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry_detail TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS founded_year TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS headquarters TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_size TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'Manual';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS last_enriched TIMESTAMP WITH TIME ZONE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'pending';

-- Step 2: Add constraint for enrichment_status
ALTER TABLE companies ADD CONSTRAINT check_enrichment_status
CHECK (enrichment_status IN ('pending', 'enriched', 'failed', 'manual'));

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_companies_enrichment_status ON companies(enrichment_status);
CREATE INDEX IF NOT EXISTS idx_companies_last_enriched ON companies(last_enriched);
CREATE INDEX IF NOT EXISTS idx_companies_data_source ON companies(data_source);

-- Step 4: Update existing companies
UPDATE companies
SET enrichment_status = 'pending', data_source = 'Generated'
WHERE description IS NULL OR description = '';

-- Step 5: Create enrichment log table
CREATE TABLE IF NOT EXISTS company_enrichment_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    enrichment_source TEXT NOT NULL,
    enrichment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN NOT NULL,
    error_message TEXT,
    data_retrieved JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create indexes for log table
CREATE INDEX IF NOT EXISTS idx_enrichment_log_company_id ON company_enrichment_log(company_id);
CREATE INDEX IF NOT EXISTS idx_enrichment_log_date ON company_enrichment_log(enrichment_date);
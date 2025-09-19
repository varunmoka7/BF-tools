-- Database Migration: Add Company Enrichment Fields (FIXED FOR UUID)
-- Run this in your Supabase SQL editor to add enrichment capabilities

-- Add enrichment fields to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS industry_detail TEXT,
ADD COLUMN IF NOT EXISTS founded_year TEXT,
ADD COLUMN IF NOT EXISTS headquarters TEXT,
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'Manual',
ADD COLUMN IF NOT EXISTS last_enriched TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'pending' CHECK (enrichment_status IN ('pending', 'enriched', 'failed', 'manual'));

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_companies_enrichment_status ON companies(enrichment_status);
CREATE INDEX IF NOT EXISTS idx_companies_last_enriched ON companies(last_enriched);
CREATE INDEX IF NOT EXISTS idx_companies_data_source ON companies(data_source);

-- Add comments for documentation
COMMENT ON COLUMN companies.description IS 'Real company description from external APIs or manual input';
COMMENT ON COLUMN companies.industry_detail IS 'Detailed industry classification from external sources';
COMMENT ON COLUMN companies.founded_year IS 'Company founding year from external sources';
COMMENT ON COLUMN companies.headquarters IS 'Company headquarters location';
COMMENT ON COLUMN companies.data_source IS 'Source of enrichment data (Companies House, OpenCorporates, Manual, etc.)';
COMMENT ON COLUMN companies.last_enriched IS 'Timestamp of last successful enrichment';
COMMENT ON COLUMN companies.enrichment_status IS 'Status of enrichment process';

-- Optional: Update existing companies to mark them as needing enrichment
UPDATE companies
SET enrichment_status = 'pending',
    data_source = 'Generated'
WHERE description IS NULL OR description = '';

-- Create enrichment log table for audit trail (FIXED: using UUID for company_id)
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

-- Add index for enrichment log
CREATE INDEX IF NOT EXISTS idx_enrichment_log_company_id ON company_enrichment_log(company_id);
CREATE INDEX IF NOT EXISTS idx_enrichment_log_date ON company_enrichment_log(enrichment_date);

COMMENT ON TABLE company_enrichment_log IS 'Audit trail for company enrichment activities';
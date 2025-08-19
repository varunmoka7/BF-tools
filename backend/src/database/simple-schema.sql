-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    isin TEXT,
    lei TEXT,
    figi TEXT,
    ticker TEXT,
    mic_code TEXT,
    exchange TEXT,
    perm_id TEXT,
    company_name TEXT NOT NULL,
    country TEXT NOT NULL,
    sector TEXT NOT NULL,
    industry TEXT NOT NULL,
    employees INTEGER,
    year_of_disclosure INTEGER NOT NULL,
    document_id TEXT,
    document_urls JSONB DEFAULT '[]'::jsonb,
    source_names JSONB DEFAULT '[]'::jsonb,
    source_urls JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create waste_streams table
CREATE TABLE waste_streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    reporting_period INTEGER NOT NULL,
    metric TEXT NOT NULL,
    hazardousness TEXT NOT NULL,
    treatment_method TEXT NOT NULL,
    value DECIMAL(15,2) NOT NULL,
    unit TEXT NOT NULL DEFAULT 'Metric Tonnes',
    incomplete_boundaries TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create company_metrics table
CREATE TABLE company_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    reporting_period INTEGER NOT NULL,
    total_waste_generated DECIMAL(15,2) DEFAULT 0,
    total_waste_recovered DECIMAL(15,2) DEFAULT 0,
    total_waste_disposed DECIMAL(15,2) DEFAULT 0,
    hazardous_waste_generated DECIMAL(15,2) DEFAULT 0,
    hazardous_waste_recovered DECIMAL(15,2) DEFAULT 0,
    hazardous_waste_disposed DECIMAL(15,2) DEFAULT 0,
    non_hazardous_waste_generated DECIMAL(15,2) DEFAULT 0,
    non_hazardous_waste_recovered DECIMAL(15,2) DEFAULT 0,
    non_hazardous_waste_disposed DECIMAL(15,2) DEFAULT 0,
    recovery_rate DECIMAL(5,2) DEFAULT 0,
    hazardous_recovery_rate DECIMAL(5,2) DEFAULT 0,
    non_hazardous_recovery_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Add foreign key constraints
ALTER TABLE waste_streams 
ADD CONSTRAINT fk_waste_streams_company 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE company_metrics 
ADD CONSTRAINT fk_company_metrics_company 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Step 6: Add unique constraint
ALTER TABLE company_metrics 
ADD CONSTRAINT unique_company_period 
UNIQUE(company_id, reporting_period);

-- Step 7: Create indexes
CREATE INDEX idx_companies_country ON companies(country);
CREATE INDEX idx_companies_sector ON companies(sector);
CREATE INDEX idx_waste_streams_company_id ON waste_streams(company_id);
CREATE INDEX idx_company_metrics_company_id ON company_metrics(company_id);
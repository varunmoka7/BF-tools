-- Waste Intelligence Platform - PostgreSQL Schema for Supabase
-- Optimized for performance, scalability, and real-time features

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security by default
ALTER DATABASE postgres SET "app.jwt_secret" = 'your-jwt-secret';

-- Companies table - Master company data
CREATE TABLE IF NOT EXISTS companies (
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

-- Waste streams table - Detailed waste metrics
CREATE TABLE IF NOT EXISTS waste_streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
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

-- Aggregated company metrics for fast queries
CREATE TABLE IF NOT EXISTS company_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
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
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, reporting_period)
);

-- Country aggregations for world map data
CREATE TABLE IF NOT EXISTS country_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country TEXT NOT NULL UNIQUE,
    total_companies INTEGER DEFAULT 0,
    total_waste_generated DECIMAL(15,2) DEFAULT 0,
    total_waste_recovered DECIMAL(15,2) DEFAULT 0,
    total_waste_disposed DECIMAL(15,2) DEFAULT 0,
    average_recovery_rate DECIMAL(5,2) DEFAULT 0,
    top_sectors JSONB DEFAULT '[]'::jsonb,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Sector aggregations for leaderboards
CREATE TABLE IF NOT EXISTS sector_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sector TEXT NOT NULL UNIQUE,
    total_companies INTEGER DEFAULT 0,
    total_waste_generated DECIMAL(15,2) DEFAULT 0,
    average_recovery_rate DECIMAL(5,2) DEFAULT 0,
    top_countries JSONB DEFAULT '[]'::jsonb,
    top_performers JSONB DEFAULT '[]'::jsonb,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunity scoring for business intelligence
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    opportunity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    potential_value DECIMAL(15,2) DEFAULT 0,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    implementation_complexity TEXT DEFAULT 'medium' CHECK (implementation_complexity IN ('low', 'medium', 'high')),
    payback_period DECIMAL(5,2) DEFAULT 0,
    carbon_impact DECIMAL(15,2) DEFAULT 0,
    status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'qualified', 'in_progress', 'completed', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risk assessments
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    overall_score DECIMAL(5,2) DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
    compliance_risk TEXT DEFAULT 'medium' CHECK (compliance_risk IN ('low', 'medium', 'high')),
    operational_risk TEXT DEFAULT 'medium' CHECK (operational_risk IN ('low', 'medium', 'high')),
    financial_risk TEXT DEFAULT 'medium' CHECK (financial_risk IN ('low', 'medium', 'high')),
    reputational_risk TEXT DEFAULT 'medium' CHECK (reputational_risk IN ('low', 'medium', 'high')),
    assessment_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market sizing data
CREATE TABLE IF NOT EXISTS market_sizing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region TEXT NOT NULL,
    sector TEXT,
    total_waste DECIMAL(15,2) DEFAULT 0,
    recovery_gap DECIMAL(15,2) DEFAULT 0,
    market_value DECIMAL(15,2) DEFAULT 0,
    servicable_market DECIMAL(15,2) DEFAULT 0,
    competitor_count INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead generation tracking
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    opportunity_value DECIMAL(15,2) DEFAULT 0,
    readiness_score DECIMAL(5,2) DEFAULT 0 CHECK (readiness_score >= 0 AND readiness_score <= 100),
    contact_email TEXT,
    contact_phone TEXT,
    decision_maker_name TEXT,
    decision_maker_title TEXT,
    next_action TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_companies_country ON companies(country);
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies USING gin(company_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at);

CREATE INDEX IF NOT EXISTS idx_waste_streams_company_id ON waste_streams(company_id);
CREATE INDEX IF NOT EXISTS idx_waste_streams_period ON waste_streams(reporting_period);
CREATE INDEX IF NOT EXISTS idx_waste_streams_metric ON waste_streams(metric);
CREATE INDEX IF NOT EXISTS idx_waste_streams_hazardousness ON waste_streams(hazardousness);
CREATE INDEX IF NOT EXISTS idx_waste_streams_created_at ON waste_streams(created_at);

CREATE INDEX IF NOT EXISTS idx_company_metrics_company_id ON company_metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_company_metrics_period ON company_metrics(reporting_period);
CREATE INDEX IF NOT EXISTS idx_company_metrics_recovery_rate ON company_metrics(recovery_rate);
CREATE INDEX IF NOT EXISTS idx_company_metrics_waste_generated ON company_metrics(total_waste_generated);

CREATE INDEX IF NOT EXISTS idx_opportunities_company_id ON opportunities(company_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_priority ON opportunities(priority);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_readiness_score ON leads(readiness_score);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Full-text search indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_companies_name_search ON companies USING gin(company_name gin_trgm_ops);

-- Views for common queries
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
    cm.reporting_period,
    cm.total_waste_generated,
    cm.total_waste_recovered,
    cm.recovery_rate,
    cm.hazardous_waste_generated,
    cm.non_hazardous_waste_generated,
    COALESCE(ra.overall_score, 0) as risk_score,
    COALESCE(ra.compliance_risk, 'medium') as compliance_risk,
    c.created_at,
    c.updated_at
FROM companies c
LEFT JOIN company_metrics cm ON c.id = cm.company_id
LEFT JOIN risk_assessments ra ON c.id = ra.company_id;

CREATE OR REPLACE VIEW sector_leaderboard AS
SELECT 
    sector,
    COUNT(DISTINCT company_id) as company_count,
    AVG(recovery_rate) as avg_recovery_rate,
    SUM(total_waste_generated) as total_waste,
    MAX(recovery_rate) as best_recovery_rate,
    MIN(recovery_rate) as worst_recovery_rate
FROM company_profiles
WHERE recovery_rate > 0
GROUP BY sector
ORDER BY avg_recovery_rate DESC;

CREATE OR REPLACE VIEW country_leaderboard AS
SELECT 
    country,
    COUNT(DISTINCT id) as company_count,
    AVG(recovery_rate) as avg_recovery_rate,
    SUM(total_waste_generated) as total_waste,
    MAX(recovery_rate) as best_recovery_rate,
    MIN(recovery_rate) as worst_recovery_rate
FROM company_profiles
WHERE recovery_rate > 0
GROUP BY country
ORDER BY avg_recovery_rate DESC;

CREATE OR REPLACE VIEW top_opportunities AS
SELECT 
    o.id,
    o.company_id,
    c.company_name,
    c.country,
    c.sector,
    o.opportunity_type,
    o.potential_value,
    o.priority,
    o.status,
    cm.total_waste_generated,
    cm.recovery_rate,
    o.created_at
FROM opportunities o
JOIN companies c ON o.company_id = c.id
LEFT JOIN company_metrics cm ON c.id = cm.company_id
ORDER BY o.potential_value DESC, 
         CASE o.priority 
           WHEN 'critical' THEN 4
           WHEN 'high' THEN 3
           WHEN 'medium' THEN 2
           WHEN 'low' THEN 1
         END DESC;

-- Materialized view for dashboard performance
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_summary AS
SELECT 
    COUNT(DISTINCT c.id) as total_companies,
    COUNT(DISTINCT c.country) as total_countries,
    COUNT(DISTINCT c.sector) as total_sectors,
    SUM(cm.total_waste_generated) as total_waste_generated,
    SUM(cm.total_waste_recovered) as total_waste_recovered,
    AVG(cm.recovery_rate) as avg_recovery_rate,
    COUNT(DISTINCT o.id) as total_opportunities,
    SUM(o.potential_value) as total_opportunity_value,
    COUNT(DISTINCT l.id) as total_leads,
    COUNT(DISTINCT CASE WHEN l.status IN ('qualified', 'proposal', 'negotiation') THEN l.id END) as active_leads
FROM companies c
LEFT JOIN company_metrics cm ON c.id = cm.company_id
LEFT JOIN opportunities o ON c.id = o.company_id
LEFT JOIN leads l ON c.id = l.company_id;

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_dashboard_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW dashboard_summary;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to all tables with updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waste_streams_updated_at BEFORE UPDATE ON waste_streams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_metrics_updated_at BEFORE UPDATE ON company_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_assessments_updated_at BEFORE UPDATE ON risk_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Default policies (allow all for now, customize later)
CREATE POLICY "Allow all operations on companies" ON companies FOR ALL USING (true);
CREATE POLICY "Allow all operations on waste_streams" ON waste_streams FOR ALL USING (true);
CREATE POLICY "Allow all operations on company_metrics" ON company_metrics FOR ALL USING (true);
CREATE POLICY "Allow all operations on opportunities" ON opportunities FOR ALL USING (true);
CREATE POLICY "Allow all operations on risk_assessments" ON risk_assessments FOR ALL USING (true);
CREATE POLICY "Allow all operations on leads" ON leads FOR ALL USING (true);

-- Create initial materialized view data
SELECT refresh_dashboard_summary();

-- Comments for documentation
COMMENT ON TABLE companies IS 'Master table for company information and metadata';
COMMENT ON TABLE waste_streams IS 'Detailed waste metrics and measurements';
COMMENT ON TABLE company_metrics IS 'Aggregated metrics for dashboard performance';
COMMENT ON TABLE opportunities IS 'Business opportunities for lead generation';
COMMENT ON TABLE leads IS 'Sales lead tracking and management';
COMMENT ON VIEW company_profiles IS 'Comprehensive company view with metrics and risk data';
COMMENT ON MATERIALIZED VIEW dashboard_summary IS 'High-level KPIs for dashboard performance';
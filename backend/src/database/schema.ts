/**
 * Database schema definitions and setup for Waste Intelligence Platform
 */

export const createTablesSQL = `
-- Companies table - Master company data
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
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
    document_urls TEXT, -- JSON array as text
    source_names TEXT,  -- JSON array as text
    source_urls TEXT,   -- JSON array as text
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Waste streams table - Detailed waste metrics
CREATE TABLE IF NOT EXISTS waste_streams (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    reporting_period INTEGER NOT NULL,
    metric TEXT NOT NULL,
    hazardousness TEXT NOT NULL,
    treatment_method TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL DEFAULT 'Metric Tonnes',
    incomplete_boundaries TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies (id)
);

-- Aggregated company metrics for fast queries
CREATE TABLE IF NOT EXISTS company_metrics (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    reporting_period INTEGER NOT NULL,
    total_waste_generated REAL DEFAULT 0,
    total_waste_recovered REAL DEFAULT 0,
    total_waste_disposed REAL DEFAULT 0,
    hazardous_waste_generated REAL DEFAULT 0,
    hazardous_waste_recovered REAL DEFAULT 0,
    hazardous_waste_disposed REAL DEFAULT 0,
    non_hazardous_waste_generated REAL DEFAULT 0,
    non_hazardous_waste_recovered REAL DEFAULT 0,
    non_hazardous_waste_disposed REAL DEFAULT 0,
    recovery_rate REAL DEFAULT 0,
    hazardous_recovery_rate REAL DEFAULT 0,
    non_hazardous_recovery_rate REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies (id),
    UNIQUE(company_id, reporting_period)
);

-- Country aggregations for world map data
CREATE TABLE IF NOT EXISTS country_stats (
    id TEXT PRIMARY KEY,
    country TEXT NOT NULL UNIQUE,
    total_companies INTEGER DEFAULT 0,
    total_waste_generated REAL DEFAULT 0,
    total_waste_recovered REAL DEFAULT 0,
    total_waste_disposed REAL DEFAULT 0,
    average_recovery_rate REAL DEFAULT 0,
    top_sectors TEXT, -- JSON array
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sector aggregations for leaderboards
CREATE TABLE IF NOT EXISTS sector_stats (
    id TEXT PRIMARY KEY,
    sector TEXT NOT NULL UNIQUE,
    total_companies INTEGER DEFAULT 0,
    total_waste_generated REAL DEFAULT 0,
    average_recovery_rate REAL DEFAULT 0,
    top_countries TEXT, -- JSON array
    top_performers TEXT, -- JSON array of company IDs
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Opportunity scoring for business intelligence
CREATE TABLE IF NOT EXISTS opportunities (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    opportunity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    potential_value REAL DEFAULT 0,
    priority TEXT DEFAULT 'medium',
    implementation_complexity TEXT DEFAULT 'medium',
    payback_period REAL DEFAULT 0,
    carbon_impact REAL DEFAULT 0,
    status TEXT DEFAULT 'identified',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies (id)
);

-- Risk assessments
CREATE TABLE IF NOT EXISTS risk_assessments (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    overall_score REAL DEFAULT 0,
    compliance_risk TEXT DEFAULT 'medium',
    operational_risk TEXT DEFAULT 'medium',
    financial_risk TEXT DEFAULT 'medium',
    reputational_risk TEXT DEFAULT 'medium',
    assessment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies (id)
);

-- Market sizing data
CREATE TABLE IF NOT EXISTS market_sizing (
    id TEXT PRIMARY KEY,
    region TEXT NOT NULL,
    sector TEXT,
    total_waste REAL DEFAULT 0,
    recovery_gap REAL DEFAULT 0,
    market_value REAL DEFAULT 0,
    servicable_market REAL DEFAULT 0,
    competitor_count INTEGER DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lead generation tracking
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    opportunity_value REAL DEFAULT 0,
    readiness_score REAL DEFAULT 0,
    contact_email TEXT,
    contact_phone TEXT,
    decision_maker_name TEXT,
    decision_maker_title TEXT,
    next_action TEXT,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies (id)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_companies_country ON companies(country);
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(company_name);

CREATE INDEX IF NOT EXISTS idx_waste_streams_company_id ON waste_streams(company_id);
CREATE INDEX IF NOT EXISTS idx_waste_streams_period ON waste_streams(reporting_period);
CREATE INDEX IF NOT EXISTS idx_waste_streams_metric ON waste_streams(metric);
CREATE INDEX IF NOT EXISTS idx_waste_streams_hazardousness ON waste_streams(hazardousness);

CREATE INDEX IF NOT EXISTS idx_company_metrics_company_id ON company_metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_company_metrics_period ON company_metrics(reporting_period);
CREATE INDEX IF NOT EXISTS idx_company_metrics_recovery_rate ON company_metrics(recovery_rate);
CREATE INDEX IF NOT EXISTS idx_company_metrics_waste_generated ON company_metrics(total_waste_generated);

CREATE INDEX IF NOT EXISTS idx_opportunities_company_id ON opportunities(company_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_priority ON opportunities(priority);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_readiness_score ON leads(readiness_score);

-- Views for common queries
CREATE VIEW IF NOT EXISTS company_profiles AS
SELECT 
    c.id,
    c.company_name,
    c.country,
    c.sector,
    c.industry,
    c.employees,
    cm.reporting_period,
    cm.total_waste_generated,
    cm.total_waste_recovered,
    cm.recovery_rate,
    cm.hazardous_waste_generated,
    cm.non_hazardous_waste_generated,
    COALESCE(ra.overall_score, 0) as risk_score,
    COALESCE(ra.compliance_risk, 'medium') as compliance_risk
FROM companies c
LEFT JOIN company_metrics cm ON c.id = cm.company_id
LEFT JOIN risk_assessments ra ON c.id = ra.company_id;

CREATE VIEW IF NOT EXISTS sector_leaderboard AS
SELECT 
    sector,
    COUNT(DISTINCT company_id) as company_count,
    AVG(recovery_rate) as avg_recovery_rate,
    SUM(total_waste_generated) as total_waste,
    MAX(recovery_rate) as best_recovery_rate
FROM company_profiles
WHERE recovery_rate > 0
GROUP BY sector
ORDER BY avg_recovery_rate DESC;

CREATE VIEW IF NOT EXISTS country_leaderboard AS
SELECT 
    country,
    COUNT(DISTINCT id) as company_count,
    AVG(recovery_rate) as avg_recovery_rate,
    SUM(total_waste_generated) as total_waste,
    MAX(recovery_rate) as best_recovery_rate
FROM company_profiles
WHERE recovery_rate > 0
GROUP BY country
ORDER BY avg_recovery_rate DESC;

CREATE VIEW IF NOT EXISTS top_opportunities AS
SELECT 
    o.id,
    o.company_id,
    c.company_name,
    c.country,
    c.sector,
    o.opportunity_type,
    o.potential_value,
    o.priority,
    cm.total_waste_generated,
    cm.recovery_rate
FROM opportunities o
JOIN companies c ON o.company_id = c.id
LEFT JOIN company_metrics cm ON c.id = cm.company_id
ORDER BY o.potential_value DESC, o.priority DESC;
`;

export const dropTablesSQL = `
DROP VIEW IF EXISTS top_opportunities;
DROP VIEW IF EXISTS country_leaderboard;
DROP VIEW IF EXISTS sector_leaderboard;
DROP VIEW IF EXISTS company_profiles;

DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS market_sizing;
DROP TABLE IF EXISTS risk_assessments;
DROP TABLE IF EXISTS opportunities;
DROP TABLE IF EXISTS sector_stats;
DROP TABLE IF EXISTS country_stats;
DROP TABLE IF EXISTS company_metrics;
DROP TABLE IF EXISTS waste_streams;
DROP TABLE IF EXISTS companies;
`;

export const sampleDataSQL = `
-- Insert sample data for testing
INSERT OR IGNORE INTO companies (id, company_name, country, sector, industry, employees, year_of_disclosure) VALUES
('test-company-1', 'Test Manufacturing Corp', 'Germany', 'Industrials', 'Manufacturing', 5000, 2024),
('test-company-2', 'Green Energy Solutions', 'France', 'Energy', 'Renewable Energy', 2500, 2024),
('test-company-3', 'Sustainable Tech Inc', 'Switzerland', 'Technology', 'Software', 1200, 2024);

INSERT OR IGNORE INTO company_metrics (id, company_id, reporting_period, total_waste_generated, total_waste_recovered, total_waste_disposed, recovery_rate) VALUES
('metric-1', 'test-company-1', 2024, 10000, 7500, 2500, 75.0),
('metric-2', 'test-company-2', 2024, 5000, 4200, 800, 84.0),
('metric-3', 'test-company-3', 2024, 500, 350, 150, 70.0);

INSERT OR IGNORE INTO opportunities (id, company_id, opportunity_type, title, potential_value, priority) VALUES
('opp-1', 'test-company-1', 'recovery_improvement', 'Improve Metal Recovery Process', 250000, 'high'),
('opp-2', 'test-company-2', 'cost_reduction', 'Optimize Waste Transport Routes', 75000, 'medium'),
('opp-3', 'test-company-3', 'new_revenue_stream', 'Sell Recyclable Electronics', 45000, 'medium');
`;
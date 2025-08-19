# Data Management

Centralized data storage, management, and processing for the BF-Tools waste intelligence platform.

## 📁 Directory Structure

```
data/
├── datasets/           # Raw data files and imports
│   ├── csv/           # CSV data files
│   ├── json/          # JSON data files
│   ├── samples/       # Sample datasets for testing
│   └── imports/       # Imported data staging area
├── migrations/        # Database migration files
│   ├── up/           # Migration scripts (up)
│   ├── down/         # Rollback scripts (down)
│   └── seeds/        # Data seeding scripts
├── backups/          # Database backups and exports
│   ├── daily/        # Daily automated backups
│   ├── weekly/       # Weekly backups
│   └── manual/       # Manual backup files
├── schemas/          # Data schemas and definitions
│   ├── json-schema/  # JSON schema definitions
│   ├── sql/          # SQL schema files
│   └── validation/   # Data validation rules
└── scripts/          # Data processing scripts
    ├── import/       # Data import scripts
    ├── export/       # Data export scripts
    ├── transform/    # Data transformation scripts
    └── cleanup/      # Data cleanup utilities
```

## 📊 Dataset Management

### Sample Data (`datasets/samples/`)

#### Waste Management Sample Data
- **File**: `waste-management-sample-data.csv`
- **Size**: ~10MB
- **Records**: 50,000+ waste data entries
- **Coverage**: Global companies across all sectors
- **Time Range**: 2020-2024

**Schema**:
```csv
company_id,company_name,sector,region,waste_type,quantity,unit,date,recycled,ghg_emissions,cost
```

#### Company Profiles
- **File**: `company-profiles.json`
- **Records**: 1,000+ companies
- **Attributes**: Name, sector, size, location, compliance scores

#### Sector Definitions
- **File**: `sectors.json`
- **Records**: 50+ industry sectors
- **Attributes**: Regulations, waste types, benchmarks

### Import Staging (`datasets/imports/`)

Raw data files awaiting processing:
- CSV uploads from users
- External API data pulls
- Batch import files
- Data validation reports

### Processing Pipeline

```
Raw Data → Validation → Transformation → Storage → Backup
    ↓           ↓            ↓            ↓         ↓
 Format     Schema      Normalize    Database   Archive
 Check      Check       & Clean      Insert     & Index
```

## 🗄️ Database Migrations

### Migration Strategy
- **Sequential**: Numbered migration files (001, 002, etc.)
- **Reversible**: Each migration has up/down scripts
- **Atomic**: Transactions ensure data integrity
- **Trackable**: Migration history in database

### Migration Files (`migrations/`)

#### Structure
```
migrations/
├── up/
│   ├── 001_create_initial_schema.sql
│   ├── 002_add_waste_data_table.sql
│   ├── 003_add_companies_table.sql
│   └── 004_add_compliance_tracking.sql
├── down/
│   ├── 001_drop_initial_schema.sql
│   ├── 002_drop_waste_data_table.sql
│   ├── 003_drop_companies_table.sql
│   └── 004_drop_compliance_tracking.sql
└── seeds/
    ├── 001_seed_sectors.sql
    ├── 002_seed_regions.sql
    └── 003_seed_sample_data.sql
```

#### Example Migration (`up/001_create_initial_schema.sql`)
```sql
-- Create initial database schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sectors table
CREATE TABLE sectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    average_recycling_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    sector_id UUID REFERENCES sectors(id),
    region VARCHAR(100) NOT NULL,
    size_category VARCHAR(20) NOT NULL,
    waste_generation_rate DECIMAL(10,2) DEFAULT 0,
    recycling_rate DECIMAL(5,2) DEFAULT 0,
    compliance_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create waste_data table
CREATE TABLE waste_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    waste_type VARCHAR(50) NOT NULL,
    quantity DECIMAL(12,2) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(200),
    recycled BOOLEAN DEFAULT FALSE,
    disposed BOOLEAN DEFAULT FALSE,
    ghg_emissions DECIMAL(10,4),
    cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_companies_sector ON companies(sector_id);
CREATE INDEX idx_companies_region ON companies(region);
CREATE INDEX idx_waste_data_company ON waste_data(company_id);
CREATE INDEX idx_waste_data_date ON waste_data(date);
CREATE INDEX idx_waste_data_type ON waste_data(waste_type);
```

### Running Migrations
```bash
# Run all pending migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down

# Reset database (all down, then all up)
npm run migrate:reset

# Seed database with sample data
npm run migrate:seed
```

## 💾 Backup Strategy

### Automated Backups (`backups/`)

#### Daily Backups
- **Schedule**: Every day at 2 AM UTC
- **Retention**: 30 days
- **Format**: PostgreSQL dump with compression
- **Location**: `backups/daily/`

#### Weekly Backups
- **Schedule**: Every Sunday at 1 AM UTC
- **Retention**: 12 weeks
- **Format**: Full database dump
- **Location**: `backups/weekly/`

#### Backup Naming Convention
```
daily/bf_tools_backup_YYYY-MM-DD.sql.gz
weekly/bf_tools_backup_YYYY-WW.sql.gz
manual/bf_tools_backup_YYYY-MM-DD_HH-MM-SS.sql.gz
```

### Backup Commands
```bash
# Create manual backup
npm run backup:create

# Restore from backup
npm run backup:restore [backup-file]

# List available backups
npm run backup:list

# Cleanup old backups
npm run backup:cleanup
```

## 📋 Data Schemas

### JSON Schema Definitions (`schemas/json-schema/`)

#### Waste Data Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Waste Data",
  "type": "object",
  "properties": {
    "companyId": {
      "type": "string",
      "format": "uuid"
    },
    "wasteType": {
      "type": "string",
      "enum": ["organic", "plastic", "paper", "metal", "glass", "electronic", "hazardous", "other"]
    },
    "quantity": {
      "type": "number",
      "minimum": 0,
      "exclusiveMinimum": true
    },
    "unit": {
      "type": "string",
      "enum": ["kg", "tonnes", "lbs", "m³", "L"]
    },
    "date": {
      "type": "string",
      "format": "date"
    }
  },
  "required": ["companyId", "wasteType", "quantity", "unit", "date"]
}
```

### SQL Schema Files (`schemas/sql/`)

Complete database schema definitions:
- `tables.sql` - All table definitions
- `indexes.sql` - Database indexes
- `constraints.sql` - Foreign keys and constraints
- `views.sql` - Database views
- `functions.sql` - Stored procedures and functions

## 🔄 Data Processing Scripts

### Import Scripts (`scripts/import/`)

#### CSV Import (`import-csv.js`)
```javascript
const importCSV = async (filePath, tableName, options = {}) => {
  // Validate CSV format
  const validation = await validateCSVSchema(filePath, tableName);
  if (!validation.isValid) {
    throw new Error(`Invalid CSV: ${validation.errors.join(', ')}`);
  }
  
  // Transform data
  const transformedData = await transformCSVData(filePath, options.transform);
  
  // Batch insert
  const result = await batchInsert(tableName, transformedData, options.batchSize || 1000);
  
  return {
    imported: result.rowCount,
    errors: result.errors,
    duration: result.duration
  };
};
```

#### JSON Import (`import-json.js`)
```javascript
const importJSON = async (filePath, tableName, options = {}) => {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Validate against JSON schema
  const validation = validateJSONSchema(data, tableName);
  if (!validation.isValid) {
    throw new Error(`Invalid JSON: ${validation.errors.join(', ')}`);
  }
  
  // Process in chunks
  const chunks = chunkArray(data, options.chunkSize || 100);
  const results = [];
  
  for (const chunk of chunks) {
    const result = await processChunk(chunk, tableName);
    results.push(result);
  }
  
  return aggregateResults(results);
};
```

### Export Scripts (`scripts/export/`)

#### Data Export (`export-data.js`)
```javascript
const exportData = async (query, format, options = {}) => {
  const data = await executeQuery(query);
  
  switch (format) {
    case 'csv':
      return exportToCSV(data, options);
    case 'json':
      return exportToJSON(data, options);
    case 'excel':
      return exportToExcel(data, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
};
```

### Transformation Scripts (`scripts/transform/`)

#### Data Normalization
- Unit conversion (kg to tonnes, etc.)
- Date format standardization
- Company name deduplication
- Sector classification

#### Data Enrichment
- GHG emissions calculation
- Compliance score computation
- Regional benchmarking
- Trend analysis

## 📈 Data Quality

### Validation Rules (`schemas/validation/`)

#### Data Quality Checks
```javascript
const dataQualityRules = {
  wasteData: {
    quantity: {
      min: 0,
      max: 1000000,
      required: true
    },
    date: {
      format: 'YYYY-MM-DD',
      maxDate: 'today',
      minDate: '2000-01-01'
    },
    wasteType: {
      enum: WASTE_TYPES,
      required: true
    }
  },
  company: {
    name: {
      minLength: 2,
      maxLength: 200,
      unique: true
    },
    recyclingRate: {
      min: 0,
      max: 1,
      format: 'decimal'
    }
  }
};
```

### Data Monitoring
- **Completeness**: Missing data detection
- **Accuracy**: Range and format validation
- **Consistency**: Cross-reference validation
- **Timeliness**: Data freshness monitoring

## 🔧 Data Tools

### Command Line Interface
```bash
# Data import
npm run data:import csv ./data/datasets/sample.csv waste_data

# Data export
npm run data:export "SELECT * FROM waste_data LIMIT 1000" csv

# Data validation
npm run data:validate ./data/datasets/sample.csv

# Data transformation
npm run data:transform normalize ./data/datasets/raw.csv

# Data cleanup
npm run data:cleanup duplicates waste_data
```

### Web Interface
- Data upload portal
- Validation reports
- Export downloads
- Processing status

## 📊 Analytics Datasets

### Pre-computed Aggregations
- Monthly waste totals by sector
- Regional recycling rates
- Company performance benchmarks
- Trend analysis datasets

### Data Marts
- **Compliance Mart**: Regulatory compliance data
- **Sustainability Mart**: Environmental impact metrics
- **Performance Mart**: Company KPIs
- **Benchmark Mart**: Industry benchmarks

## 🔒 Data Security

### Access Control
- **Role-based Access**: Different access levels
- **Data Masking**: Sensitive data protection
- **Encryption**: Data at rest and in transit
- **Audit Logging**: All data access logged

### Privacy Compliance
- **GDPR**: Data subject rights
- **CCPA**: California privacy compliance
- **Data Retention**: Automated cleanup policies
- **Anonymization**: Personal data removal

## 📚 Documentation

### Data Dictionary
- Complete field definitions
- Business rules
- Data lineage
- Usage examples

### Processing Logs
- Import/export history
- Error logs
- Performance metrics
- Data quality reports

---

Comprehensive data management for sustainable waste intelligence

## Enhanced Company Profile Schema

### 1. **Database Schema Extension**

```sql
-- Enhanced companies table with profile information
ALTER TABLE companies ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS business_overview TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website_url VARCHAR(500);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS employee_count INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS revenue_usd DECIMAL(15,2);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS headquarters VARCHAR(200);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS stock_symbol VARCHAR(20);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Company waste profile table
CREATE TABLE IF NOT EXISTS company_waste_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    primary_waste_materials TEXT[], -- Array of waste types
    waste_management_strategy TEXT,
    recycling_facilities_count INTEGER,
    waste_treatment_methods TEXT[], -- Array of methods
    sustainability_goals TEXT,
    circular_economy_initiatives TEXT,
    waste_reduction_targets JSONB, -- Structured targets
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ESG reports and documents table
CREATE TABLE IF NOT EXISTS company_esg_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    document_type VARCHAR(100), -- 'sustainability_report', 'esg_report', 'annual_report'
    document_title VARCHAR(500),
    document_url VARCHAR(1000),
    publication_date DATE,
    reporting_year INTEGER,
    file_size_mb DECIMAL(10,2),
    language VARCHAR(10) DEFAULT 'en',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Company sustainability metrics table
CREATE TABLE IF NOT EXISTS company_sustainability_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    reporting_year INTEGER,
    carbon_footprint_tonnes DECIMAL(12,2),
    energy_consumption_gwh DECIMAL(10,2),
    water_consumption_m3 DECIMAL(12,2),
    renewable_energy_percentage DECIMAL(5,2),
    waste_to_landfill_percentage DECIMAL(5,2),
    recycling_rate_percentage DECIMAL(5,2),
    esg_score DECIMAL(5,2),
    sustainability_rating VARCHAR(20), -- 'AAA', 'AA', 'A', etc.
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. **Data Collection Process**

#### **Phase 1: Basic Company Information**
```javascript
// Example data structure for each company
const companyProfile = {
  company_id: "uuid",
  company_name: "Siemens AG",
  description: "Siemens AG is a German multinational conglomerate and the largest industrial manufacturing company in Europe...",
  business_overview: "Siemens operates in the fields of industry, infrastructure, transport, and healthcare...",
  website_url: "https://www.siemens.com",
  founded_year: 1847,
  employee_count: 311000,
  revenue_usd: 77800000000,
  headquarters: "Munich, Germany",
  stock_symbol: "SIE",
  is_public: true,
  country: "Germany",
  sector: "Industrials",
  industry: "Industrial Conglomerates"
};
```

#### **Phase 2: Waste Management Profile**
```javascript
const wasteProfile = {
  company_id: "uuid",
  primary_waste_materials: [
    "Electronic waste",
    "Metal scrap", 
    "Plastic waste",
    "Paper and cardboard",
    "Hazardous waste"
  ],
  waste_management_strategy: "Siemens implements a comprehensive circular economy approach...",
  recycling_facilities_count: 15,
  waste_treatment_methods: [
    "Mechanical recycling",
    "Chemical recycling", 
    "Energy recovery",
    "Landfill (minimal)"
  ],
  sustainability_goals: "Achieve carbon neutrality by 2030, zero waste to landfill by 2025...",
  circular_economy_initiatives: "Product-as-a-Service models, closed-loop manufacturing...",
  waste_reduction_targets: {
    "2025": { "reduction_percentage": 30, "zero_landfill": true },
    "2030": { "carbon_neutral": true, "circular_economy": "100%" }
  }
};
```

### 3. **Data Collection Workflow**

#### **Step 1: Create a Data Collection Template**
```markdown
# Company Profile Data Collection Template

## Company: [NAME]
**Source**: [URL]
**Last Updated**: [DATE]

### Basic Information
- **Company Name**: 
- **Website**: 
- **Founded**: 
- **Employees**: 
- **Revenue**: 
- **Headquarters**: 
- **Stock Symbol**: 
- **Country**: 
- **Sector**: 
- **Industry**: 

### Business Description
[2-3 paragraph overview from company website]

### Waste Management Profile
- **Primary Waste Materials**: 
- **Waste Management Strategy**: 
- **Recycling Facilities**: 
- **Treatment Methods**: 
- **Sustainability Goals**: 
- **Circular Economy Initiatives**: 

### ESG Reports
- **Latest Sustainability Report**: [URL] (Year: )
- **ESG Rating**: 
- **Carbon Footprint**: 
- **Recycling Rate**: 
```

#### **Step 2: Systematic Data Collection Process**

**For each of the 325 companies:**

1. **Start with Wikipedia** for basic company overview
2. **Visit company website** for official information
3. **Search for sustainability reports** (Google: "[Company Name] sustainability report 2024")
4. **Check ESG databases** for ratings and metrics
5. **Look for waste management sections** in annual reports
6. **Document all sources** for verification

### 4. **Automated Data Collection Tools**

#### **Web Scraping Script**
```javascript
// tools/scripts/collect-company-data.js
const puppeteer = require('puppeteer');
const fs = require('fs');

async function collectCompanyData(companyName) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Search for company information
  await page.goto(`https://www.google.com/search?q=${companyName}+sustainability+report+2024`);
  
  // Extract relevant links
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => a.href);
  });
  
  // Visit company website
  const companyWebsite = links.find(link => 
    link.includes(companyName.toLowerCase().replace(/\s+/g, ''))
  );
  
  if (companyWebsite) {
    await page.goto(companyWebsite);
    // Extract company information
    const companyData = await page.evaluate(() => {
      // Add extraction logic
    });
    
    return companyData;
  }
  
  await browser.close();
}
```

### 5. **Data Quality Assurance**

#### **Verification Checklist**
- [ ] Information is from official company sources
- [ ] Data is current (within last 2 years)
- [ ] Multiple sources confirm key facts
- [ ] ESG reports are publicly accessible
- [ ] Waste management data is specific and measurable

#### **Data Validation Rules**
```javascript
const validationRules = {
  company_name: { required: true, minLength: 2, maxLength: 200 },
  description: { required: true, minLength: 100, maxLength: 2000 },
  website_url: { required: true, format: 'url' },
  founded_year: { min: 1800, max: new Date().getFullYear() },
  employee_count: { min: 1, max: 1000000 },
  revenue_usd: { min: 0 },
  primary_waste_materials: { minItems: 1, maxItems: 10 }
};
```

### 6. **Implementation Plan**

#### **Week 1-2: Setup & Pilot**
1. Create database schema extensions
2. Build data collection templates
3. Pilot with 10 companies (mix of countries/sectors)
4. Refine process and templates

#### **Week 3-8: Systematic Collection**
1. Assign companies to researchers (50-60 companies per week)
2. Use standardized templates
3. Daily quality reviews
4. Weekly data imports to Supabase

#### **Week 9-10: Integration & Testing**
1. Import all data to Supabase
2. Create company profile pages
3. Test data display and search
4. Validate data accuracy

### 7. **Cost-Effective Approaches**

#### **Option A: Manual Research (Recommended)**
- **Time**: 6-8 weeks for 325 companies
- **Cost**: $0 (your time)
- **Quality**: High (verified sources)
- **Control**: Full control over data quality

#### **Option B: Freelance Researchers**
- **Platforms**: Upwork, Fiverr, Freelancer
- **Cost**: $5-15 per company profile
- **Time**: 2-3 weeks
- **Quality**: Variable (need good briefs)

#### **Option C: Automated + Manual Review**
- **Tools**: Web scraping + AI summarization
- **Cost**: $100-500 for tools
- **Time**: 3-4 weeks
- **Quality**: Good with manual review

### 8. **Next Steps**

1. **Start with 10 pilot companies** to test the process
2. **Create the database schema** extensions
3. **Build a simple data entry form** for manual collection
4. **Set up a tracking system** for progress
5. **Begin systematic data collection**

Would you like me to help you:
1. **Create the database schema** for the enhanced company profiles?
2. **Build a data collection template** for the 325 companies?
3. **Set up a data entry system** to manage the collection process?
4. **Start with a pilot** of 10 companies to test the approach?
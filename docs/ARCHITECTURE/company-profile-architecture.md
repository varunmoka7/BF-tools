# Company Profile System Architecture Document
**Version:** 2.0  
**Date:** January 2025  
**Project:** Waste Intelligence Platform - Company Profile Enhancement

## 🎯 Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Database Architecture](#database-architecture)
4. [API Architecture](#api-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Data Flow](#data-flow)
7. [Security & Performance](#security--performance)
8. [Implementation Plan](#implementation-plan)

## 🎯 Executive Summary

This document outlines the comprehensive architecture for implementing individual company data templates and detailed company profile pages for the Waste Intelligence Platform. The system will support 325 companies with enhanced data structures, real-time synchronization, and user-friendly profile pages.

### Key Objectives
- **Individual Company Templates**: Create separate data templates for each of the 325 companies
- **Master-Individual Sync**: Automatic synchronization between master dataset and individual templates
- **Enhanced Profile Pages**: Comprehensive, user-friendly company profile pages
- **Scalable Architecture**: Support for future growth and additional data types

## 🏗️ System Overview

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Database      │
│   (Next.js)     │◄──►│   (Supabase)    │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • Company List  │    │ • REST APIs     │    │ • Master Data   │
│ • Profile Pages │    │ • Real-time     │    │ • Individual    │
│ • Interactive   │    │ • Auth          │    │   Templates     │
│   Charts        │    │ • RLS           │    │ • Views         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, REST API, Real-time, Auth)
- **Database**: PostgreSQL 15+ with advanced features
- **Deployment**: Vercel (Frontend), Supabase (Backend)

## 🗄️ Database Architecture

### Core Tables Structure

#### 1. Master Company Templates (Enhanced companies table)
```sql
-- Enhanced companies table with profile information
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
```

#### 2. Individual Company Data Templates
```sql
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
```

#### 3. Supporting Tables
```sql
-- Template Change History
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

-- Company Waste Profiles (Enhanced)
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

-- ESG Documents and Reports
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
```

### Database Views
```sql
-- Comprehensive Company Profile View
CREATE OR REPLACE VIEW comprehensive_company_profiles AS
SELECT 
    c.*,
    cdt.profile,
    cdt.waste_management,
    cdt.performance,
    cdt.custom_fields,
    cwp.primary_waste_materials,
    cwp.waste_management_strategy,
    cwp.recycling_facilities_count,
    cwp.waste_treatment_methods,
    cwp.sustainability_goals,
    cwp.circular_economy_initiatives,
    cwp.waste_reduction_targets,
    -- Count of ESG documents
    (SELECT COUNT(*) FROM company_esg_documents ced WHERE ced.company_id = c.id) as esg_documents_count,
    -- Count of active certifications
    (SELECT COUNT(*) FROM company_certifications cc WHERE cc.company_id = c.id AND cc.status = 'active') as active_certifications_count,
    -- Count of operational facilities
    (SELECT COUNT(*) FROM company_waste_facilities cwf WHERE cwf.company_id = c.id AND cwf.operational_status = 'operational') as operational_facilities_count
FROM companies c
LEFT JOIN company_data_templates cdt ON c.id = cdt.company_id
LEFT JOIN company_waste_profiles cwp ON c.id = cwp.company_id;
```

### Indexes for Performance
```sql
-- Core indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_company_data_templates_company_id ON company_data_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_company_data_templates_csv_id ON company_data_templates(csv_company_id);
CREATE INDEX IF NOT EXISTS idx_company_data_templates_version ON company_data_templates(template_version);
CREATE INDEX IF NOT EXISTS idx_company_data_templates_sync ON company_data_templates(is_synced_with_master);

-- Full-text search indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_companies_name_search ON companies USING gin(company_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_companies_description_search ON companies USING gin(description gin_trgm_ops);
```

## 🔌 API Architecture

### REST API Endpoints

#### 1. Company Profile Endpoints
```typescript
// GET /api/companies/[id]/profile
interface CompanyProfileResponse {
  success: boolean;
  data: {
    company: MasterCompanyTemplate;
    profile: CompanyProfileData;
    waste_management: CompanyWasteData;
    performance: CompanyPerformanceData;
    custom_fields: Record<string, any>;
  };
}

// GET /api/companies/[id]/waste-metrics
interface WasteMetricsResponse {
  success: boolean;
  data: {
    total_waste_generated: number;
    total_waste_recovered: number;
    total_waste_disposed: number;
    recovery_rate: number;
    hazardous_waste: WasteMetrics;
    non_hazardous_waste: WasteMetrics;
    treatment_methods: TreatmentMethods;
    waste_types: WasteTypes;
  };
}

// GET /api/companies/[id]/performance
interface PerformanceResponse {
  success: boolean;
  data: {
    trends: TrendData[];
    benchmarks: BenchmarkData;
    performance_score: number;
    opportunity_score: number;
  };
}
```

#### 2. Template Management Endpoints
```typescript
// POST /api/companies/[id]/template/sync
interface SyncTemplateRequest {
  force_sync?: boolean;
  update_custom_fields?: boolean;
}

// GET /api/companies/[id]/template/history
interface TemplateHistoryResponse {
  success: boolean;
  data: TemplateChangeHistory[];
}

// PUT /api/companies/[id]/template/custom-fields
interface UpdateCustomFieldsRequest {
  custom_fields: Record<string, any>;
}
```

### Real-time Features
```typescript
// Supabase real-time subscriptions
const companyProfileSubscription = supabase
  .channel('company-profile-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'company_data_templates',
    filter: `company_id=eq.${companyId}`
  }, (payload) => {
    // Handle real-time updates
    updateCompanyProfile(payload.new);
  })
  .subscribe();
```

## 🎨 Frontend Architecture

### Page Structure
```
/app/companies/
├── page.tsx                    # Companies list page
├── [id]/
│   ├── page.tsx               # Company profile page
│   ├── waste-metrics/
│   │   └── page.tsx           # Detailed waste metrics
│   ├── performance/
│   │   └── page.tsx           # Performance analysis
│   └── documents/
│       └── page.tsx           # ESG documents
```

### Component Architecture
```
/components/companies/
├── CompanyProfileHeader.tsx   # Company header with basic info
├── CompanyInfoCard.tsx        # Company information card
├── WasteMetricsSection.tsx    # Waste management overview
├── PerformanceTrendsSection.tsx # Performance trends
├── TreatmentMethodsSection.tsx # Treatment methods breakdown
├── WasteTypesSection.tsx      # Waste types breakdown
├── CompanyBenchmarksCard.tsx  # Benchmark comparisons
├── CompanyMetricsCard.tsx     # Key metrics summary
└── charts/
    ├── WasteTrendsChart.tsx   # Waste trends over time
    ├── TreatmentMethodsChart.tsx # Treatment methods pie chart
    └── WasteTypesChart.tsx    # Waste types breakdown
```

### State Management
```typescript
// Company profile context
interface CompanyProfileContext {
  company: CompanyData | null;
  wasteMetrics: WasteMetrics | null;
  performance: PerformanceData | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateCustomFields: (fields: Record<string, any>) => Promise<void>;
}

// Custom hooks
const useCompanyProfile = (companyId: string) => {
  // Fetch and manage company profile data
};

const useWasteMetrics = (companyId: string) => {
  // Fetch and manage waste metrics data
};

const usePerformanceData = (companyId: string) => {
  // Fetch and manage performance data
};
```

## 🔄 Data Flow

### Master ↔ Individual Template Sync
```
Master Template Update → Sync Service → Individual Templates → Real-time Notification → UI Update
```

### Company Profile Page Data Flow
```
User Request → Cache Check → API Call → Database Query → Data Processing → UI Render
```

## 🔒 Security & Performance

### Security Measures
```sql
-- Row Level Security (RLS) Policies
CREATE POLICY "Users can view company profiles" ON companies
    FOR SELECT USING (true);

CREATE POLICY "Users can view company templates" ON company_data_templates
    FOR SELECT USING (true);

CREATE POLICY "Admin can update templates" ON company_data_templates
    FOR UPDATE USING (auth.role() = 'admin');
```

### Performance Optimization
```typescript
// Caching Strategy
const cacheConfig = {
  companyProfile: {
    ttl: 300, // 5 minutes
    key: (companyId: string) => `company:${companyId}:profile`
  },
  wasteMetrics: {
    ttl: 600, // 10 minutes
    key: (companyId: string) => `company:${companyId}:waste`
  },
  performance: {
    ttl: 900, // 15 minutes
    key: (companyId: string) => `company:${companyId}:performance`
  }
};
```

## 📋 Implementation Plan

### Phase 1: Database Foundation (Week 1)
- [ ] Set up enhanced companies table
- [ ] Create company_data_templates table
- [ ] Implement supporting tables
- [ ] Create database views
- [ ] Set up indexes and RLS policies

### Phase 2: API Development (Week 2)
- [ ] Create company profile API endpoints
- [ ] Implement template management APIs
- [ ] Add real-time subscriptions
- [ ] Set up caching layer
- [ ] Implement error handling

### Phase 3: Frontend Development (Week 3)
- [ ] Create company profile page structure
- [ ] Build UI components
- [ ] Implement data fetching hooks
- [ ] Add interactive charts
- [ ] Implement responsive design

### Phase 4: Integration & Testing (Week 4)
- [ ] Connect frontend with APIs
- [ ] Implement real-time updates
- [ ] Add error boundaries
- [ ] Performance testing
- [ ] User acceptance testing

### Phase 5: Deployment & Monitoring (Week 5)
- [ ] Deploy to production
- [ ] Set up monitoring
- [ ] Performance optimization
- [ ] Documentation updates
- [ ] User training

## 🎯 Success Metrics

### Technical Metrics
- **Page Load Time**: < 2 seconds for company profile pages
- **API Response Time**: < 500ms for profile data
- **Cache Hit Rate**: > 80% for frequently accessed data
- **Error Rate**: < 1% for API calls

### User Experience Metrics
- **User Engagement**: Time spent on profile pages
- **Navigation Flow**: Conversion from list to profile pages
- **Data Discovery**: Usage of interactive features
- **User Satisfaction**: Feedback scores

### Business Metrics
- **Data Completeness**: Percentage of companies with full profiles
- **Template Utilization**: Usage of custom fields
- **Sync Efficiency**: Time to sync master changes
- **Scalability**: Support for additional companies

---

**Document Version:** 2.0  
**Last Updated:** January 2025  
**Next Review:** February 2025

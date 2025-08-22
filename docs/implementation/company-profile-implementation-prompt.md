# 🚀 Complete Implementation Prompt for Company Profile System

## **Project Context**
You are implementing a comprehensive company profile system for the Waste Intelligence Platform. The system needs to support 325 companies with individual data templates, enhanced profile pages, and real-time synchronization using Supabase as the backend.

## **Available Resources**
- **Framework Document**: `docs/Frameworks/framework for the profile page.md` - Contains all available data fields
- **Architecture Document**: `docs/ARCHITECTURE/company-profile-architecture.md` - Complete technical architecture
- **PRD Document**: `docs/PRD/company-profile-prd.md` - Product requirements and specifications
- **Existing Codebase**: Next.js 14, Supabase, TypeScript, Tailwind CSS, shadcn/ui
- **Server**: Running on http://localhost:3000

## **Implementation Tasks**

### **Phase 1: Database Schema Setup (Priority: HIGH)**

#### **1.1 Create Enhanced Database Schema**
```sql
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
```

#### **1.2 Data Migration Strategy**
- Use existing CSV company IDs as the primary identifier
- Create individual templates for all 325 companies
- Migrate existing data to the new schema
- Validate data integrity after migration

### **Phase 2: API Endpoints Development (Priority: HIGH)**

#### **2.1 Company Profile API Endpoints**

Create file: `src/app/api/companies/[id]/profile/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const companyId = params.id;

    // Get comprehensive company profile
    const { data: company, error } = await supabase
      .from('comprehensive_company_profiles')
      .select('*')
      .eq('id', companyId)
      .single();

    if (error) {
      throw error;
    }

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        company: {
          id: company.id,
          name: company.company_name,
          ticker: company.ticker,
          country: company.country,
          sector: company.sector,
          industry: company.industry,
          employees: company.employees,
          year_of_disclosure: company.year_of_disclosure,
          description: company.description,
          website_url: company.website_url,
          founded_year: company.founded_year,
          headquarters: company.headquarters,
          revenue_usd: company.revenue_usd,
          market_cap_usd: company.market_cap_usd,
          sustainability_rating: company.sustainability_rating,
        },
        profile: company.profile,
        waste_management: company.waste_management,
        performance: company.performance,
        custom_fields: company.custom_fields,
        sync_status: {
          is_synced: company.is_synced_with_master,
          last_sync_at: company.last_sync_at,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Create file: `src/app/api/companies/[id]/waste-metrics/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const companyId = params.id;

    // Get waste management data
    const { data: template, error } = await supabase
      .from('company_data_templates')
      .select('waste_management')
      .eq('company_id', companyId)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: template?.waste_management || {},
    });
  } catch (error) {
    console.error('Error fetching waste metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Create file: `src/app/api/companies/[id]/performance/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const companyId = params.id;

    // Get performance data
    const { data: template, error } = await supabase
      .from('company_data_templates')
      .select('performance')
      .eq('company_id', companyId)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: template?.performance || {},
    });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### **2.2 Template Management APIs**

Create file: `src/app/api/companies/[id]/template/sync/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const companyId = params.id;
    const { force_sync = false } = await request.json();

    // Get master company data
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError) {
      throw companyError;
    }

    // Update individual template
    const { data: template, error: templateError } = await supabase
      .from('company_data_templates')
      .upsert({
        company_id: companyId,
        csv_company_id: company.csv_company_id,
        master_template_version: company.template_version,
        is_synced_with_master: true,
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (templateError) {
      throw templateError;
    }

    return NextResponse.json({
      success: true,
      data: {
        template_id: template.id,
        synced_at: template.last_sync_at,
        message: 'Template synchronized successfully',
      },
    });
  } catch (error) {
    console.error('Error syncing template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync template' },
      { status: 500 }
    );
  }
}
```

### **Phase 3: Company Profile Page Development (Priority: HIGH)**

#### **3.1 Main Profile Page Structure**

Create file: `src/app/companies/[id]/page.tsx`
```typescript
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CompanyProfileHeader from '@/components/companies/CompanyProfileHeader';
import CompanyInfoCard from '@/components/companies/CompanyInfoCard';
import WasteMetricsSection from '@/components/companies/WasteMetricsSection';
import PerformanceTrendsSection from '@/components/companies/PerformanceTrendsSection';
import CompanyMetricsCard from '@/components/companies/CompanyMetricsCard';

interface CompanyProfilePageProps {
  params: { id: string };
}

async function getCompanyProfile(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/companies/${id}/profile`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return null;
  }
}

export async function generateMetadata({ params }: CompanyProfilePageProps): Promise<Metadata> {
  const companyData = await getCompanyProfile(params.id);
  
  if (!companyData) {
    return {
      title: 'Company Not Found',
    };
  }

  return {
    title: `${companyData.company.name} - Company Profile`,
    description: `Detailed waste management profile for ${companyData.company.name} including sustainability metrics, waste data, and performance analysis.`,
  };
}

export default async function CompanyProfilePage({ params }: CompanyProfilePageProps) {
  const companyData = await getCompanyProfile(params.id);

  if (!companyData) {
    notFound();
  }

  const { company, waste_management, performance } = companyData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <CompanyProfileHeader company={company} />
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column - Company Info */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <CompanyInfoCard company={company} />
              <CompanyMetricsCard 
                wasteGenerated={waste_management?.total_waste_generated}
                wasteRecovered={waste_management?.total_waste_recovered}
                recoveryRate={waste_management?.recovery_rate}
                performanceScore={performance?.performance_score}
              />
            </div>
          </div>
          
          {/* Right Column - Detailed Data */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              <WasteMetricsSection 
                companyId={params.id}
                wasteManagement={waste_management}
              />
              <PerformanceTrendsSection 
                companyId={params.id}
                performance={performance}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### **3.2 Core UI Components**

Create file: `src/components/companies/CompanyProfileHeader.tsx`
```typescript
import React from 'react';
import { Star, MapPin, Calendar, Users } from 'lucide-react';

interface CompanyProfileHeaderProps {
  company: {
    name: string;
    ticker?: string;
    country: string;
    sector: string;
    industry: string;
    employees?: number;
    founded_year?: number;
    sustainability_rating?: number;
  };
}

export default function CompanyProfileHeader({ company }: CompanyProfileHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          
          {/* Company Info */}
          <div className="flex items-start space-x-6">
            {/* Company Logo/Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">
                {company.name.charAt(0)}
              </span>
            </div>
            
            {/* Company Details */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {company.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                {company.ticker && (
                  <span className="bg-gray-100 px-2 py-1 rounded font-medium">
                    {company.ticker}
                  </span>
                )}
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {company.country}
                </div>
                {company.employees && (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {company.employees.toLocaleString()} employees
                  </div>
                )}
                {company.founded_year && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Founded {company.founded_year}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {company.sector}
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {company.industry}
                </span>
              </div>
            </div>
          </div>
          
          {/* Sustainability Rating */}
          {company.sustainability_rating && (
            <div className="mt-6 lg:mt-0 text-center lg:text-right">
              <div className="flex items-center justify-center lg:justify-end space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${
                      i < company.sustainability_rating! 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Sustainability Rating: {company.sustainability_rating}/5
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

Create file: `src/components/companies/CompanyInfoCard.tsx`
```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Building, DollarSign, TrendingUp } from 'lucide-react';

interface CompanyInfoCardProps {
  company: {
    name: string;
    ticker?: string;
    website_url?: string;
    founded_year?: number;
    headquarters?: string;
    revenue_usd?: number;
    market_cap_usd?: number;
    is_public?: boolean;
    stock_exchange?: string;
    description?: string;
  };
}

export default function CompanyInfoCard({ company }: CompanyInfoCardProps) {
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="w-5 h-5 mr-2" />
          Company Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Basic Info */}
        <div className="space-y-3">
          {company.founded_year && (
            <div>
              <label className="text-sm font-medium text-gray-500">Founded</label>
              <p className="text-sm">{company.founded_year}</p>
            </div>
          )}
          
          {company.headquarters && (
            <div>
              <label className="text-sm font-medium text-gray-500">Headquarters</label>
              <p className="text-sm">{company.headquarters}</p>
            </div>
          )}
          
          {company.website_url && (
            <div>
              <label className="text-sm font-medium text-gray-500">Website</label>
              <a 
                href={company.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                Visit Website
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          )}
        </div>
        
        {/* Financial Info */}
        {(company.revenue_usd || company.market_cap_usd) && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Financial Information
            </h4>
            <div className="space-y-3">
              {company.revenue_usd && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Revenue</label>
                  <p className="text-sm font-medium">{formatCurrency(company.revenue_usd)}</p>
                </div>
              )}
              
              {company.market_cap_usd && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Market Cap</label>
                  <p className="text-sm font-medium">{formatCurrency(company.market_cap_usd)}</p>
                </div>
              )}
              
              {company.is_public && (
                <div>
                  <Badge variant="secondary">
                    {company.is_public ? 'Public Company' : 'Private Company'}
                  </Badge>
                  {company.stock_exchange && (
                    <Badge variant="outline" className="ml-2">
                      {company.stock_exchange}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Description */}
        {company.description && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">About</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {company.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

Create file: `src/components/companies/WasteMetricsSection.tsx`
```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Recycle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WasteMetricsSectionProps {
  companyId: string;
  wasteManagement: any;
}

export default function WasteMetricsSection({ companyId, wasteManagement }: WasteMetricsSectionProps) {
  const [metrics, setMetrics] = useState(wasteManagement);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wasteManagement) {
      fetchWasteMetrics();
    }
  }, [companyId, wasteManagement]);

  const fetchWasteMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/companies/${companyId}/waste-metrics`);
      const result = await response.json();
      
      if (result.success) {
        setMetrics(result.data);
      }
    } catch (error) {
      console.error('Error fetching waste metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num?: number) => {
    if (num === null || num === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 1,
    }).format(num);
  };

  const getTrendIcon = (rate?: number) => {
    if (!rate) return <Minus className="w-4 h-4 text-gray-400" />;
    if (rate >= 70) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (rate >= 40) return <Minus className="w-4 h-4 text-yellow-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Recycle className="w-5 h-5 mr-2" />
          Waste Management Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {formatNumber(metrics?.total_waste_generated)}t
            </div>
            <div className="text-sm text-gray-600">Total Waste Generated</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatNumber(metrics?.total_waste_recovered)}t
            </div>
            <div className="text-sm text-gray-600">Waste Recovered</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1 flex items-center justify-center">
              {formatNumber(metrics?.recovery_rate)}%
              {getTrendIcon(metrics?.recovery_rate)}
            </div>
            <div className="text-sm text-gray-600">Recovery Rate</div>
          </div>
        </div>
        
        {/* Waste Types Breakdown */}
        {metrics?.waste_types && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Waste Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(metrics.waste_types).map(([type, value]: [string, any]) => (
                <div key={type} className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatNumber(value)}t
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {type.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Treatment Methods */}
        {metrics?.treatment_methods && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment Methods</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(metrics.treatment_methods).map(([method, percentage]: [string, any]) => (
                <div key={method} className="text-center p-3 border rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatNumber(percentage)}%
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {method.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### **3.3 Update Companies List Page to Link to Profiles**

Update file: `src/app/companies/page.tsx` (add link to individual profiles):
```typescript
// In the existing companies table, add clickable rows
{filteredCompanies.map((company) => (
  <tr 
    key={company.id} 
    className="hover:bg-gray-50 cursor-pointer"
    onClick={() => window.location.href = `/companies/${company.id}`}
  >
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
        {company.name}
      </div>
    </td>
    // ... rest of the table cells
  </tr>
))}
```

### **Phase 4: Data Integration & Visualization (Priority: MEDIUM)**

#### **4.1 Chart Components**

Create file: `src/components/companies/charts/WasteTrendsChart.tsx`
```typescript
'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WasteTrendsChartProps {
  data: Array<{
    year: number;
    generated: number;
    recovered: number;
    disposed: number;
  }>;
}

export default function WasteTrendsChart({ data }: WasteTrendsChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [
              `${Number(value).toLocaleString()}t`,
              name === 'generated' ? 'Generated' : 
              name === 'recovered' ? 'Recovered' : 'Disposed'
            ]}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="generated" 
            stroke="#3B82F6" 
            strokeWidth={2}
            name="Generated"
          />
          <Line 
            type="monotone" 
            dataKey="recovered" 
            stroke="#10B981" 
            strokeWidth={2}
            name="Recovered"
          />
          <Line 
            type="monotone" 
            dataKey="disposed" 
            stroke="#EF4444" 
            strokeWidth={2}
            name="Disposed"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### **Phase 5: Testing & Integration (Priority: MEDIUM)**

#### **5.1 Add Required Dependencies**
```bash
npm install recharts
npm install @types/recharts
```

#### **5.2 Test API Endpoints**
```bash
# Test company profile endpoint
curl http://localhost:3000/api/companies/[company-id]/profile

# Test waste metrics endpoint
curl http://localhost:3000/api/companies/[company-id]/waste-metrics

# Test performance endpoint
curl http://localhost:3000/api/companies/[company-id]/performance
```

## **Implementation Guidelines**

### **Database Implementation**
1. **Start with Supabase**: Run the complete SQL schema in your Supabase SQL Editor
2. **Data Migration**: Create individual templates for all 325 companies
3. **Validation**: Ensure all templates are created successfully
4. **Optimization**: Monitor query performance and add indexes as needed

### **API Implementation**
1. **Error Handling**: Implement comprehensive error handling for all endpoints
2. **Type Safety**: Use TypeScript interfaces for all API responses
3. **Performance**: Add caching for frequently accessed data
4. **Testing**: Test all endpoints with real company data

### **Frontend Implementation**
1. **Progressive Enhancement**: Start with basic profile pages, then add charts
2. **Responsive Design**: Ensure all components work on mobile devices
3. **Loading States**: Add proper loading and error states
4. **Performance**: Implement lazy loading for heavy components

### **Data Integration**
1. **Use Existing IDs**: Leverage existing CSV company IDs for continuity
2. **Gradual Migration**: Migrate data in batches to avoid downtime
3. **Validation**: Validate all migrated data for completeness
4. **Monitoring**: Monitor data sync performance and errors

## **Success Criteria**

### **Technical Milestones**
- [ ] Database schema implemented successfully
- [ ] All 325 company templates created
- [ ] API endpoints returning correct data
- [ ] Company profile pages loading in <2 seconds
- [ ] Interactive charts working correctly
- [ ] Mobile responsiveness implemented
- [ ] Error handling working properly

### **Functional Milestones**
- [ ] Users can navigate from companies list to individual profiles
- [ ] All company data is displayed correctly
- [ ] Charts show waste trends and breakdowns
- [ ] Search and filtering work with new system
- [ ] Data export functionality works
- [ ] Real-time sync between master and individual templates

### **Quality Milestones**
- [ ] Zero critical bugs in production
- [ ] Page load times under 2 seconds
- [ ] API response times under 500ms
- [ ] Mobile experience optimized
- [ ] Accessibility standards met
- [ ] Code coverage above 80%

## **Ready to Start Implementation**

### **Step 1: Database Setup**
1. Open your Supabase dashboard
2. Go to SQL Editor
3. Run the complete database schema provided above
4. Verify all tables and functions are created

### **Step 2: API Development**
1. Create the API endpoint files as specified
2. Test each endpoint with sample data
3. Implement error handling and validation

### **Step 3: Frontend Development**
1. Create the company profile page structure
2. Build the UI components one by one
3. Add charts and interactive features
4. Test responsive design

### **Step 4: Integration**
1. Connect frontend with API endpoints
2. Test the complete user flow
3. Optimize performance
4. Deploy to production

---

**Start with Phase 1 (Database Schema Setup) and work through each phase systematically. The goal is to create a comprehensive, user-friendly company profile system that showcases all available data from the framework document in the most presentable way possible.**

**Good luck with the implementation! 🚀**

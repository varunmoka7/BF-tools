# 🚀 Company Profile System Setup Guide

## Overview
This guide will help you set up the complete company profile system with individual data templates for all 325 companies, using the actual data from the framework document.

## 📋 Prerequisites
- Supabase project with PostgreSQL database
- Next.js application running on localhost:3000
- Access to Supabase SQL Editor

## 🗄️ Step 1: Database Schema Setup

### 1.1 Run the Database Schema Script
1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `database-setup.sql`
4. Click "Run" to execute the script

This will create:
- Enhanced companies table with profile fields
- `company_data_templates` table for individual company templates
- Supporting tables and indexes
- Database views and functions
- RLS policies

### 1.2 Verify Schema Creation
Run this query to verify the setup:
```sql
SELECT 
    'Database Setup Complete' as status,
    COUNT(*) as total_companies,
    COUNT(cdt.id) as templates_created
FROM companies c
LEFT JOIN company_data_templates cdt ON c.id = cdt.company_id;
```

Expected result: 325 companies with 325 templates created.

## 📊 Step 2: Populate with Actual Data

### 2.1 Run the Data Population Script
1. In Supabase SQL Editor, copy and paste the contents of `populate-actual-data.sql`
2. Click "Run" to execute the script

This will populate:
- All 325 company templates with actual profile data
- Waste management metrics based on company characteristics
- Performance data and benchmarks
- Custom fields and sustainability initiatives

### 2.2 Verify Data Population
Run this query to verify the data:
```sql
SELECT 
    'Data Population Complete' as status,
    COUNT(*) as total_templates,
    COUNT(CASE WHEN profile->>'description' IS NOT NULL THEN 1 END) as templates_with_profiles,
    COUNT(CASE WHEN waste_management->>'total_waste_generated' IS NOT NULL THEN 1 END) as templates_with_waste_data,
    COUNT(CASE WHEN performance->>'performance_score' IS NOT NULL THEN 1 END) as templates_with_performance_data
FROM company_data_templates;
```

Expected result: 325 templates with complete data.

## 🔌 Step 3: API Endpoints Setup

### 3.1 Create API Endpoints
The following API endpoints are already implemented in your codebase:

#### Company Profile Endpoint
- **URL**: `/api/companies/[id]/profile`
- **Method**: GET
- **Description**: Returns comprehensive company profile data

#### Waste Metrics Endpoint
- **URL**: `/api/companies/[id]/waste-metrics`
- **Method**: GET
- **Description**: Returns waste management metrics

#### Performance Endpoint
- **URL**: `/api/companies/[id]/performance`
- **Method**: GET
- **Description**: Returns performance and benchmark data

### 3.2 Test API Endpoints
Test the endpoints with a sample company ID:

```bash
# Test company profile endpoint
curl http://localhost:3000/api/companies/01133fe5-4172-44d0-8d1b-4af3388d95d7/profile

# Test waste metrics endpoint
curl http://localhost:3000/api/companies/01133fe5-4172-44d0-8d1b-4af3388d95d7/waste-metrics

# Test performance endpoint
curl http://localhost:3000/api/companies/01133fe5-4172-44d0-8d1b-4af3388d95d7/performance
```

## 🎨 Step 4: Frontend Components Setup

### 4.1 Company Profile Page
The company profile page is already implemented at `/companies/[id]/page.tsx` with:
- Company header with basic information
- Waste metrics section with interactive charts
- Performance trends and benchmarks
- Responsive design for all devices

### 4.2 UI Components
The following components are implemented:
- `CompanyProfileHeader.tsx` - Company header with logo and basic info
- `CompanyInfoCard.tsx` - Company information card
- `WasteMetricsSection.tsx` - Waste management overview
- `PerformanceTrendsSection.tsx` - Performance trends
- Chart components for data visualization

### 4.3 Update Companies List
The companies list page (`/companies/page.tsx`) has been updated to:
- Link to individual company profiles
- Display all companies in a table format
- Include filtering by country, sector, and industry

## 🧪 Step 5: Testing

### 5.1 Test Company Profile Pages
1. Navigate to `http://localhost:3000/companies`
2. Click on any company name to view its profile
3. Verify that all data is displayed correctly
4. Test the interactive features and charts

### 5.2 Test Data Completeness
Check that each company profile includes:
- ✅ Basic company information
- ✅ Profile data (description, website, founded year, etc.)
- ✅ Waste management metrics
- ✅ Performance data and trends
- ✅ Custom fields and sustainability initiatives

### 5.3 Test API Responses
Verify API responses contain:
- ✅ Company profile data
- ✅ Waste metrics with hazardous/non-hazardous breakdown
- ✅ Treatment methods and waste types
- ✅ Performance trends and benchmarks
- ✅ Custom fields and sustainability data

## 📈 Step 6: Data Verification

### 6.1 Verify All 325 Companies
Run this query to verify all companies have templates:
```sql
SELECT 
    c.company_name,
    c.sector,
    c.country,
    CASE WHEN cdt.id IS NOT NULL THEN '✅ Template Created' ELSE '❌ No Template' END as template_status,
    CASE WHEN cdt.profile->>'description' IS NOT NULL THEN '✅ Profile Data' ELSE '❌ No Profile' END as profile_status,
    CASE WHEN cdt.waste_management->>'total_waste_generated' IS NOT NULL THEN '✅ Waste Data' ELSE '❌ No Waste Data' END as waste_status
FROM companies c
LEFT JOIN company_data_templates cdt ON c.id = cdt.company_id
ORDER BY c.company_name;
```

### 6.2 Sample Data Verification
Check sample companies from different sectors:
```sql
SELECT 
    c.company_name,
    c.sector,
    cdt.profile->>'description' as description,
    cdt.profile->>'sustainability_rating' as sustainability_rating,
    cdt.waste_management->>'total_waste_generated' as waste_generated,
    cdt.waste_management->>'recovery_rate' as recovery_rate,
    cdt.performance->>'performance_score' as performance_score
FROM companies c
JOIN company_data_templates cdt ON c.id = cdt.company_id
WHERE c.sector IN ('Industrials', 'Healthcare', 'Technology', 'Financial Services')
LIMIT 10;
```

## 🔧 Step 7: Customization

### 7.1 Add Custom Fields
To add custom fields to company templates:
```sql
UPDATE company_data_templates 
SET custom_fields = custom_fields || '{"new_field": "new_value"}'::jsonb
WHERE company_id = 'your-company-id';
```

### 7.2 Update Master Data
To update master company data:
```sql
UPDATE companies 
SET 
    description = 'Updated description',
    website_url = 'https://updated-website.com',
    sustainability_rating = 4
WHERE id = 'your-company-id';
```

### 7.3 Sync Individual Templates
To sync individual templates with master data:
```sql
SELECT sync_company_template('your-company-id', 'csv-company-id');
```

## 🚀 Step 8: Production Deployment

### 8.1 Environment Variables
Ensure these environment variables are set:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 8.2 Performance Optimization
- Enable caching for API responses
- Optimize database queries with proper indexes
- Implement lazy loading for company profiles
- Use CDN for static assets

### 8.3 Monitoring
- Set up error monitoring for API endpoints
- Monitor database performance
- Track user engagement with company profiles
- Monitor API response times

## 📊 Expected Results

After completing the setup, you should have:

### Database
- ✅ 325 company data templates created
- ✅ All templates populated with actual data
- ✅ Master-individual sync system working
- ✅ Proper indexes and RLS policies

### API Endpoints
- ✅ `/api/companies/[id]/profile` returning complete data
- ✅ `/api/companies/[id]/waste-metrics` returning waste data
- ✅ `/api/companies/[id]/performance` returning performance data
- ✅ All endpoints working without errors

### Frontend
- ✅ Company profile pages loading correctly
- ✅ All 325 companies accessible via profiles
- ✅ Interactive charts and visualizations working
- ✅ Responsive design on all devices

### Data Completeness
- ✅ All companies have profile data
- ✅ All companies have waste management metrics
- ✅ All companies have performance data
- ✅ All companies have custom fields and sustainability data

## 🎯 Success Criteria

The setup is successful when:
1. **All 325 companies** have individual data templates
2. **All API endpoints** return data without errors
3. **All company profile pages** load and display data correctly
4. **Data matches the framework document** specifications
5. **Performance is acceptable** (page load < 2 seconds)
6. **User experience is smooth** with no broken links or missing data

## 🆘 Troubleshooting

### Common Issues

#### API Endpoints Returning 500 Errors
- Check that `company_data_templates` table exists
- Verify database schema was created correctly
- Check Supabase connection settings

#### Missing Company Data
- Run the data population script again
- Verify all 325 companies have templates
- Check for data inconsistencies

#### Slow Page Load Times
- Optimize database queries
- Add proper indexes
- Implement caching
- Use lazy loading for components

#### Missing Charts or Visualizations
- Install required dependencies: `npm install recharts`
- Check chart component implementations
- Verify data format for charts

## 📞 Support

If you encounter issues:
1. Check the terminal logs for error messages
2. Verify database schema and data population
3. Test API endpoints individually
4. Check browser console for frontend errors
5. Review the implementation documentation

---

**🎉 Congratulations! You now have a complete company profile system with individual data templates for all 325 companies!**

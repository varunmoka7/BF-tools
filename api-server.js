const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// API endpoint to get companies from Supabase
app.get('/api/companies-db', async (req, res) => {
  try {
    console.log('📡 Fetching companies from Supabase...');
    
    const { data: companies, error } = await supabase
      .from('companies')
      .select(`
        id,
        company_name,
        country,
        sector,
        industry,
        employees,
        year_of_disclosure,
        ticker,
        exchange
      `)
      .order('company_name', { ascending: true });

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        data: []
      });
    }

    console.log(`✅ Successfully fetched ${companies?.length || 0} companies`);
    
    // Transform data to match dashboard expectations
    const transformedData = companies?.map(company => ({
      id: company.id,
      name: company.company_name,
      country: company.country,
      sector: company.sector,
      industry: company.industry,
      employees: company.employees,
      yearOfDisclosure: company.year_of_disclosure,
      ticker: company.ticker,
      exchange: company.exchange
    })) || [];

    res.json({
      success: true,
      data: transformedData,
      count: transformedData.length
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      data: []
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('count')
      .limit(1);
    
    res.json({ 
      status: 'healthy',
      supabase: !error,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Default companies data (fallback if Supabase is not available)
app.get('/api/companies-sample', (req, res) => {
  const sampleData = [
    {
      id: '1',
      name: 'EcoWaste Solutions',
      country: 'Germany',
      sector: 'Environmental Services',
      industry: 'Waste Management',
      employees: 1200,
      yearOfDisclosure: 2023
    },
    {
      id: '2', 
      name: 'Green Industries AG',
      country: 'Switzerland',
      sector: 'Manufacturing',
      industry: 'Chemical Production',
      employees: 850,
      yearOfDisclosure: 2023
    },
    {
      id: '3',
      name: 'Circular Tech Ltd',
      country: 'United Kingdom',
      sector: 'Technology',
      industry: 'Software Development',
      employees: 450,
      yearOfDisclosure: 2023
    }
  ];

  res.json({
    success: true,
    data: sampleData,
    count: sampleData.length
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log(`   GET /api/companies-db - Fetch companies from Supabase`);
  console.log(`   GET /api/companies-sample - Fetch sample data`);
  console.log(`   GET /api/health - Health check`);
});
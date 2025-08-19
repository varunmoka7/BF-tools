/**
 * Companies API Routes - Company search, filtering, and profiles
 */

import { Router } from 'express';
import Joi from 'joi';
import { CompanyService } from '../../services/company';
import { APIResponse, CompanySearchParams, SearchResult, CompanySummary, CompanyProfile } from '../../types/waste';

const router = Router();
const companyService = new CompanyService();

// Validation schema for search parameters
const searchParamsSchema = Joi.object({
  country: Joi.string().optional(),
  sector: Joi.string().optional(),
  industry: Joi.string().optional(),
  minWaste: Joi.number().min(0).optional(),
  maxWaste: Joi.number().min(0).optional(),
  minRecoveryRate: Joi.number().min(0).max(100).optional(),
  maxRecoveryRate: Joi.number().min(0).max(100).optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(200).optional(),
  sortBy: Joi.string().valid(
    'company_name', 'country', 'sector', 'industry', 
    'employees', 'total_waste_generated', 'recovery_rate', 'risk_score'
  ).optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
});

/**
 * GET /api/companies
 * Search and filter companies with pagination
 */
router.get('/', async (req, res) => {
  try {
    // Validate query parameters
    const { error, value } = searchParamsSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
        code: 400,
        timestamp: new Date()
      });
    }

    const searchParams: CompanySearchParams = value;
    const result = await companyService.searchCompanies(searchParams);
    
    const response: APIResponse<SearchResult<CompanySummary>> = {
      success: true,
      data: result,
      message: 'Companies retrieved successfully',
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error searching companies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search companies',
      code: 500,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/companies/:id
 * Get detailed company profile
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const company = await companyService.getCompanyProfile(id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
        code: 404,
        timestamp: new Date()
      });
    }

    const response: APIResponse<CompanyProfile> = {
      success: true,
      data: company,
      message: 'Company profile retrieved successfully',
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company profile',
      code: 500,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/companies/:id/opportunities
 * Get business opportunities for a specific company
 */
router.get('/:id/opportunities', async (req, res) => {
  try {
    const { id } = req.params;
    const company = await companyService.getCompanyProfile(id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
        code: 404,
        timestamp: new Date()
      });
    }

    const response: APIResponse<typeof company.opportunities> = {
      success: true,
      data: company.opportunities,
      message: 'Company opportunities retrieved successfully',
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching company opportunities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company opportunities',
      code: 500,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/companies/:id/risk-assessment
 * Get risk assessment for a specific company
 */
router.get('/:id/risk-assessment', async (req, res) => {
  try {
    const { id } = req.params;
    const company = await companyService.getCompanyProfile(id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
        code: 404,
        timestamp: new Date()
      });
    }

    const response: APIResponse<typeof company.riskAssessment> = {
      success: true,
      data: company.riskAssessment,
      message: 'Company risk assessment retrieved successfully',
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching company risk assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company risk assessment',
      code: 500,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/companies/:id/benchmark
 * Get benchmark data for a specific company
 */
router.get('/:id/benchmark', async (req, res) => {
  try {
    const { id } = req.params;
    const company = await companyService.getCompanyProfile(id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
        code: 404,
        timestamp: new Date()
      });
    }

    const benchmarkWithCompany = {
      ...company.benchmarkData,
      companyRecoveryRate: company.recoveryRate,
      companyWasteVolume: company.totalWasteGenerated,
      sector: company.sector,
      country: company.country,
      industry: company.industry
    };

    const response: APIResponse<typeof benchmarkWithCompany> = {
      success: true,
      data: benchmarkWithCompany,
      message: 'Company benchmark data retrieved successfully',
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching company benchmark:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company benchmark',
      code: 500,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/companies/search/suggestions
 * Get company name suggestions for autocomplete
 */
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    const searchTerm = q as string;
    
    if (!searchTerm || searchTerm.length < 2) {
      return res.json({
        success: true,
        data: [],
        message: 'Search term too short',
        timestamp: new Date()
      });
    }

    const suggestions = await companyService.getCompanyNames(searchTerm);
    
    const response: APIResponse<typeof suggestions> = {
      success: true,
      data: suggestions,
      message: 'Company suggestions retrieved successfully',
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching company suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company suggestions',
      code: 500,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/companies/filters/options
 * Get filter options (countries, sectors, industries)
 */
router.get('/filters/options', async (req, res) => {
  try {
    const [countries, sectors, industries] = await Promise.all([
      companyService.getUniqueCountries(),
      companyService.getUniqueSectors(),
      companyService.getUniqueIndustries()
    ]);

    const filterOptions = {
      countries: countries.sort(),
      sectors: sectors.sort(),
      industries: industries.sort()
    };

    const response: APIResponse<typeof filterOptions> = {
      success: true,
      data: filterOptions,
      message: 'Filter options retrieved successfully',
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch filter options',
      code: 500,
      timestamp: new Date()
    });
  }
});

export default router;
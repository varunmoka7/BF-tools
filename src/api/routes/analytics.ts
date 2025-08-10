/**
 * Analytics API Routes - KPI calculations and insights
 */

import { Router } from 'express';
import { AnalyticsService } from '../../services/analytics';
import { APIResponse, AnalyticsKPI, OpportunityScoring, MarketSizing } from '../../types/waste';

const router = Router();
const analyticsService = new AnalyticsService();

/**
 * GET /api/analytics
 * Get comprehensive analytics KPIs and insights
 */
router.get('/', async (req, res) => {
  try {
    const kpis = await analyticsService.getAnalyticsKPIs();
    
    const response: APIResponse<AnalyticsKPI> = {
      success: true,
      data: kpis,
      message: 'Analytics KPIs retrieved successfully',
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching analytics KPIs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics KPIs',
      code: 500,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/analytics/opportunities
 * Get opportunity scoring for all companies
 */
router.get('/opportunities', async (req, res) => {
  try {
    const { limit = '100', minScore = '0' } = req.query;
    
    const limitNum = parseInt(limit as string, 10);
    const minScoreNum = parseInt(minScore as string, 10);
    
    if (isNaN(limitNum) || isNaN(minScoreNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid limit or minScore parameters',
        code: 400,
        timestamp: new Date()
      });
    }

    const opportunities = await analyticsService.calculateOpportunityScoring();
    
    // Filter and limit results
    const filtered = opportunities
      .filter(opp => opp.opportunityScore >= minScoreNum)
      .slice(0, limitNum);

    const response: APIResponse<OpportunityScoring[]> = {
      success: true,
      data: filtered,
      message: 'Opportunity scoring retrieved successfully',
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching opportunity scoring:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch opportunity scoring',
      code: 500,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/analytics/opportunities/generate
 * Generate new business opportunities (heavy operation)
 */
router.post('/opportunities/generate', async (req, res) => {
  try {
    await analyticsService.generateOpportunities();
    
    const response: APIResponse<{ status: string }> = {
      success: true,
      data: { status: 'completed' },
      message: 'Business opportunities generated successfully',
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error generating opportunities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate opportunities',
      code: 500,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/analytics/market-sizing
 * Get market sizing data by region/sector
 */
router.get('/market-sizing', async (req, res) => {
  try {
    const { region, sector } = req.query;
    
    // For now, calculate basic market sizing from available data
    const globalStats = await analyticsService.getGlobalStats();
    
    const marketSizing: MarketSizing[] = [
      {
        region: region as string || 'Global',
        sector: sector as string,
        totalWaste: globalStats.totalWasteGenerated,
        recoveryGap: globalStats.totalWasteGenerated - globalStats.totalWasteRecovered,
        marketValue: globalStats.totalWasteGenerated * 180, // €180/tonne average
        servicableMarket: (globalStats.totalWasteGenerated - globalStats.totalWasteRecovered) * 200,
        competitorCount: 150 // Estimated
      }
    ];

    const response: APIResponse<MarketSizing[]> = {
      success: true,
      data: marketSizing,
      message: 'Market sizing data retrieved successfully',
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching market sizing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market sizing',
      code: 500,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/analytics/trends
 * Get trend analysis over time
 */
router.get('/trends', async (req, res) => {
  try {
    const { period = 'yearly', metric = 'recovery_rate' } = req.query;
    
    const globalStats = await analyticsService.getGlobalStats();
    
    const response: APIResponse<typeof globalStats.trendData> = {
      success: true,
      data: globalStats.trendData,
      message: 'Trend data retrieved successfully',
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching trend data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trend data',
      code: 500,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/analytics/performance/top
 * Get top performing companies across all metrics
 */
router.get('/performance/top', async (req, res) => {
  try {
    const { limit = '20', metric = 'recovery_rate' } = req.query;
    const limitNum = parseInt(limit as string, 10);
    
    const kpis = await analyticsService.getAnalyticsKPIs();
    
    const topPerformers = kpis.topPerformers.slice(0, limitNum);
    
    const response: APIResponse<typeof topPerformers> = {
      success: true,
      data: topPerformers,
      message: 'Top performers retrieved successfully',
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching top performers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top performers',
      code: 500,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/analytics/performance/worst
 * Get worst performing companies (opportunities for improvement)
 */
router.get('/performance/worst', async (req, res) => {
  try {
    const { limit = '20' } = req.query;
    const limitNum = parseInt(limit as string, 10);
    
    const kpis = await analyticsService.getAnalyticsKPIs();
    
    const worstPerformers = kpis.worstPerformers.slice(0, limitNum);
    
    const response: APIResponse<typeof worstPerformers> = {
      success: true,
      data: worstPerformers,
      message: 'Worst performers retrieved successfully',
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching worst performers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch worst performers',
      code: 500,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/analytics/leaderboards
 * Get comprehensive leaderboards
 */
router.get('/leaderboards', async (req, res) => {
  try {
    const kpis = await analyticsService.getAnalyticsKPIs();
    
    const leaderboards = {
      sectors: kpis.sectorLeaderboard,
      countries: kpis.countryLeaderboard,
      topPerformers: kpis.topPerformers.slice(0, 10),
      worstPerformers: kpis.worstPerformers.slice(0, 10)
    };
    
    const response: APIResponse<typeof leaderboards> = {
      success: true,
      data: leaderboards,
      message: 'Leaderboards retrieved successfully',
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching leaderboards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboards',
      code: 500,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/analytics/benchmark/:companyId
 * Get benchmark comparison for a specific company
 */
router.get('/benchmark/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // This would ideally use a dedicated benchmarking service
    // For now, redirect to company benchmark endpoint
    res.redirect(302, `/api/companies/${companyId}/benchmark`);
  } catch (error) {
    console.error('Error fetching benchmark:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch benchmark data',
      code: 500,
      timestamp: new Date()
    });
  }
});

export default router;
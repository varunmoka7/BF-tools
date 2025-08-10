/**
 * Global Statistics API Routes
 */

import { Router } from 'express';
import { AnalyticsService } from '../../services/analytics';
import { APIResponse, GlobalStats } from '../../types/waste';

const router = Router();
const analyticsService = new AnalyticsService();

/**
 * GET /api/global-stats
 * Get global waste management statistics for world map and overview
 */
router.get('/', async (req, res) => {
  try {
    const stats = await analyticsService.getGlobalStats();
    
    const response: APIResponse<GlobalStats> = {
      success: true,
      data: stats,
      message: 'Global statistics retrieved successfully',
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching global stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch global statistics',
      code: 500,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/global-stats/countries
 * Get country-specific statistics
 */
router.get('/countries', async (req, res) => {
  try {
    const { country } = req.query;
    const stats = await analyticsService.getCountryStats(country as string);
    
    const response: APIResponse<typeof stats> = {
      success: true,
      data: stats,
      message: 'Country statistics retrieved successfully',
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching country stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch country statistics',
      code: 500,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/global-stats/countries/:country
 * Get specific country statistics
 */
router.get('/countries/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const stats = await analyticsService.getCountryStats(country);
    
    if (!stats.length) {
      return res.status(404).json({
        success: false,
        error: 'Country not found',
        code: 404,
        timestamp: new Date()
      });
    }

    const response: APIResponse<typeof stats[0]> = {
      success: true,
      data: stats[0],
      message: `Statistics for ${country} retrieved successfully`,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching country stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch country statistics',
      code: 500,
      timestamp: new Date()
    });
  }
});

export default router;
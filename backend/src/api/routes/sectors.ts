/**
 * Sectors API Routes - Sector leaderboards and rankings
 */

import { Router } from 'express';
import { AnalyticsService } from '../../services/analytics';
import { APIResponse, SectorStats } from '../../types/waste';

const router = Router();
const analyticsService = new AnalyticsService();

/**
 * GET /api/sectors
 * Get all sector statistics and leaderboards
 */
router.get('/', async (req, res) => {
  try {
    const sectors = await analyticsService.getSectorStats();
    
    const response: APIResponse<SectorStats[]> = {
      success: true,
      data: sectors,
      message: 'Sector statistics retrieved successfully',
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching sector stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sector statistics',
      code: 500,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/sectors/:sector
 * Get specific sector statistics
 */
router.get('/:sector', async (req, res) => {
  try {
    const { sector } = req.params;
    const decodedSector = decodeURIComponent(sector);
    const stats = await analyticsService.getSectorStats(decodedSector);
    
    if (!stats.length) {
      return res.status(404).json({
        success: false,
        error: 'Sector not found',
        code: 404,
        timestamp: new Date()
      });
    }

    const response: APIResponse<SectorStats> = {
      success: true,
      data: stats[0],
      message: `Statistics for ${decodedSector} sector retrieved successfully`,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching sector stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sector statistics',
      code: 500,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/sectors/:sector/leaderboard
 * Get sector leaderboard with top performers
 */
router.get('/:sector/leaderboard', async (req, res) => {
  try {
    const { sector } = req.params;
    const decodedSector = decodeURIComponent(sector);
    const stats = await analyticsService.getSectorStats(decodedSector);
    
    if (!stats.length) {
      return res.status(404).json({
        success: false,
        error: 'Sector not found',
        code: 404,
        timestamp: new Date()
      });
    }

    // Focus on the top performers data
    const leaderboard = {
      sector: stats[0].sector,
      averageRecoveryRate: stats[0].averageRecoveryRate,
      totalCompanies: stats[0].totalCompanies,
      topPerformers: stats[0].topPerformers,
      topCountries: stats[0].topCountries
    };

    const response: APIResponse<typeof leaderboard> = {
      success: true,
      data: leaderboard,
      message: `Leaderboard for ${decodedSector} sector retrieved successfully`,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching sector leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sector leaderboard',
      code: 500,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/sectors/compare
 * Compare multiple sectors
 */
router.get('/compare', async (req, res) => {
  try {
    const { sectors } = req.query;
    
    if (!sectors || typeof sectors !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'sectors query parameter is required (comma-separated)',
        code: 400,
        timestamp: new Date()
      });
    }

    const sectorList = sectors.split(',').map(s => s.trim());
    const comparison = [];

    for (const sector of sectorList) {
      const stats = await analyticsService.getSectorStats(sector);
      if (stats.length > 0) {
        comparison.push(stats[0]);
      }
    }

    const response: APIResponse<typeof comparison> = {
      success: true,
      data: comparison,
      message: `Sector comparison retrieved successfully`,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error comparing sectors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare sectors',
      code: 500,
      timestamp: new Date()
    });
  }
});

export default router;
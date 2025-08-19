/**
 * Unit tests for Analytics Service
 */

import { AnalyticsService } from '../../src/services/analytics';
import DatabaseConnection from '../../src/database/connection';

// Mock the database connection
jest.mock('../../src/database/connection');

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let mockDb: jest.Mocked<DatabaseConnection>;

  beforeEach(() => {
    analyticsService = new AnalyticsService();
    mockDb = DatabaseConnection.getInstance() as jest.Mocked<DatabaseConnection>;
  });

  describe('getGlobalStats', () => {
    it('should calculate global statistics correctly', async () => {
      // Mock database responses
      mockDb.get.mockResolvedValueOnce({
        totalWasteGenerated: 100000,
        totalWasteRecovered: 75000,
        totalWasteDisposed: 25000,
        avgRecoveryRate: 75
      });

      mockDb.query
        .mockResolvedValueOnce([]) // top countries
        .mockResolvedValueOnce([]) // top sectors
        .mockResolvedValueOnce([]); // trend data

      const result = await analyticsService.getGlobalStats();

      expect(result).toMatchObject({
        totalWasteGenerated: 100000,
        totalWasteRecovered: 75000,
        totalWasteDisposed: 25000,
        recoveryRate: 75,
        topCountries: expect.any(Array),
        topSectors: expect.any(Array),
        trendData: expect.any(Array)
      });
    });

    it('should handle empty database gracefully', async () => {
      mockDb.get.mockResolvedValueOnce(undefined);
      mockDb.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await analyticsService.getGlobalStats();

      expect(result).toMatchObject({
        totalWasteGenerated: 0,
        totalWasteRecovered: 0,
        totalWasteDisposed: 0,
        recoveryRate: 0
      });
    });
  });

  describe('calculateOpportunityScoring', () => {
    it('should calculate opportunity scores correctly', async () => {
      const mockCompanies = [
        {
          companyId: 'comp-1',
          wasteVolume: 10000,
          currentRecoveryRate: 50,
          sector: 'Industrials',
          country: 'Germany'
        },
        {
          companyId: 'comp-2', 
          wasteVolume: 5000,
          currentRecoveryRate: 80,
          sector: 'Technology',
          country: 'France'
        }
      ];

      mockDb.query.mockResolvedValueOnce(mockCompanies);
      mockDb.query.mockResolvedValueOnce([
        { sector: 'Industrials', avgRecoveryRate: 75 },
        { sector: 'Technology', avgRecoveryRate: 85 }
      ]);

      const result = await analyticsService.calculateOpportunityScoring();

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            companyId: expect.any(String),
            wasteVolume: expect.any(Number),
            currentRecoveryRate: expect.any(Number),
            potentialRecoveryRate: expect.any(Number),
            opportunityScore: expect.any(Number),
            priority: expect.any(String)
          })
        ])
      );

      // Higher waste volume with lower recovery rate should have higher opportunity score
      expect(result[0].opportunityScore).toBeGreaterThan(result[1].opportunityScore);
    });

    it('should prioritize opportunities correctly', async () => {
      const mockCompanies = [
        {
          companyId: 'high-opp',
          wasteVolume: 50000,
          currentRecoveryRate: 20,
          sector: 'Industrials',
          country: 'Germany'
        }
      ];

      mockDb.query.mockResolvedValueOnce(mockCompanies);
      mockDb.query.mockResolvedValueOnce([
        { sector: 'Industrials', avgRecoveryRate: 75 }
      ]);

      const result = await analyticsService.calculateOpportunityScoring();

      expect(result[0]).toMatchObject({
        companyId: 'high-opp',
        priority: expect.stringMatching(/high|critical/)
      });
    });
  });

  describe('getAnalyticsKPIs', () => {
    it('should compile comprehensive KPIs', async () => {
      // Mock all the required data
      mockDb.get.mockResolvedValue({
        totalWasteGenerated: 100000,
        totalWasteRecovered: 75000,
        avgRecoveryRate: 75
      });

      mockDb.query
        .mockResolvedValueOnce([]) // global stats components
        .mockResolvedValueOnce([]) // top performers
        .mockResolvedValueOnce([]) // worst performers  
        .mockResolvedValueOnce([]) // sector leaderboard
        .mockResolvedValueOnce([]); // country leaderboard

      const result = await analyticsService.getAnalyticsKPIs();

      expect(result).toMatchObject({
        globalRecoveryRate: expect.any(Number),
        totalMarketSize: expect.any(Number),
        growthRate: expect.any(Number),
        opportunityValue: expect.any(Number),
        topPerformers: expect.any(Array),
        worstPerformers: expect.any(Array),
        sectorLeaderboard: expect.any(Array),
        countryLeaderboard: expect.any(Array)
      });
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockDb.get.mockRejectedValueOnce(new Error('Database error'));

      await expect(analyticsService.getGlobalStats()).rejects.toThrow('Database error');
    });

    it('should handle invalid data gracefully', async () => {
      mockDb.get.mockResolvedValueOnce({
        totalWasteGenerated: null,
        totalWasteRecovered: 'invalid',
        avgRecoveryRate: undefined
      });

      mockDb.query.mockResolvedValue([]);

      const result = await analyticsService.getGlobalStats();

      // Should convert invalid data to 0
      expect(result.totalWasteGenerated).toBe(0);
      expect(result.recoveryRate).toBe(0);
    });
  });
});
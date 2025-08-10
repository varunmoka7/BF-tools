/**
 * Integration tests for Waste Intelligence Platform API
 */

import request from 'supertest';
import app from '../../src/app';
import DatabaseConnection from '../../src/database/connection';

describe('Waste Intelligence Platform API', () => {
  let db: DatabaseConnection;

  beforeAll(async () => {
    db = DatabaseConnection.getInstance();
    await db.connect();
    
    // Insert test data
    await db.run(`
      INSERT OR IGNORE INTO companies (id, company_name, country, sector, industry, employees, year_of_disclosure) 
      VALUES ('test-1', 'Test Company', 'Germany', 'Industrials', 'Manufacturing', 1000, 2024)
    `);
    
    await db.run(`
      INSERT OR IGNORE INTO company_metrics (id, company_id, reporting_period, total_waste_generated, total_waste_recovered, recovery_rate) 
      VALUES ('metric-1', 'test-1', 2024, 10000, 7500, 75.0)
    `);
  });

  afterAll(async () => {
    await db.close();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        version: expect.any(String),
        environment: expect.any(String)
      });
    });
  });

  describe('Global Stats API', () => {
    it('should return global statistics', async () => {
      const response = await request(app)
        .get('/api/global-stats')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          totalWasteGenerated: expect.any(Number),
          totalWasteRecovered: expect.any(Number),
          recoveryRate: expect.any(Number),
          topCountries: expect.any(Array),
          topSectors: expect.any(Array)
        }
      });
    });

    it('should return country statistics', async () => {
      const response = await request(app)
        .get('/api/global-stats/countries')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array)
      });
    });
  });

  describe('Sectors API', () => {
    it('should return sector statistics', async () => {
      const response = await request(app)
        .get('/api/sectors')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array)
      });
    });
  });

  describe('Companies API', () => {
    it('should search companies', async () => {
      const response = await request(app)
        .get('/api/companies')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          data: expect.any(Array),
          total: expect.any(Number),
          page: expect.any(Number),
          totalPages: expect.any(Number)
        }
      });
    });

    it('should return company profile', async () => {
      const response = await request(app)
        .get('/api/companies/test-1')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          companyId: 'test-1',
          companyName: 'Test Company',
          country: 'Germany',
          sector: 'Industrials'
        }
      });
    });

    it('should return 404 for non-existent company', async () => {
      const response = await request(app)
        .get('/api/companies/non-existent')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Company not found',
        code: 404
      });
    });

    it('should return filter options', async () => {
      const response = await request(app)
        .get('/api/companies/filters/options')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          countries: expect.any(Array),
          sectors: expect.any(Array),
          industries: expect.any(Array)
        }
      });
    });
  });

  describe('Analytics API', () => {
    it('should return analytics KPIs', async () => {
      const response = await request(app)
        .get('/api/analytics')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          globalRecoveryRate: expect.any(Number),
          totalMarketSize: expect.any(Number),
          topPerformers: expect.any(Array),
          sectorLeaderboard: expect.any(Array)
        }
      });
    });

    it('should return opportunity scoring', async () => {
      const response = await request(app)
        .get('/api/analytics/opportunities')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array)
      });
    });

    it('should return market sizing', async () => {
      const response = await request(app)
        .get('/api/analytics/market-sizing')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array)
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-endpoint')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('not found'),
        code: 404
      });
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/companies?minWaste=-100')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        code: 400
      });
    });
  });
});
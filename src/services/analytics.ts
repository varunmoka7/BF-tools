/**
 * Analytics and Business Intelligence Service
 */

import { differenceInDays, subYears, format } from 'date-fns';
import DatabaseConnection from '../database/connection';
import {
  GlobalStats,
  CountryStats,
  SectorStats,
  AnalyticsKPI,
  TrendData,
  OpportunityScoring,
  MarketSizing,
  Priority,
  CompanySummary,
  SectorLeaderboard,
  CountryLeaderboard,
  Opportunity,
  OpportunityType
} from '../types/waste';

export class AnalyticsService {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  public async getGlobalStats(): Promise<GlobalStats> {
    console.log('Calculating global statistics...');

    // Get overall aggregates
    const globalQuery = `
      SELECT 
        SUM(total_waste_generated) as totalWasteGenerated,
        SUM(total_waste_recovered) as totalWasteRecovered,
        SUM(total_waste_disposed) as totalWasteDisposed,
        AVG(CASE WHEN recovery_rate > 0 THEN recovery_rate END) as avgRecoveryRate
      FROM company_metrics
    `;

    const globalResult = await this.db.get<{
      totalWasteGenerated: number;
      totalWasteRecovered: number;
      totalWasteDisposed: number;
      avgRecoveryRate: number;
    }>(globalQuery);

    // Get top countries
    const topCountries = await this.getTopCountriesStats();

    // Get top sectors
    const topSectors = await this.getTopSectorsStats();

    // Get trend data
    const trendData = await this.getTrendData();

    return {
      totalWasteGenerated: globalResult?.totalWasteGenerated || 0,
      totalWasteRecovered: globalResult?.totalWasteRecovered || 0,
      totalWasteDisposed: globalResult?.totalWasteDisposed || 0,
      recoveryRate: globalResult?.avgRecoveryRate || 0,
      topCountries,
      topSectors,
      trendData
    };
  }

  public async getCountryStats(country?: string): Promise<CountryStats[]> {
    let query = `
      SELECT 
        cs.country,
        cs.total_companies as totalCompanies,
        cs.total_waste_generated as totalWasteGenerated,
        cs.total_waste_recovered as totalWasteRecovered,
        cs.average_recovery_rate as recoveryRate,
        cs.top_sectors as topSectors
      FROM country_stats cs
    `;
    
    const params: string[] = [];
    if (country) {
      query += ' WHERE cs.country = ?';
      params.push(country);
    }
    
    query += ' ORDER BY cs.average_recovery_rate DESC';

    const results = await this.db.query<{
      country: string;
      totalCompanies: number;
      totalWasteGenerated: number;
      totalWasteRecovered: number;
      recoveryRate: number;
      topSectors: string;
    }>(query, params);

    return results.map(result => ({
      country: result.country,
      totalCompanies: result.totalCompanies,
      totalWasteGenerated: result.totalWasteGenerated,
      totalWasteRecovered: result.totalWasteRecovered,
      recoveryRate: result.recoveryRate,
      topSectors: this.parseJsonArray(result.topSectors),
      yearOverYearChange: 0 // TODO: Calculate from historical data
    }));
  }

  public async getSectorStats(sector?: string): Promise<SectorStats[]> {
    let query = `
      SELECT 
        ss.sector,
        ss.total_companies as totalCompanies,
        ss.total_waste_generated as totalWasteGenerated,
        ss.average_recovery_rate as averageRecoveryRate,
        ss.top_countries as topCountries,
        ss.top_performers as topPerformers
      FROM sector_stats ss
    `;
    
    const params: string[] = [];
    if (sector) {
      query += ' WHERE ss.sector = ?';
      params.push(sector);
    }
    
    query += ' ORDER BY ss.average_recovery_rate DESC';

    const results = await this.db.query<{
      sector: string;
      totalCompanies: number;
      totalWasteGenerated: number;
      averageRecoveryRate: number;
      topCountries: string;
      topPerformers: string;
    }>(query, params);

    const sectorStats: SectorStats[] = [];

    for (const result of results) {
      const topPerformerIds = this.parseJsonArray(result.topPerformers);
      const topPerformers = await this.getTopPerformers(topPerformerIds);

      sectorStats.push({
        sector: result.sector,
        totalCompanies: result.totalCompanies,
        totalWasteGenerated: result.totalWasteGenerated,
        averageRecoveryRate: result.averageRecoveryRate,
        topCountries: this.parseJsonArray(result.topCountries),
        topPerformers
      });
    }

    return sectorStats;
  }

  public async getAnalyticsKPIs(): Promise<AnalyticsKPI> {
    console.log('Calculating analytics KPIs...');

    // Global metrics
    const globalStats = await this.getGlobalStats();
    
    // Market sizing calculation
    const totalMarketSize = globalStats.totalWasteGenerated * 150; // Assume €150/tonne average value
    const growthRate = 12.5; // Annual growth rate in %
    const opportunityValue = (globalStats.totalWasteGenerated - globalStats.totalWasteRecovered) * 200; // Lost value

    // Top and worst performers
    const topPerformers = await this.getTopCompanyPerformers(10);
    const worstPerformers = await this.getWorstCompanyPerformers(10);

    // Leaderboards
    const sectorLeaderboard = await this.getSectorLeaderboard();
    const countryLeaderboard = await this.getCountryLeaderboard();

    return {
      globalRecoveryRate: globalStats.recoveryRate,
      totalMarketSize,
      growthRate,
      opportunityValue,
      topPerformers,
      worstPerformers,
      sectorLeaderboard,
      countryLeaderboard
    };
  }

  public async calculateOpportunityScoring(): Promise<OpportunityScoring[]> {
    console.log('Calculating opportunity scoring...');

    const query = `
      SELECT 
        c.id as companyId,
        cm.total_waste_generated as wasteVolume,
        cm.recovery_rate as currentRecoveryRate,
        c.sector,
        c.country
      FROM companies c
      LEFT JOIN company_metrics cm ON c.id = cm.company_id
      WHERE cm.total_waste_generated > 0
      ORDER BY cm.total_waste_generated DESC
    `;

    const companies = await this.db.query<{
      companyId: string;
      wasteVolume: number;
      currentRecoveryRate: number;
      sector: string;
      country: string;
    }>(query);

    // Get sector benchmarks
    const sectorBenchmarks = await this.getSectorBenchmarks();

    const opportunities: OpportunityScoring[] = companies.map(company => {
      const sectorBenchmark = sectorBenchmarks.get(company.sector) || 75; // Default 75% recovery rate
      const potentialRecoveryRate = Math.min(sectorBenchmark + 10, 95); // Cap at 95%
      const improvementPotential = Math.max(0, potentialRecoveryRate - company.currentRecoveryRate);
      
      // Market value calculation (€/tonne varies by waste type)
      const marketValue = company.wasteVolume * 180; // Average €180/tonne
      
      // Opportunity score: combines volume, improvement potential, and market value
      let opportunityScore = (
        (company.wasteVolume / 10000) * 0.3 + // Volume factor (30%)
        (improvementPotential / 100) * 0.5 + // Improvement potential (50%)
        (marketValue / 1000000) * 0.2 // Market value factor (20%)
      ) * 100;

      opportunityScore = Math.min(opportunityScore, 100); // Cap at 100

      // Priority classification
      let priority: Priority;
      if (opportunityScore >= 80) priority = Priority.CRITICAL;
      else if (opportunityScore >= 60) priority = Priority.HIGH;
      else if (opportunityScore >= 40) priority = Priority.MEDIUM;
      else priority = Priority.LOW;

      return {
        companyId: company.companyId,
        wasteVolume: company.wasteVolume,
        currentRecoveryRate: company.currentRecoveryRate,
        potentialRecoveryRate,
        marketValue,
        opportunityScore,
        priority
      };
    });

    return opportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);
  }

  public async generateOpportunities(): Promise<void> {
    console.log('Generating business opportunities...');

    const opportunityScores = await this.calculateOpportunityScoring();
    
    // Clear existing opportunities
    await this.db.run('DELETE FROM opportunities');

    for (const score of opportunityScores.slice(0, 500)) { // Top 500 opportunities
      const opportunities = await this.createOpportunitiesForCompany(score);
      
      for (const opportunity of opportunities) {
        await this.insertOpportunity(opportunity);
      }
    }

    console.log('Business opportunities generated');
  }

  private async createOpportunitiesForCompany(scoring: OpportunityScoring): Promise<Opportunity[]> {
    const opportunities: Opportunity[] = [];
    const baseId = scoring.companyId;

    // Recovery improvement opportunity
    if (scoring.currentRecoveryRate < scoring.potentialRecoveryRate) {
      opportunities.push({
        id: `${baseId}-recovery`,
        type: OpportunityType.RECOVERY_IMPROVEMENT,
        title: 'Improve Waste Recovery Rate',
        description: `Increase recovery rate from ${scoring.currentRecoveryRate.toFixed(1)}% to ${scoring.potentialRecoveryRate.toFixed(1)}%`,
        potentialValue: (scoring.potentialRecoveryRate - scoring.currentRecoveryRate) * scoring.wasteVolume * 1.5, // €1.5/tonne improvement value
        priority: scoring.priority,
        implementationComplexity: scoring.opportunityScore > 70 ? 'medium' : 'high',
        paybackPeriod: scoring.opportunityScore > 50 ? 18 : 36, // months
        carbonImpact: (scoring.potentialRecoveryRate - scoring.currentRecoveryRate) * scoring.wasteVolume * 0.5 // 0.5 tonnes CO2/tonne waste
      });
    }

    // Cost reduction opportunity (if high waste disposal)
    const disposalRate = 100 - scoring.currentRecoveryRate;
    if (disposalRate > 20) {
      opportunities.push({
        id: `${baseId}-cost-reduction`,
        type: OpportunityType.COST_REDUCTION,
        title: 'Reduce Waste Disposal Costs',
        description: `Reduce disposal costs through improved sorting and processing`,
        potentialValue: scoring.wasteVolume * disposalRate * 0.01 * 80, // €80/tonne disposal cost savings
        priority: scoring.priority,
        implementationComplexity: 'low',
        paybackPeriod: 12,
        carbonImpact: disposalRate * scoring.wasteVolume * 0.01 * 0.3
      });
    }

    // New revenue stream opportunity (if large volume)
    if (scoring.wasteVolume > 5000) {
      opportunities.push({
        id: `${baseId}-revenue`,
        type: OpportunityType.NEW_REVENUE_STREAM,
        title: 'Develop Waste-to-Revenue Streams',
        description: `Create new revenue from high-value waste materials`,
        potentialValue: scoring.wasteVolume * 0.15 * 220, // 15% of waste at €220/tonne
        priority: scoring.priority,
        implementationComplexity: 'high',
        paybackPeriod: 24,
        carbonImpact: scoring.wasteVolume * 0.15 * 0.4
      });
    }

    return opportunities;
  }

  private async insertOpportunity(opportunity: Opportunity): Promise<void> {
    const sql = `
      INSERT INTO opportunities (
        id, company_id, opportunity_type, title, description,
        potential_value, priority, implementation_complexity,
        payback_period, carbon_impact
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.run(sql, [
      opportunity.id,
      opportunity.id.split('-')[0], // Extract company ID
      opportunity.type,
      opportunity.title,
      opportunity.description,
      opportunity.potentialValue,
      opportunity.priority,
      opportunity.implementationComplexity,
      opportunity.paybackPeriod,
      opportunity.carbonImpact
    ]);
  }

  private async getTopCountriesStats(): Promise<CountryStats[]> {
    const query = `
      SELECT 
        country, total_companies, total_waste_generated,
        total_waste_recovered, average_recovery_rate, top_sectors
      FROM country_stats
      ORDER BY average_recovery_rate DESC, total_waste_generated DESC
      LIMIT 10
    `;

    const results = await this.db.query<{
      country: string;
      total_companies: number;
      total_waste_generated: number;
      total_waste_recovered: number;
      average_recovery_rate: number;
      top_sectors: string;
    }>(query);

    return results.map(result => ({
      country: result.country,
      totalCompanies: result.total_companies,
      totalWasteGenerated: result.total_waste_generated,
      totalWasteRecovered: result.total_waste_recovered,
      recoveryRate: result.average_recovery_rate,
      topSectors: this.parseJsonArray(result.top_sectors),
      yearOverYearChange: 0
    }));
  }

  private async getTopSectorsStats(): Promise<SectorStats[]> {
    return this.getSectorStats();
  }

  private async getTrendData(): Promise<TrendData[]> {
    const query = `
      SELECT 
        reporting_period,
        SUM(total_waste_generated) as totalGenerated,
        SUM(total_waste_recovered) as totalRecovered,
        AVG(recovery_rate) as recoveryRate
      FROM company_metrics
      GROUP BY reporting_period
      ORDER BY reporting_period
    `;

    const results = await this.db.query<{
      reporting_period: number;
      totalGenerated: number;
      totalRecovered: number;
      recoveryRate: number;
    }>(query);

    return results.map((result, index) => ({
      period: result.reporting_period.toString(),
      totalGenerated: result.totalGenerated,
      totalRecovered: result.totalRecovered,
      recoveryRate: result.recoveryRate,
      yearOverYearChange: index > 0 ? 
        ((result.recoveryRate - results[index - 1].recoveryRate) / results[index - 1].recoveryRate) * 100 : 0
    }));
  }

  private async getTopPerformers(companyIds: string[]): Promise<CompanySummary[]> {
    if (companyIds.length === 0) return [];

    const placeholders = companyIds.map(() => '?').join(',');
    const query = `
      SELECT 
        c.id as companyId,
        c.company_name as companyName,
        c.country,
        c.sector,
        c.industry,
        c.employees,
        cm.total_waste_generated as totalWasteGenerated,
        cm.recovery_rate as recoveryRate,
        cm.reporting_period as lastReportingPeriod
      FROM companies c
      LEFT JOIN company_metrics cm ON c.id = cm.company_id
      WHERE c.id IN (${placeholders})
      ORDER BY cm.recovery_rate DESC
    `;

    const results = await this.db.query<{
      companyId: string;
      companyName: string;
      country: string;
      sector: string;
      industry: string;
      employees: number;
      totalWasteGenerated: number;
      recoveryRate: number;
      lastReportingPeriod: number;
    }>(query, companyIds);

    return results.map(result => ({
      companyId: result.companyId,
      companyName: result.companyName,
      country: result.country,
      sector: result.sector,
      industry: result.industry,
      employees: result.employees,
      totalWasteGenerated: result.totalWasteGenerated,
      recoveryRate: result.recoveryRate,
      opportunityScore: 0, // TODO: Calculate
      complianceRisk: 'medium' as any,
      lastReportingPeriod: result.lastReportingPeriod
    }));
  }

  private async getTopCompanyPerformers(limit: number): Promise<CompanySummary[]> {
    const query = `
      SELECT 
        c.id as companyId,
        c.company_name as companyName,
        c.country,
        c.sector,
        c.industry,
        c.employees,
        cm.total_waste_generated as totalWasteGenerated,
        cm.recovery_rate as recoveryRate,
        cm.reporting_period as lastReportingPeriod
      FROM companies c
      LEFT JOIN company_metrics cm ON c.id = cm.company_id
      WHERE cm.recovery_rate > 0
      ORDER BY cm.recovery_rate DESC, cm.total_waste_generated DESC
      LIMIT ?
    `;

    const results = await this.db.query<{
      companyId: string;
      companyName: string;
      country: string;
      sector: string;
      industry: string;
      employees: number;
      totalWasteGenerated: number;
      recoveryRate: number;
      lastReportingPeriod: number;
    }>(query, [limit]);

    return results.map(result => ({
      companyId: result.companyId,
      companyName: result.companyName,
      country: result.country,
      sector: result.sector,
      industry: result.industry,
      employees: result.employees,
      totalWasteGenerated: result.totalWasteGenerated,
      recoveryRate: result.recoveryRate,
      opportunityScore: 0,
      complianceRisk: 'medium' as any,
      lastReportingPeriod: result.lastReportingPeriod
    }));
  }

  private async getWorstCompanyPerformers(limit: number): Promise<CompanySummary[]> {
    const query = `
      SELECT 
        c.id as companyId,
        c.company_name as companyName,
        c.country,
        c.sector,
        c.industry,
        c.employees,
        cm.total_waste_generated as totalWasteGenerated,
        cm.recovery_rate as recoveryRate,
        cm.reporting_period as lastReportingPeriod
      FROM companies c
      LEFT JOIN company_metrics cm ON c.id = cm.company_id
      WHERE cm.recovery_rate >= 0 AND cm.total_waste_generated > 1000
      ORDER BY cm.recovery_rate ASC, cm.total_waste_generated DESC
      LIMIT ?
    `;

    const results = await this.db.query<{
      companyId: string;
      companyName: string;
      country: string;
      sector: string;
      industry: string;
      employees: number;
      totalWasteGenerated: number;
      recoveryRate: number;
      lastReportingPeriod: number;
    }>(query, [limit]);

    return results.map(result => ({
      companyId: result.companyId,
      companyName: result.companyName,
      country: result.country,
      sector: result.sector,
      industry: result.industry,
      employees: result.employees,
      totalWasteGenerated: result.totalWasteGenerated,
      recoveryRate: result.recoveryRate,
      opportunityScore: 0,
      complianceRisk: 'high' as any,
      lastReportingPeriod: result.lastReportingPeriod
    }));
  }

  private async getSectorLeaderboard(): Promise<SectorLeaderboard[]> {
    const query = `
      SELECT 
        sector,
        COUNT(DISTINCT company_id) as companyCount,
        AVG(recovery_rate) as averageRecoveryRate,
        SUM(total_waste_generated) as totalWaste,
        MAX(recovery_rate) as bestRecoveryRate
      FROM company_profiles
      WHERE recovery_rate > 0
      GROUP BY sector
      ORDER BY averageRecoveryRate DESC
    `;

    const results = await this.db.query<{
      sector: string;
      companyCount: number;
      averageRecoveryRate: number;
      totalWaste: number;
      bestRecoveryRate: number;
    }>(query);

    return results.map((result, index) => ({
      sector: result.sector,
      averageRecoveryRate: result.averageRecoveryRate,
      totalWaste: result.totalWaste,
      companyCount: result.companyCount,
      topCompany: '', // TODO: Get top company name
      opportunityScore: Math.max(0, 100 - result.averageRecoveryRate) * 1.2 // Inverse of recovery rate
    }));
  }

  private async getCountryLeaderboard(): Promise<CountryLeaderboard[]> {
    const query = `
      SELECT 
        country,
        COUNT(DISTINCT id) as companyCount,
        AVG(recovery_rate) as averageRecoveryRate,
        SUM(total_waste_generated) as totalWaste
      FROM company_profiles
      WHERE recovery_rate > 0
      GROUP BY country
      ORDER BY averageRecoveryRate DESC
    `;

    const results = await this.db.query<{
      country: string;
      companyCount: number;
      averageRecoveryRate: number;
      totalWaste: number;
    }>(query);

    return results.map(result => ({
      country: result.country,
      averageRecoveryRate: result.averageRecoveryRate,
      totalWaste: result.totalWaste,
      companyCount: result.companyCount,
      regulatoryStrength: this.getRegulatorySt
      marketMaturity: this.getMarketMaturity(result.country)
    }));
  }

  private async getSectorBenchmarks(): Promise<Map<string, number>> {
    const query = `
      SELECT sector, AVG(recovery_rate) as avgRecoveryRate
      FROM company_metrics cm
      JOIN companies c ON cm.company_id = c.id
      WHERE recovery_rate > 0
      GROUP BY sector
    `;

    const results = await this.db.query<{
      sector: string;
      avgRecoveryRate: number;
    }>(query);

    return new Map(results.map(r => [r.sector, r.avgRecoveryRate]));
  }

  private parseJsonArray(jsonString: string | null): string[] {
    if (!jsonString) return [];
    try {
      return JSON.parse(jsonString);
    } catch {
      return [];
    }
  }

  private getRegulatoryStre
    // Regulatory strength based on EU waste framework directive implementation
    const scores: { [key: string]: number } = {
      'Germany': 95,
      'France': 88,
      'Switzerland': 92,
      'Austria': 87,
      'Belgium': 85,
      'Italy': 78,
      'Luxembourg': 90
    };
    return scores[country] || 70;
  }

  private getMarketMaturity(country: string): number {
    // Market maturity based on circular economy development
    const scores: { [key: string]: number } = {
      'Germany': 92,
      'Switzerland': 90,
      'France': 85,
      'Austria': 83,
      'Belgium': 80,
      'Luxembourg': 85,
      'Italy': 75
    };
    return scores[country] || 70;
  }
}
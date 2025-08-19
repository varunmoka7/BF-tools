/**
 * Company Service - Business logic for company data operations
 */

import { differenceInYears } from 'date-fns';
import DatabaseConnection from '../database/connection';
import {
  CompanySummary,
  CompanyProfile,
  YearlyWasteData,
  WasteStreamSummary,
  BenchmarkData,
  RiskAssessment,
  CompanySearchParams,
  SearchResult,
  ComplianceRisk,
  OperationalRisk,
  FinancialRisk,
  ReputationalRisk,
  TrendDirection,
  WasteMetric
} from '../types/waste';

export class CompanyService {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  public async searchCompanies(params: CompanySearchParams): Promise<SearchResult<CompanySummary>> {
    const {
      country,
      sector,
      industry,
      minWaste = 0,
      maxWaste = Number.MAX_SAFE_INTEGER,
      minRecoveryRate = 0,
      maxRecoveryRate = 100,
      page = 1,
      limit = 50,
      sortBy = 'recovery_rate',
      sortOrder = 'desc'
    } = params;

    // Build WHERE clause
    const conditions: string[] = ['cm.total_waste_generated IS NOT NULL'];
    const queryParams: any[] = [];

    if (country) {
      conditions.push('c.country = ?');
      queryParams.push(country);
    }

    if (sector) {
      conditions.push('c.sector = ?');
      queryParams.push(sector);
    }

    if (industry) {
      conditions.push('c.industry = ?');
      queryParams.push(industry);
    }

    conditions.push('cm.total_waste_generated BETWEEN ? AND ?');
    queryParams.push(minWaste, maxWaste);

    conditions.push('cm.recovery_rate BETWEEN ? AND ?');
    queryParams.push(minRecoveryRate, maxRecoveryRate);

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Count total results
    const countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM companies c
      LEFT JOIN company_metrics cm ON c.id = cm.company_id
      ${whereClause}
    `;

    const countResult = await this.db.get<{ total: number }>(countQuery, queryParams);
    const total = countResult?.total || 0;

    // Main search query
    const searchQuery = `
      SELECT 
        c.id as companyId,
        c.company_name as companyName,
        c.country,
        c.sector,
        c.industry,
        c.employees,
        cm.total_waste_generated as totalWasteGenerated,
        cm.recovery_rate as recoveryRate,
        cm.reporting_period as lastReportingPeriod,
        COALESCE(ra.overall_score, 0) as riskScore,
        COALESCE(ra.compliance_risk, 'medium') as complianceRisk
      FROM companies c
      LEFT JOIN company_metrics cm ON c.id = cm.company_id
      LEFT JOIN risk_assessments ra ON c.id = ra.company_id
      ${whereClause}
      ORDER BY ${this.buildOrderBy(sortBy, sortOrder)}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, (page - 1) * limit);

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
      riskScore: number;
      complianceRisk: string;
    }>(searchQuery, queryParams);

    const companies: CompanySummary[] = await Promise.all(
      results.map(async result => ({
        companyId: result.companyId,
        companyName: result.companyName,
        country: result.country,
        sector: result.sector,
        industry: result.industry,
        employees: result.employees,
        totalWasteGenerated: result.totalWasteGenerated,
        recoveryRate: result.recoveryRate,
        opportunityScore: await this.calculateOpportunityScore(result.companyId),
        complianceRisk: result.complianceRisk as ComplianceRisk,
        lastReportingPeriod: result.lastReportingPeriod
      }))
    );

    return {
      data: companies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  public async getCompanyProfile(companyId: string): Promise<CompanyProfile | null> {
    // Get basic company info
    const companyQuery = `
      SELECT 
        c.id as companyId,
        c.company_name as companyName,
        c.country,
        c.sector,
        c.industry,
        c.employees,
        c.year_of_disclosure,
        c.document_urls,
        c.source_names,
        c.source_urls
      FROM companies c
      WHERE c.id = ?
    `;

    const company = await this.db.get<{
      companyId: string;
      companyName: string;
      country: string;
      sector: string;
      industry: string;
      employees: number;
      year_of_disclosure: number;
      document_urls: string;
      source_names: string;
      source_urls: string;
    }>(companyQuery, [companyId]);

    if (!company) {
      return null;
    }

    // Get latest metrics
    const metricsQuery = `
      SELECT 
        total_waste_generated,
        recovery_rate,
        reporting_period
      FROM company_metrics
      WHERE company_id = ?
      ORDER BY reporting_period DESC
      LIMIT 1
    `;

    const metrics = await this.db.get<{
      total_waste_generated: number;
      recovery_rate: number;
      reporting_period: number;
    }>(metricsQuery, [companyId]);

    // Get historical data
    const historicalData = await this.getHistoricalData(companyId);

    // Get waste streams
    const wasteStreams = await this.getWasteStreamsSummary(companyId);

    // Get benchmark data
    const benchmarkData = await this.getBenchmarkData(company.sector, company.country, company.industry);

    // Get opportunities
    const opportunities = await this.getCompanyOpportunities(companyId);

    // Get risk assessment
    const riskAssessment = await this.getRiskAssessment(companyId);

    // Calculate opportunity score
    const opportunityScore = await this.calculateOpportunityScore(companyId);

    return {
      companyId: company.companyId,
      companyName: company.companyName,
      country: company.country,
      sector: company.sector,
      industry: company.industry,
      employees: company.employees,
      totalWasteGenerated: metrics?.total_waste_generated || 0,
      recoveryRate: metrics?.recovery_rate || 0,
      opportunityScore,
      complianceRisk: riskAssessment.complianceRisk,
      lastReportingPeriod: metrics?.reporting_period || company.year_of_disclosure,
      historicalData,
      wasteStreams,
      benchmarkData,
      opportunities,
      riskAssessment
    };
  }

  private async getHistoricalData(companyId: string): Promise<YearlyWasteData[]> {
    const query = `
      SELECT 
        reporting_period as year,
        total_waste_generated as totalGenerated,
        total_waste_recovered as totalRecovered,
        total_waste_disposed as totalDisposed,
        recovery_rate as recoveryRate,
        hazardous_waste_generated as hazardousWaste,
        non_hazardous_waste_generated as nonHazardousWaste
      FROM company_metrics
      WHERE company_id = ?
      ORDER BY reporting_period ASC
    `;

    return await this.db.query<YearlyWasteData>(query, [companyId]);
  }

  private async getWasteStreamsSummary(companyId: string): Promise<WasteStreamSummary[]> {
    const query = `
      SELECT 
        metric,
        hazardousness,
        AVG(value) as currentValue,
        MAX(reporting_period) as latestPeriod
      FROM waste_streams
      WHERE company_id = ?
      GROUP BY metric, hazardousness
      ORDER BY currentValue DESC
    `;

    const streams = await this.db.query<{
      metric: string;
      hazardousness: string;
      currentValue: number;
      latestPeriod: number;
    }>(query, [companyId]);

    // Get previous values for trend calculation
    const summaries: WasteStreamSummary[] = [];

    for (const stream of streams) {
      const previousQuery = `
        SELECT AVG(value) as previousValue
        FROM waste_streams
        WHERE company_id = ? AND metric = ? AND hazardousness = ?
          AND reporting_period < ?
      `;

      const previous = await this.db.get<{ previousValue: number }>(
        previousQuery, 
        [companyId, stream.metric, stream.hazardousness, stream.latestPeriod]
      );

      const previousValue = previous?.previousValue || null;
      const changePercent = previousValue 
        ? ((stream.currentValue - previousValue) / previousValue) * 100 
        : null;

      let trend: TrendDirection = TrendDirection.STABLE;
      if (changePercent !== null) {
        if (changePercent > 5) trend = TrendDirection.INCREASING;
        else if (changePercent < -5) trend = TrendDirection.DECREASING;
      }

      summaries.push({
        metric: stream.metric as WasteMetric,
        hazardousness: stream.hazardousness as any,
        currentValue: stream.currentValue,
        previousValue,
        changePercent,
        trend
      });
    }

    return summaries;
  }

  private async getBenchmarkData(sector: string, country: string, industry: string): Promise<BenchmarkData> {
    // Sector average
    const sectorQuery = `
      SELECT AVG(cm.recovery_rate) as avgRecoveryRate
      FROM company_metrics cm
      JOIN companies c ON cm.company_id = c.id
      WHERE c.sector = ? AND cm.recovery_rate > 0
    `;
    const sectorResult = await this.db.get<{ avgRecoveryRate: number }>(sectorQuery, [sector]);

    // Country average
    const countryQuery = `
      SELECT AVG(cm.recovery_rate) as avgRecoveryRate
      FROM company_metrics cm
      JOIN companies c ON cm.company_id = c.id
      WHERE c.country = ? AND cm.recovery_rate > 0
    `;
    const countryResult = await this.db.get<{ avgRecoveryRate: number }>(countryQuery, [country]);

    // Industry average
    const industryQuery = `
      SELECT AVG(cm.recovery_rate) as avgRecoveryRate
      FROM company_metrics cm
      JOIN companies c ON cm.company_id = c.id
      WHERE c.industry = ? AND cm.recovery_rate > 0
    `;
    const industryResult = await this.db.get<{ avgRecoveryRate: number }>(industryQuery, [industry]);

    const sectorAverage = sectorResult?.avgRecoveryRate || 0;
    const countryAverage = countryResult?.avgRecoveryRate || 0;
    const industryAverage = industryResult?.avgRecoveryRate || 0;

    // Calculate percentile ranking (simplified)
    const percentileQuery = `
      SELECT COUNT(*) as totalCount,
             SUM(CASE WHEN cm2.recovery_rate < cm1.recovery_rate THEN 1 ELSE 0 END) as lowerCount
      FROM company_metrics cm1
      JOIN companies c1 ON cm1.company_id = c1.id
      CROSS JOIN company_metrics cm2
      JOIN companies c2 ON cm2.company_id = c2.id
      WHERE c1.sector = ? AND cm1.recovery_rate > 0 AND cm2.recovery_rate > 0
    `;
    
    const percentileResult = await this.db.get<{ totalCount: number; lowerCount: number }>(
      percentileQuery, [sector]
    );
    
    const percentileRanking = percentileResult 
      ? (percentileResult.lowerCount / percentileResult.totalCount) * 100 
      : 50;

    return {
      sectorAverage,
      countryAverage,
      industryAverage,
      percentileRanking,
      improvementPotential: Math.max(0, Math.max(sectorAverage, countryAverage, industryAverage) - sectorAverage)
    };
  }

  private async getCompanyOpportunities(companyId: string) {
    const query = `
      SELECT 
        id,
        opportunity_type as type,
        title,
        description,
        potential_value as potentialValue,
        priority,
        implementation_complexity as implementationComplexity,
        payback_period as paybackPeriod,
        carbon_impact as carbonImpact
      FROM opportunities
      WHERE company_id = ?
      ORDER BY potential_value DESC
    `;

    return await this.db.query(query, [companyId]);
  }

  private async getRiskAssessment(companyId: string): Promise<RiskAssessment> {
    const query = `
      SELECT 
        overall_score as overallScore,
        compliance_risk as complianceRisk,
        operational_risk as operationalRisk,
        financial_risk as financialRisk,
        reputational_risk as reputationalRisk
      FROM risk_assessments
      WHERE company_id = ?
    `;

    const result = await this.db.get<{
      overallScore: number;
      complianceRisk: string;
      operationalRisk: string;
      financialRisk: string;
      reputationalRisk: string;
    }>(query, [companyId]);

    if (result) {
      return {
        overallScore: result.overallScore,
        complianceRisk: result.complianceRisk as ComplianceRisk,
        operationalRisk: result.operationalRisk as OperationalRisk,
        financialRisk: result.financialRisk as FinancialRisk,
        reputationalRisk: result.reputationalRisk as ReputationalRisk
      };
    }

    // Default risk assessment if none exists
    return {
      overallScore: 50,
      complianceRisk: ComplianceRisk.MEDIUM,
      operationalRisk: OperationalRisk.MEDIUM,
      financialRisk: FinancialRisk.MEDIUM,
      reputationalRisk: ReputationalRisk.MEDIUM
    };
  }

  private async calculateOpportunityScore(companyId: string): Promise<number> {
    const query = `
      SELECT 
        cm.total_waste_generated,
        cm.recovery_rate,
        c.sector
      FROM company_metrics cm
      JOIN companies c ON cm.company_id = c.id
      WHERE cm.company_id = ?
      ORDER BY cm.reporting_period DESC
      LIMIT 1
    `;

    const result = await this.db.get<{
      total_waste_generated: number;
      recovery_rate: number;
      sector: string;
    }>(query, [companyId]);

    if (!result) return 0;

    // Get sector benchmark
    const benchmarkQuery = `
      SELECT AVG(cm.recovery_rate) as sectorAvg
      FROM company_metrics cm
      JOIN companies c ON cm.company_id = c.id
      WHERE c.sector = ? AND cm.recovery_rate > 0
    `;

    const benchmark = await this.db.get<{ sectorAvg: number }>(benchmarkQuery, [result.sector]);
    const sectorAverage = benchmark?.sectorAvg || 75;

    // Calculate opportunity score
    const wasteVolumeFactor = Math.min(result.total_waste_generated / 10000, 10); // Cap at 10
    const recoveryGapFactor = Math.max(0, sectorAverage - result.recovery_rate) / 10;
    const marketValueFactor = result.total_waste_generated * 0.00015; // €150/tonne

    const opportunityScore = (wasteVolumeFactor * 30 + recoveryGapFactor * 50 + marketValueFactor * 20) / 100;

    return Math.min(Math.max(opportunityScore, 0), 100);
  }

  private buildOrderBy(sortBy: string, sortOrder: 'asc' | 'desc'): string {
    const validSortFields: { [key: string]: string } = {
      'company_name': 'c.company_name',
      'country': 'c.country',
      'sector': 'c.sector',
      'industry': 'c.industry',
      'employees': 'c.employees',
      'total_waste_generated': 'cm.total_waste_generated',
      'recovery_rate': 'cm.recovery_rate',
      'risk_score': 'COALESCE(ra.overall_score, 0)'
    };

    const field = validSortFields[sortBy] || validSortFields['recovery_rate'];
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    return `${field} ${order}`;
  }

  public async getCompanyNames(searchTerm?: string): Promise<{ id: string; name: string }[]> {
    let query = 'SELECT id, company_name as name FROM companies';
    const params: any[] = [];

    if (searchTerm) {
      query += ' WHERE company_name LIKE ?';
      params.push(`%${searchTerm}%`);
    }

    query += ' ORDER BY company_name LIMIT 100';

    return await this.db.query(query, params);
  }

  public async getUniqueCountries(): Promise<string[]> {
    const results = await this.db.query<{ country: string }>('SELECT DISTINCT country FROM companies ORDER BY country');
    return results.map(r => r.country);
  }

  public async getUniqueSectors(): Promise<string[]> {
    const results = await this.db.query<{ sector: string }>('SELECT DISTINCT sector FROM companies ORDER BY sector');
    return results.map(r => r.sector);
  }

  public async getUniqueIndustries(): Promise<string[]> {
    const results = await this.db.query<{ industry: string }>('SELECT DISTINCT industry FROM companies ORDER BY industry');
    return results.map(r => r.industry);
  }
}
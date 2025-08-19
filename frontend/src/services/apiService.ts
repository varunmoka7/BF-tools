// API service for connecting to the unified server backend
import { GlobalStats, SectorLeaderboard, Company, KPIMetric } from '../types/waste';

// Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Use same origin in production
  : 'http://localhost:3000'; // Use unified server in development

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async fetchApi<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      return data.data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Global statistics for world map
  async getGlobalStats(): Promise<GlobalStats> {
    const stats = await this.fetchApi<any>('/global-stats');
    return {
      totalCompanies: stats.totalCompanies,
      totalCountries: stats.totalCountries,
      totalSectors: stats.totalSectors,
      averageRecoveryRate: stats.averageRecoveryRate,
      totalWasteManaged: stats.totalWasteManaged,
      highPerformers: stats.highPerformers
    };
  }

  // Sector leaderboards and rankings
  async getSectorLeaderboards(): Promise<SectorLeaderboard[]> {
    const sectors = await this.fetchApi<any[]>('/sectors');
    return sectors.map(sector => ({
      sector: sector.sector,
      companies: sector.companies.map((company: any) => ({
        id: company.companyId || company.id,
        name: company.company_name || company.name,
        country: company.country,
        recoveryRate: company.recoveryRate,
        wasteVolume: company.totalWasteGenerated || company.wasteVolume,
        improvementTrend: Math.random() * 10 - 5, // Mock trend for now
        performanceRating: this.getPerformanceRating(company.recoveryRate),
        marketShare: Math.random() * 15 + 5 // Mock market share
      }))
    }));
  }

  // Company search and filtering
  async getCompanies(filters?: {
    country?: string;
    sector?: string;
    industry?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Company[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (filters?.country) queryParams.append('country', filters.country);
    if (filters?.sector) queryParams.append('sector', filters.sector);
    if (filters?.industry) queryParams.append('industry', filters.industry);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const endpoint = `/companies${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const result = await this.fetchApi<any>(endpoint);
    
    return {
      data: result.data.map((company: any) => ({
        id: company.companyId,
        name: company.company_name,
        country: company.country,
        sector: company.sector,
        industry: company.industry,
        employees: company.employees,
        // Map backend fields to frontend fields for backward compatibility
        totalWaste: company.totalWasteGenerated || 0,
        recyclingRate: company.recoveryRate || 0,
        carbonFootprint: Math.round((company.totalWasteGenerated || 0) * 0.5), // Estimated
        complianceScore: this.getComplianceScore(company.complianceRisk || 'medium'),
        // Additional fields
        recoveryRate: company.recoveryRate,
        totalWasteGenerated: company.totalWasteGenerated,
        opportunityScore: company.opportunityScore,
        complianceRisk: company.complianceRisk,
        lastReportingPeriod: company.lastReportingPeriod
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    };
  }

  // Individual company profile
  async getCompanyById(id: string): Promise<Company | null> {
    try {
      const company = await this.fetchApi<any>(`/companies/${id}`);
      
      return {
        id: company.companyId,
        company_name: company.company_name,
        country: company.country,
        sector: company.sector,
        industry: company.industry,
        employees: company.employees,
        year_of_disclosure: company.year_of_disclosure || 2024,
        // Additional fields
        ticker: company.ticker,
        exchange: company.exchange,
        coordinates: company.coordinates,
        document_urls: company.document_urls,
        source_names: company.source_names,
        source_urls: company.source_urls
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // Analytics and KPIs
  async getAnalytics(): Promise<{
    kpis: KPIMetric[];
    sectorPerformance: any[];
    insights: string[];
  }> {
    return await this.fetchApi<any>('/analytics');
  }

  // Filter options
  async getFilterOptions(): Promise<{
    countries: string[];
    sectors: string[];
    industries: string[];
  }> {
    return await this.fetchApi<any>('/companies/filters/options');
  }

  // Generate waste data for dashboard compatibility
  async getWasteData() {
    const companies = await this.getCompanies({ limit: 100 });
    
    // Group companies by country and aggregate data
    const countryGroups = companies.data.reduce((acc, company) => {
      if (!acc[company.country]) {
        acc[company.country] = {
          companies: [],
          totalWaste: 0,
          totalRecovered: 0,
          totalHazardous: 0
        };
      }
      acc[company.country].companies.push(company);
      const wasteAmount = company.totalWaste || company.totalWasteGenerated || 0;
      const recoveryRate = company.recyclingRate || company.recoveryRate || 0;
      acc[company.country].totalWaste += wasteAmount;
      acc[company.country].totalRecovered += (wasteAmount * recoveryRate / 100);
      acc[company.country].totalHazardous += (wasteAmount * 0.15); // Assume 15% hazardous
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(countryGroups).map(([country, data], index) => ({
      id: `country-${index + 1}`,
      country,
      countryCode: country === 'Germany' ? 'DE' : 'XX',
      coordinates: [52.5200, 13.4050] as [number, number], // Default to Berlin for German companies
      year: 2024,
      totalWaste: data.totalWaste,
      hazardousWaste: data.totalHazardous,
      recoveryRate: data.totalWaste > 0 ? (data.totalRecovered / data.totalWaste) * 100 : 0,
      disposalRate: data.totalWaste > 0 ? ((data.totalWaste - data.totalRecovered) / data.totalWaste) * 100 : 0,
      treatmentMethods: {
        recycling: 50,
        composting: 8,
        energyRecovery: 15,
        landfill: 17,
        incineration: 10
      },
      wasteTypes: {
        municipal: 25,
        industrial: 45,
        construction: 15,
        electronic: 10,
        medical: 5
      },
      marketOpportunity: Math.round((85 - (data.totalRecovered / data.totalWaste) * 100) * data.totalWaste * 0.15 / 1000)
    }));
  }

  // Generate company data for compatibility
  async getCompanyData() {
    const result = await this.getCompanies({ limit: 100 });
    return result.data.map(company => ({
      id: company.id,
      name: company.company_name,
      country: company.country,
      sector: company.sector,
      industry: company.industry,
      employees: company.employees,
      totalWaste: company.totalWaste || company.totalWasteGenerated || 0,
      recyclingRate: company.recyclingRate || company.recoveryRate || 0,
      carbonFootprint: company.carbonFootprint || Math.round((company.totalWaste || company.totalWasteGenerated || 0) * 0.5),
      complianceScore: company.complianceScore || this.getComplianceScore(company.complianceRisk || 'medium'),
      recoveryRates: this.generateHistoricalData(company.recyclingRate || company.recoveryRate || 0),
      wasteGenerated: this.generateHistoricalData(company.totalWaste || company.totalWasteGenerated || 0, 0.1),
      hazardousShare: Math.floor(Math.random() * 20) + 5
    }));
  }

  private getPerformanceRating(recoveryRate: number): 'leader' | 'average' | 'hotspot' {
    if (recoveryRate >= 75) return 'leader';
    if (recoveryRate >= 60) return 'average';
    return 'hotspot';
  }

  private getComplianceScore(risk: string): number {
    const scoreMap: { [key: string]: number } = {
      'low': 90,
      'medium': 75,
      'high': 60
    };
    return scoreMap[risk] || 75;
  }

  private generateHistoricalData(baseValue: number, variancePercent: number = 0.05): number[] {
    const variance = baseValue * variancePercent;
    return Array.from({ length: 5 }, () => 
      Math.round(baseValue + (Math.random() - 0.5) * variance * 2)
    );
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/health`);
    return await response.json();
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export individual functions for backward compatibility
export const getCompanyData = () => apiService.getCompanyData();
export const getWasteData = () => apiService.getWasteData();
export const getSectorLeaderboards = () => apiService.getSectorLeaderboards();
export const getGlobalStats = () => apiService.getGlobalStats();
export const getCompanies = (filters?: any) => apiService.getCompanies(filters);
export const getCompanyById = (id: string) => apiService.getCompanyById(id);
export const getAnalytics = () => apiService.getAnalytics();
export const getFilterOptions = () => apiService.getFilterOptions();
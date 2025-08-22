import { Company } from '@/types/map';

export interface MapDataService {
  getCompanies(): Promise<Company[]>;
  getCompaniesByCountry(country: string): Promise<Company[]>;
  getCompaniesBySector(sector: string): Promise<Company[]>;
  searchCompanies(query: string): Promise<Company[]>;
  getCountryStats(): Promise<CountryStats[]>;
}

export interface CountryStats {
  name: string;
  companyCount: number;
  totalEmployees: number;
  averageEmployees: number;
  sectors: string[];
  coordinates: [number, number];
}

export class MapDataServiceImpl implements MapDataService {
  private companiesCache: Company[] | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getCompanies(): Promise<Company[]> {
    if (this.shouldUseCache()) {
      return this.companiesCache!;
    }

    try {
      const response = await fetch('/api/companies-with-coordinates');
      if (!response.ok) {
        throw new Error('Failed to fetch companies data');
      }
      
      const companies = await response.json();
      this.updateCache(companies);
      return companies;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  }

  async getCompaniesByCountry(country: string): Promise<Company[]> {
    const companies = await this.getCompanies();
    return companies.filter(company => 
      company.country.toLowerCase() === country.toLowerCase()
    );
  }

  async getCompaniesBySector(sector: string): Promise<Company[]> {
    const companies = await this.getCompanies();
    return companies.filter(company => 
      company.sector.toLowerCase() === sector.toLowerCase()
    );
  }

  async searchCompanies(query: string): Promise<Company[]> {
    const companies = await this.getCompanies();
    const lowerQuery = query.toLowerCase();
    
    return companies.filter(company => 
      company.name.toLowerCase().includes(lowerQuery) ||
      company.country.toLowerCase().includes(lowerQuery) ||
      company.sector.toLowerCase().includes(lowerQuery) ||
      company.industry.toLowerCase().includes(lowerQuery)
    );
  }

  async getCountryStats(): Promise<CountryStats[]> {
    const companies = await this.getCompanies();
    const countryMap = new Map<string, CountryStats>();
    
    companies.forEach(company => {
      const country = company.country;
      if (!countryMap.has(country)) {
        countryMap.set(country, {
          name: country,
          companyCount: 0,
          totalEmployees: 0,
          averageEmployees: 0,
          sectors: [],
          coordinates: [company.coordinates.lat, company.coordinates.lng]
        });
      }
      
      const stats = countryMap.get(country)!;
      stats.companyCount++;
      stats.totalEmployees += company.employees;
      
      if (!stats.sectors.includes(company.sector)) {
        stats.sectors.push(company.sector);
      }
    });
    
    // Calculate averages
    countryMap.forEach(stats => {
      stats.averageEmployees = Math.round(stats.totalEmployees / stats.companyCount);
    });
    
    return Array.from(countryMap.values()).sort((a, b) => b.companyCount - a.companyCount);
  }

  private shouldUseCache(): boolean {
    return this.companiesCache !== null && Date.now() < this.cacheExpiry;
  }

  private updateCache(companies: Company[]): void {
    this.companiesCache = companies;
    this.cacheExpiry = Date.now() + this.CACHE_DURATION;
  }

  // Clear cache (useful for testing or manual refresh)
  clearCache(): void {
    this.companiesCache = null;
    this.cacheExpiry = 0;
  }
}

// Export singleton instance
export const mapDataService = new MapDataServiceImpl();

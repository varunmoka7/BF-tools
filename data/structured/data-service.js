/**
 * Data Service for Structured Dashboard Data
 * 
 * This module provides a clean interface to load and manage
 * structured data from separate JSON files for each dashboard section.
 */

class DataService {
    constructor() {
        this.basePath = './data/structured/';
        this.cache = new Map();
        this.loading = new Map();
    }

    /**
     * Load data from a specific JSON file
     */
    async loadDataFile(filename) {
        if (this.cache.has(filename)) {
            return this.cache.get(filename);
        }

        if (this.loading.has(filename)) {
            return this.loading.get(filename);
        }

        const loadPromise = this._fetchDataFile(filename);
        this.loading.set(filename, loadPromise);

        try {
            const data = await loadPromise;
            this.cache.set(filename, data);
            this.loading.delete(filename);
            return data;
        } catch (error) {
            this.loading.delete(filename);
            throw error;
        }
    }

    /**
     * Load all dashboard data
     */
    async loadAllData() {
        try {
            console.log('🔄 Loading all dashboard data...');
            
            const [
                companies,
                wasteMetrics,
                companyProfiles,
                sectorAnalytics,
                countryStats,
                masterIndex,
                dataSummary
            ] = await Promise.all([
                this.loadDataFile('companies.json'),
                this.loadDataFile('waste-metrics.json'),
                this.loadDataFile('company-profiles.json'),
                this.loadDataFile('sector-analytics.json'),
                this.loadDataFile('country-stats.json'),
                this.loadDataFile('master-index.json'),
                this.loadDataFile('data-summary.json')
            ]);

            const dashboardData = {
                companies,
                wasteMetrics,
                companyProfiles,
                sectorAnalytics,
                countryStats,
                masterIndex,
                dataSummary,
                loadedAt: new Date().toISOString()
            };

            console.log('✅ All dashboard data loaded successfully');
            console.log(`🏢 Companies: ${companies.length}`);
            console.log(`📊 Waste Metrics: ${wasteMetrics.length}`);
            console.log(`🌍 Countries: ${countryStats.length}`);
            console.log(`🏭 Sectors: ${sectorAnalytics.length}`);

            return dashboardData;

        } catch (error) {
            console.error('❌ Failed to load dashboard data:', error);
            throw error;
        }
    }

    /**
     * Load specific section data
     */
    async loadSectionData(section) {
        const sectionFiles = {
            dashboard: ['companies.json', 'sector-analytics.json', 'country-stats.json'],
            companies: ['companies.json', 'company-profiles.json'],
            waste: ['waste-metrics.json', 'companies.json'],
            analytics: ['sector-analytics.json', 'country-stats.json', 'data-summary.json']
        };

        if (!sectionFiles[section]) {
            throw new Error(`Unknown section: ${section}`);
        }

        try {
            const data = {};
            for (const filename of sectionFiles[section]) {
                const sectionData = await this.loadDataFile(filename);
                const key = filename.replace('.json', '');
                data[key] = sectionData;
            }
            return data;
        } catch (error) {
            console.error(`❌ Failed to load ${section} data:`, error);
            throw error;
        }
    }

    /**
     * Get company by ID with all related data
     */
    async getCompanyDetails(companyId) {
        try {
            const [companies, profiles, wasteMetrics] = await Promise.all([
                this.loadDataFile('companies.json'),
                this.loadDataFile('company-profiles.json'),
                this.loadDataFile('waste-metrics.json')
            ]);

            const company = companies.find(c => c.id === companyId);
            if (!company) {
                throw new Error(`Company not found: ${companyId}`);
            }

            const profile = profiles.find(p => p.company_id === companyId);
            const companyWasteMetrics = wasteMetrics.filter(w => w.company_id === companyId);

            return {
                ...company,
                profile,
                wasteMetrics: companyWasteMetrics
            };
        } catch (error) {
            console.error(`❌ Failed to get company details for ${companyId}:`, error);
            throw error;
        }
    }

    /**
     * Search companies with filters
     */
    async searchCompanies(filters = {}) {
        try {
            const companies = await this.loadDataFile('companies.json');
            
            let filtered = companies;

            // Apply filters
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filtered = filtered.filter(c => 
                    c.name.toLowerCase().includes(searchTerm) ||
                    c.sector.toLowerCase().includes(searchTerm) ||
                    c.country.toLowerCase().includes(searchTerm)
                );
            }

            if (filters.sector) {
                filtered = filtered.filter(c => c.sector === filters.sector);
            }

            if (filters.country) {
                filtered = filtered.filter(c => c.country === filters.country);
            }

            if (filters.industry) {
                filtered = filtered.filter(c => c.industry === filters.industry);
            }

            // Apply sorting
            if (filters.sortBy) {
                filtered.sort((a, b) => {
                    const aVal = a[filters.sortBy] || 0;
                    const bVal = b[filters.sortBy] || 0;
                    return filters.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
                });
            }

            return filtered;
        } catch (error) {
            console.error('❌ Failed to search companies:', error);
            throw error;
        }
    }

    /**
     * Get dashboard statistics
     */
    async getDashboardStats() {
        try {
            const [companies, sectorAnalytics, countryStats] = await Promise.all([
                this.loadDataFile('companies.json'),
                this.loadDataFile('sector-analytics.json'),
                this.loadDataFile('country-stats.json')
            ]);

            const totalEmployees = companies.reduce((sum, c) => sum + (c.employees || 0), 0);
            const countries = [...new Set(companies.map(c => c.country).filter(Boolean))];
            const sectors = [...new Set(companies.map(c => c.sector).filter(Boolean))];

            return {
                totalCompanies: companies.length,
                totalEmployees,
                countriesCovered: countries.length,
                sectorsCovered: sectors.length,
                topSectors: sectorAnalytics.slice(0, 5),
                topCountries: countryStats.slice(0, 5)
            };
        } catch (error) {
            console.error('❌ Failed to get dashboard stats:', error);
            throw error;
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        this.loading.clear();
        console.log('🗑️ Data cache cleared');
    }

    /**
     * Internal method to fetch data file
     */
    async _fetchDataFile(filename) {
        const response = await fetch(`${this.basePath}${filename}`);
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}: ${response.status}`);
        }
        return response.json();
    }
}

// Create global instance
window.dataService = new DataService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataService;
}

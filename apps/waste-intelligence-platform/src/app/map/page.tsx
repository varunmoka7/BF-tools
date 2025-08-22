'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, Globe, Building2, Users, MapPin } from 'lucide-react';
import { useCompanies, type Company } from '@/contexts/companies-context';
import { MapStats } from '@/types/map';

// Dynamic import to avoid SSR issues with Leaflet - optimized version
const GlobalWasteMap = dynamic(
  () => import('@/components/maps/optimized-global-waste-map'),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading global waste map...</p>
        </div>
      </div>
    )
  }
);

export default function MapPage() {
  const { companies, loading, error, metrics } = useCompanies();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  // Memoize stats calculation
  const stats = useMemo((): MapStats => {
    if (!metrics) {
      return {
        totalCompanies: 0,
        totalEmployees: 0,
        countriesCovered: 0,
        sectorsRepresented: 0
      };
    }
    
    return {
      totalCompanies: metrics.totalCompanies,
      totalEmployees: metrics.totalEmployees,
      countriesCovered: metrics.countriesCovered,
      sectorsRepresented: metrics.sectorsRepresented
    };
  }, [metrics]);

  // Memoize filtered companies to prevent unnecessary recalculations
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.country.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = selectedSector === 'all' || company.sector === selectedSector;
      return matchesSearch && matchesSector;
    });
  }, [companies, searchTerm, selectedSector]);

  // Memoize unique sectors for filter
  const sectors = useMemo(() => {
    return ['all', ...Array.from(new Set(companies.map(c => c.sector)))];
  }, [companies]);

  // Memoize company selection handler
  const handleCompanySelect = React.useCallback((company: Company) => {
    setSelectedCompany(company);
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-500 text-lg">Error loading map data: {error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Global Waste Intelligence Map</h1>
        <p className="text-gray-600">
          Explore waste management companies across Europe with interactive mapping and detailed insights
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Countries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.countriesCovered}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Filter className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Sectors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sectorsRepresented}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search companies or countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sectors.map(sector => (
                  <option key={sector} value={sector}>
                    {sector === 'all' ? 'All Sectors' : sector}
                  </option>
                ))}
              </select>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSector('all');
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map and Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Interactive Waste Intelligence Map
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-full">
              {loading ? (
                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading map data...</p>
                  </div>
                </div>
              ) : (
                <GlobalWasteMap 
                  companies={filteredCompanies} 
                  onCompanySelect={handleCompanySelect}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Company Details Sidebar */}
        <div className="lg:col-span-1">
          <Card className="h-[600px] overflow-y-auto">
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCompany ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedCompany.name}</h3>
                    <p className="text-gray-600">{selectedCompany.industry}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedCompany.country}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedCompany.sector}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {selectedCompany.employees.toLocaleString()} employees
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {selectedCompany.coordinates.address}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{selectedCompany.ticker}</Badge>
                      <Badge variant="outline">{selectedCompany.exchange}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      Latest disclosure: {selectedCompany.year_of_disclosure}
                    </p>
                  </div>
                  
                  <Button className="w-full">
                    View Full Profile
                  </Button>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a company on the map to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Map Instructions */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2">How to Use the Map</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-medium text-gray-800">1. Country View</p>
              <p>Click on country markers to see company counts and zoom in</p>
            </div>
            <div>
              <p className="font-medium text-gray-800">2. Company View</p>
              <p>Explore individual companies with sector-coded markers</p>
            </div>
            <div>
              <p className="font-medium text-gray-800">3. Search & Filter</p>
              <p>Use search bar and sector filters to find specific companies</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
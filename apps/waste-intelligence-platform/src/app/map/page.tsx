'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Search, Filter, Globe, Building2, Users, MapPin, AlertTriangle } from 'lucide-react';
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


  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-card p-8 bg-destructive/10 border border-destructive/20 rounded-2xl text-center max-w-md w-full">
          <div className="p-4 rounded-xl bg-red-500/20 inline-block mb-6">
            <AlertTriangle className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-4">Error Loading Map</h3>
          <p className="text-muted-foreground mb-6">Error loading map data: {error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-primary hover:bg-gradient-secondary text-white border-0 hover-lift transition-all duration-300 px-8 py-3"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <div className="glass-card p-8 bg-card border border-border rounded-2xl">
            <h1 className="text-4xl font-bold mb-4 gradient-animated bg-clip-text text-transparent">
              Global Waste Intelligence Map
            </h1>
            <p className="text-xl text-foreground max-w-3xl mx-auto">
              Explore waste management companies across Europe with interactive mapping and detailed insights
            </p>
            <div className="flex items-center justify-center mt-6 space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-muted-foreground text-sm">Interactive Map</span>
              </div>
              <div className="w-1 h-1 bg-muted rounded-full"></div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span className="text-muted-foreground text-sm">Real-time Data</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card hover-lift p-6 bg-card border border-border rounded-2xl group cursor-pointer transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-primary group-hover:scale-110 transition-transform duration-300">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Companies</p>
                <p className="text-3xl font-bold text-foreground animate-count">{stats.totalCompanies.toLocaleString()}</p>
              </div>
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>

          <div className="glass-card hover-lift p-6 bg-card border border-border rounded-2xl group cursor-pointer transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-secondary group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Employees</p>
                <p className="text-3xl font-bold text-foreground animate-count">{stats.totalEmployees.toLocaleString()}</p>
              </div>
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>

          <div className="glass-card hover-lift p-6 bg-card border border-border rounded-2xl group cursor-pointer transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-accent group-hover:scale-110 transition-transform duration-300">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Countries</p>
                <p className="text-3xl font-bold text-foreground animate-count">{stats.countriesCovered}</p>
              </div>
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>

          <div className="glass-card hover-lift p-6 bg-card border border-border rounded-2xl group cursor-pointer transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-primary group-hover:scale-110 transition-transform duration-300">
                <Filter className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Sectors</p>
                <p className="text-3xl font-bold text-foreground animate-count">{stats.sectorsRepresented}</p>
              </div>
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="glass-card p-6 bg-card border border-border rounded-2xl mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search companies or countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-border transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:ring-2 focus:ring-ring focus:border-border transition-all duration-300"
              >
                {sectors.map(sector => (
                  <option key={sector} value={sector} className="bg-background text-foreground">
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
                className="glass hover-lift bg-card border-border text-foreground hover:bg-card/80 transition-all duration-300 px-6"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Map Section - Full Width */}
        <div className="w-full">
          <div className="glass-card h-[700px] bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-primary">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                Interactive Waste Intelligence Map
              </h3>
            </div>
            <div className="h-full">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-muted border-t-foreground mx-auto"></div>
                    <p className="mt-4 text-muted-foreground text-lg">Loading map data...</p>
                  </div>
                </div>
              ) : (
                <div className="h-full rounded-b-2xl overflow-hidden">
                  <GlobalWasteMap 
                    companies={filteredCompanies} 
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Instructions */}
        <div className="glass-card p-6 bg-card border border-border rounded-2xl mt-6">
          <h3 className="font-bold text-foreground mb-6 text-xl flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-accent">
              <Search className="h-5 w-5 text-white" />
            </div>
            How to Use the Map
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-4 rounded-xl bg-muted/20 border border-border hover-lift transition-all duration-300">
              <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold">1</span>
                Country View
              </p>
              <p className="text-muted-foreground text-sm">Click on country markers to see company counts and zoom in</p>
            </div>
            <div className="glass p-4 rounded-xl bg-muted/20 border border-border hover-lift transition-all duration-300">
              <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">2</span>
                Company View
              </p>
              <p className="text-muted-foreground text-sm">Explore individual companies with sector-coded markers</p>
            </div>
            <div className="glass p-4 rounded-xl bg-muted/20 border border-border hover-lift transition-all duration-300">
              <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center text-white text-sm font-bold">3</span>
                Search & Filter
              </p>
              <p className="text-muted-foreground text-sm">Use search bar and sector filters to find specific companies</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
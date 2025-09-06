'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search, Filter, SortAsc, SortDesc, Building2, MapPin, Users, Calendar, TrendingUp } from 'lucide-react'

interface Company {
  id: string
  name: string
  country: string
  sector: string
  industry: string
  employees: number
  year_of_disclosure: number
  ticker: string
  exchange: string
  coordinates: {
    lat: number
    lng: number
    address: string
  }
}

type SortField = 'name' | 'country' | 'sector' | 'employees' | 'year_of_disclosure'
type SortDirection = 'asc' | 'desc'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedSector, setSelectedSector] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/companies-with-coordinates')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.status}`)
      }
      
      const data = await response.json()
      setCompanies(data)
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique values for filters
  const countries = useMemo(() => [...new Set(companies.map(c => c.country))].sort(), [companies])
  const sectors = useMemo(() => [...new Set(companies.map(c => c.sector))].sort(), [companies])
  const industries = useMemo(() => [...new Set(companies.map(c => c.industry))].sort(), [companies])

  // Sort and filter companies
  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = companies

    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.ticker.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCountry) {
      filtered = filtered.filter(company => company.country === selectedCountry)
    }

    if (selectedSector) {
      filtered = filtered.filter(company => company.sector === selectedSector)
    }

    if (selectedIndustry) {
      filtered = filtered.filter(company => company.industry === selectedIndustry)
    }

    // Sort companies
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'name') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [companies, searchTerm, selectedCountry, selectedSector, selectedIndustry, sortField, sortDirection])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCountry('')
    setSelectedSector('')
    setSelectedIndustry('')
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
  }

  const formatNumber = (value: number) => {
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
    return value.toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-muted border-t-primary mx-auto mb-6"></div>
          <p className="text-foreground text-xl">Loading companies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Hero Header */}
        <div className="mb-8 text-center">
          <div className="glass-card p-8 bg-card border border-border rounded-2xl mb-8">
            <h1 className="text-5xl font-bold text-foreground mb-4 gradient-animated bg-clip-text text-transparent">
              Company Directory
            </h1>
            <p className="text-xl text-foreground max-w-3xl mx-auto mb-6">
              Explore {companies.length} companies and discover their comprehensive waste management profiles, sustainability initiatives, and environmental impact data
            </p>
            <div className="flex items-center justify-center space-x-6">
              <div className="glass p-4 rounded-xl bg-card/50 border border-border hover-lift transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-6 w-6 text-foreground" />
                  <div className="text-left">
                    <p className="text-2xl font-bold text-foreground">{companies.length}</p>
                    <p className="text-muted-foreground text-sm">Total Companies</p>
                  </div>
                </div>
              </div>
              <div className="glass p-4 rounded-xl bg-card/50 border border-border hover-lift transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-6 w-6 text-foreground" />
                  <div className="text-left">
                    <p className="text-2xl font-bold text-foreground">{countries.length}</p>
                    <p className="text-muted-foreground text-sm">Countries</p>
                  </div>
                </div>
              </div>
              <div className="glass p-4 rounded-xl bg-card/50 border border-border hover-lift transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <Filter className="h-6 w-6 text-foreground" />
                  <div className="text-left">
                    <p className="text-2xl font-bold text-foreground">{sectors.length}</p>
                    <p className="text-muted-foreground text-sm">Sectors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="glass-card p-6 bg-card border border-border rounded-2xl mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search companies by name or ticker..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-border transition-all duration-300"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`glass hover-lift px-6 py-3 rounded-xl border transition-all duration-300 flex items-center space-x-2 ${
                showFilters 
                ? 'bg-secondary border-border text-foreground' 
                : 'bg-card border-border text-foreground hover:bg-secondary/50'
              }`}
            >
              <Filter className="h-5 w-5" />
              <span>Advanced Filters</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="glass-card p-6 bg-card border border-border rounded-2xl mb-6">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Filter className="h-5 w-5 text-white" />
              </div>
              Advanced Filters
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Country Filter */}
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:ring-2 focus:ring-ring focus:border-border transition-all duration-300"
                >
                  <option value="" className="bg-background text-foreground">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country} className="bg-background text-foreground">{country}</option>
                  ))}
                </select>
              </div>

              {/* Sector Filter */}
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Sector</label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:ring-2 focus:ring-ring focus:border-border transition-all duration-300"
                >
                  <option value="" className="bg-background text-foreground">All Sectors</option>
                  {sectors.map(sector => (
                    <option key={sector} value={sector} className="bg-background text-foreground">{sector}</option>
                  ))}
                </select>
              </div>

              {/* Industry Filter */}
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Industry</label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:ring-2 focus:ring-ring focus:border-border transition-all duration-300"
                >
                  <option value="" className="bg-background text-foreground">All Industries</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry} className="bg-background text-foreground">{industry}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-3 bg-gradient-accent hover:bg-gradient-secondary text-white rounded-xl hover-lift transition-all duration-300 font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="glass-card p-4 bg-card border border-border rounded-2xl mb-6">
          <div className="flex items-center justify-between">
            <p className="text-foreground">
              Showing <span className="font-bold text-foreground">{filteredAndSortedCompanies.length}</span> of <span className="font-bold text-foreground">{companies.length}</span> companies
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Click cards to view details</span>
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="glass-card p-4 bg-card border border-border rounded-2xl mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-foreground font-medium">Sort by:</span>
            {[
              { field: 'name', label: 'Company Name' },
              { field: 'country', label: 'Country' },
              { field: 'sector', label: 'Sector' },
              { field: 'employees', label: 'Employees' },
              { field: 'year_of_disclosure', label: 'Disclosure Year' }
            ].map(({ field, label }) => (
              <button
                key={field}
                onClick={() => handleSort(field as SortField)}
                className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-300 hover-lift ${
                  sortField === field
                    ? 'bg-secondary border border-border text-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                <span className="text-sm font-medium">{label}</span>
                {getSortIcon(field as SortField)}
              </button>
            ))}
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredAndSortedCompanies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.id}`}
              className="glass-card p-6 bg-card border border-border rounded-2xl hover-lift transition-all duration-300 group cursor-pointer"
            >
              {/* Company Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-primary rounded-xl group-hover:shadow-lg transition-all duration-300">
                    <Building2 className="h-6 w-6 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-lg group-hover:text-foreground/90 transition-colors leading-tight overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                      {company.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-1 bg-secondary/50 rounded-lg text-xs font-mono text-foreground">
                        {company.ticker}
                      </span>
                      <span className="text-xs text-muted-foreground">{company.exchange}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Details */}
              <div className="space-y-3">
                {/* Location */}
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{company.country}</p>
                    <p className="text-xs text-muted-foreground">Location</p>
                  </div>
                </div>

                {/* Sector & Industry */}
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground overflow-hidden whitespace-nowrap text-ellipsis">{company.sector}</p>
                    <p className="text-xs text-muted-foreground overflow-hidden whitespace-nowrap text-ellipsis">{company.industry}</p>
                  </div>
                </div>

                {/* Employees */}
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{formatNumber(company.employees)}</p>
                    <p className="text-xs text-muted-foreground">Employees</p>
                  </div>
                </div>

                {/* Disclosure Year */}
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{company.year_of_disclosure}</p>
                    <p className="text-xs text-muted-foreground">Disclosure Year</p>
                  </div>
                </div>
              </div>

              {/* View Details Arrow */}
              <div className="flex items-center justify-end mt-6 pt-4 border-t border-border">
                <div className="flex items-center space-x-2 text-muted-foreground group-hover:text-foreground transition-colors">
                  <span className="text-sm font-medium">View Details</span>
                  <TrendingUp className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredAndSortedCompanies.length === 0 && !loading && (
          <div className="glass-card p-12 bg-card border border-border rounded-2xl text-center">
            <div className="max-w-md mx-auto">
              <div className="p-6 bg-gradient-secondary rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center hover-lift">
                <Search className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">No companies found</h3>
              <p className="text-muted-foreground mb-6 text-lg">Try adjusting your search terms or filters to find what you&apos;re looking for.</p>
              <button
                onClick={clearFilters}
                className="px-8 py-4 bg-gradient-accent hover:bg-gradient-secondary text-white rounded-xl hover-lift transition-all duration-300 font-semibold text-lg"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
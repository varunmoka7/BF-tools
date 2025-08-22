'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatNumber } from '@/lib/utils'
import { useCompanies, type Company } from '@/contexts/companies-context'
import { 
  Building2, 
  MapPin, 
  Plus,
  Filter,
  Download,
  Eye,
  Users,
  Globe,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

interface CompanyFilters {
  search: string;
  country: string;
  sector: string;
  industry: string;
  employeeRange: string;
  yearRange: string;
}

// Memoized company row component to prevent unnecessary re-renders
const CompanyRow = React.memo(({ company }: { company: Company }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {company.name}
          </div>
          <div className="text-sm text-gray-500">
            {company.ticker} • {company.exchange}
          </div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
        <span className="text-sm text-gray-900">{company.country}</span>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <Badge variant="secondary">
        {company.sector}
      </Badge>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {company.industry}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {formatNumber(company.employees)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {company.year_of_disclosure}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <Link 
        href={`/company/${company.id}`}
        className="text-blue-600 hover:text-blue-900 flex items-center"
      >
        <Eye className="h-4 w-4 mr-1" />
        View
      </Link>
    </td>
  </tr>
))

CompanyRow.displayName = 'CompanyRow'

export default function CompaniesPage() {
  const { companies, loading, error } = useCompanies()
  const [filters, setFilters] = useState<CompanyFilters>({
    search: '',
    country: '',
    sector: '',
    industry: '',
    employeeRange: '',
    yearRange: ''
  })

  // Memoize filtered companies to prevent unnecessary recalculations
  const filteredCompanies = useMemo(() => {
    let filtered = companies

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchLower) ||
        company.country.toLowerCase().includes(searchLower) ||
        company.sector.toLowerCase().includes(searchLower) ||
        company.industry.toLowerCase().includes(searchLower)
      )
    }

    if (filters.country) {
      filtered = filtered.filter(company => company.country === filters.country)
    }

    if (filters.sector) {
      filtered = filtered.filter(company => company.sector === filters.sector)
    }

    if (filters.industry) {
      filtered = filtered.filter(company => company.industry === filters.industry)
    }

    if (filters.employeeRange) {
      filtered = filtered.filter(company => {
        const employees = company.employees
        switch (filters.employeeRange) {
          case 'small': return employees < 1000
          case 'medium': return employees >= 1000 && employees < 10000
          case 'large': return employees >= 10000 && employees < 50000
          case 'enterprise': return employees >= 50000
          default: return true
        }
      })
    }

    if (filters.yearRange) {
      filtered = filtered.filter(company => {
        const year = company.year_of_disclosure
        switch (filters.yearRange) {
          case '2024': return year === 2024
          case '2023': return year === 2023
          case '2022': return year === 2022
          case 'older': return year < 2022
          default: return true
        }
      })
    }

    return filtered
  }, [companies, filters])

  // Memoize unique values for filters
  const { uniqueCountries, uniqueSectors, uniqueIndustries } = useMemo(() => {
    return {
      uniqueCountries: [...new Set(companies.map(c => c.country))].sort(),
      uniqueSectors: [...new Set(companies.map(c => c.sector))].sort(),
      uniqueIndustries: [...new Set(companies.map(c => c.industry))].sort()
    }
  }, [companies])

  const clearFilters = React.useCallback(() => {
    setFilters({
      search: '',
      country: '',
      sector: '',
      industry: '',
      employeeRange: '',
      yearRange: ''
    })
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Companies</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Directory</h1>
            <p className="text-gray-600">
              Explore {companies.length} companies across {uniqueCountries.length} countries and {uniqueSectors.length} sectors
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold">{filteredCompanies.length}</div>
                <p className="text-xs text-muted-foreground">Total Companies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold">{uniqueCountries.length}</div>
                <p className="text-xs text-muted-foreground">Countries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold">{uniqueSectors.length}</div>
                <p className="text-xs text-muted-foreground">Sectors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold">
                  {formatNumber(filteredCompanies.reduce((sum, c) => sum + c.employees, 0))}
                </div>
                <p className="text-xs text-muted-foreground">Total Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Input
              placeholder="Search companies..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
            
            <Select value={filters.country} onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Countries</SelectItem>
                {uniqueCountries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filters.sector} onValueChange={(value) => setFilters(prev => ({ ...prev, sector: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sectors</SelectItem>
                {uniqueSectors.map(sector => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filters.industry} onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Industries</SelectItem>
                {uniqueIndustries.map(industry => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filters.employeeRange} onValueChange={(value) => setFilters(prev => ({ ...prev, employeeRange: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Employee Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sizes</SelectItem>
                <SelectItem value="small">Small (&lt; 1K)</SelectItem>
                <SelectItem value="medium">Medium (1K - 10K)</SelectItem>
                <SelectItem value="large">Large (10K - 50K)</SelectItem>
                <SelectItem value="enterprise">Enterprise (50K+)</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Companies ({filteredCompanies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCompanies.map((company) => (
                  <CompanyRow key={company.id} company={company} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
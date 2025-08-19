'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WasteCompany } from '@/types/waste'
import { formatNumber, formatCurrency, getComplianceColor } from '@/lib/utils'
import { 
  Building2, 
  MapPin, 
  Recycle, 
  TrendingUp, 
  Search, 
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react'

interface CompanyFilters {
  search: string
  country: string
  wasteType: string
  complianceLevel: string
  volumeRange: string
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<WasteCompany[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<WasteCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CompanyFilters>({
    search: '',
    country: '',
    wasteType: '',
    complianceLevel: '',
    volumeRange: ''
  })

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await fetch('/api/companies')
        if (!response.ok) {
          throw new Error('Failed to fetch company data')
        }
        const result = await response.json()
        const data: WasteCompany[] = result.data || result
        setCompanies(data)
        setFilteredCompanies(data)
      } catch (err: any) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchCompanies()
  }, [])

  useEffect(() => {
    let filtered = companies

    if (filters.search) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        company.country.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.country) {
      filtered = filtered.filter(company => company.country === filters.country)
    }

    if (filters.wasteType) {
      filtered = filtered.filter(company => company.wasteType === filters.wasteType)
    }

    if (filters.complianceLevel) {
      filtered = filtered.filter(company => {
        const score = company.complianceScore
        switch (filters.complianceLevel) {
          case 'high': return score >= 90
          case 'medium': return score >= 70 && score < 90
          case 'low': return score < 70
          default: return true
        }
      })
    }

    if (filters.volumeRange) {
      filtered = filtered.filter(company => {
        const volume = company.annualVolume
        switch (filters.volumeRange) {
          case 'small': return volume < 1000
          case 'medium': return volume >= 1000 && volume < 10000
          case 'large': return volume >= 10000
          default: return true
        }
      })
    }

    setFilteredCompanies(filtered)
  }, [companies, filters])

  const getComplianceIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (score >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  const getComplianceLevel = (score: number) => {
    if (score >= 90) return { level: 'High', color: 'bg-green-100 text-green-800' }
    if (score >= 70) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' }
    return { level: 'Low', color: 'bg-red-100 text-red-800' }
  }

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

  const uniqueCountries = [...new Set(companies.map(c => c.country))].sort()
  const uniqueWasteTypes = [...new Set(companies.map(c => c.wasteType))].sort()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
            <p className="text-gray-600">
              Manage waste management companies and track their performance
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.filter(c => c.complianceScore >= 90).length}
            </div>
            <p className="text-xs text-muted-foreground">Score 90+</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(companies.reduce((sum, c) => sum + (c.revenue || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Recycling Rate</CardTitle>
            <Recycle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(companies.reduce((sum, c) => sum + c.recyclingRate, 0) / companies.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">+2.3% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
              >
                <option value="">All Countries</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waste Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={filters.wasteType}
                onChange={(e) => setFilters({ ...filters, wasteType: e.target.value })}
              >
                <option value="">All Types</option>
                {uniqueWasteTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Compliance</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={filters.complianceLevel}
                onChange={(e) => setFilters({ ...filters, complianceLevel: e.target.value })}
              >
                <option value="">All Levels</option>
                <option value="high">High (90+)</option>
                <option value="medium">Medium (70-89)</option>
                <option value="low">Low (&lt;70)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Volume</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={filters.volumeRange}
                onChange={(e) => setFilters({ ...filters, volumeRange: e.target.value })}
              >
                <option value="">All Volumes</option>
                <option value="small">Small (&lt;1K tons)</option>
                <option value="medium">Medium (1K-10K tons)</option>
                <option value="large">Large (10K+ tons)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies List */}
      <Card>
        <CardHeader>
          <CardTitle>Companies ({filteredCompanies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCompanies.map((company) => {
              const compliance = getComplianceLevel(company.complianceScore)
              
              return (
                <div
                  key={company.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {company.name}
                        </h3>
                        <Badge className={compliance.color}>
                          {compliance.level} Compliance
                        </Badge>
                        <Badge variant="outline">
                          {company.wasteType}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{company.country}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Recycle className="h-4 w-4" />
                          <span>{formatNumber(company.annualVolume)} tons/year</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>{company.recyclingRate}% recycling rate</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {getComplianceIcon(company.complianceScore)}
                          <span>{company.complianceScore}/100 compliance</span>
                        </div>
                      </div>
                      
                      {company.revenue && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-600">
                            Annual Revenue: <span className="font-medium">{formatCurrency(company.revenue)}</span>
                          </span>
                        </div>
                      )}
                      
                      {company.certifications.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {company.certifications.slice(0, 3).map((cert, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                          {company.certifications.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{company.certifications.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {filteredCompanies.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No companies found matching your filters</p>
                <Button variant="outline" className="mt-4" onClick={() => setFilters({
                  search: '',
                  country: '',
                  wasteType: '',
                  complianceLevel: '',
                  volumeRange: ''
                })}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
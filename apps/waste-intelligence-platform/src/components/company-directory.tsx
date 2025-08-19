'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getAllCompanies } from '@/services/companies'
import { Company } from '@/types/waste'
import { Search, ArrowUpDown, ExternalLink, Building2, MapPin, Factory } from 'lucide-react'
import Link from 'next/link'

type SortField = 'company_name' | 'country' | 'sector' | 'total_waste_latest' | 'recovery_rate_latest'
type SortOrder = 'asc' | 'desc'

export function CompanyDirectory() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('company_name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  useEffect(() => {
    async function loadCompanies() {
      try {
        setLoading(true)
        const data = await getAllCompanies()
        setCompanies(data)
        setError(null)
      } catch (err) {
        console.error('Failed to load companies:', err)
        setError(err instanceof Error ? err.message : 'Failed to load companies')
      } finally {
        setLoading(false)
      }
    }

    loadCompanies()
  }, [])

  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = companies

    // Apply search filter
    if (searchTerm) {
      filtered = companies.filter(company =>
        company.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return sortOrder === 'asc' ? 1 : -1
      if (bValue == null) return sortOrder === 'asc' ? -1 : 1

      // Convert to string for text comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [companies, searchTerm, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Building2 className="h-5 w-5" />
            Error Loading Companies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Directory
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          {filteredAndSortedCompanies.length} of {companies.length} companies
        </p>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-7 gap-4 mb-4 pb-2 border-b font-medium text-sm text-gray-600">
          <Button
            variant="ghost"
            className="justify-start p-0 h-auto font-medium hover:text-gray-900"
            onClick={() => handleSort('company_name')}
          >
            Company Name
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            className="justify-start p-0 h-auto font-medium hover:text-gray-900"
            onClick={() => handleSort('country')}
          >
            Country
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            className="justify-start p-0 h-auto font-medium hover:text-gray-900"
            onClick={() => handleSort('sector')}
          >
            Sector
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
          <div>Industry</div>
          <div>Latest Year</div>
          <Button
            variant="ghost"
            className="justify-start p-0 h-auto font-medium hover:text-gray-900"
            onClick={() => handleSort('total_waste_latest')}
          >
            Total Waste
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            className="justify-start p-0 h-auto font-medium hover:text-gray-900"
            onClick={() => handleSort('recovery_rate_latest')}
          >
            Recovery Rate
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </div>

        {/* Table Body */}
        <div className="space-y-2">
          {filteredAndSortedCompanies.map((company) => (
            <Link
              key={company.company_id}
              href={`/company/${company.company_id}`}
              className="block"
            >
              <div className="grid grid-cols-7 gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-2">
                  <Building2 className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{company.company_name}</span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600 truncate">{company.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Factory className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <Badge variant="secondary" className="text-xs truncate">
                    {company.sector}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {company.industry}
                </div>
                <div className="text-sm text-gray-600">
                  {company.latest_year || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">
                  {company.total_waste_latest 
                    ? `${company.total_waste_latest.toLocaleString()} tonnes`
                    : 'N/A'
                  }
                </div>
                <div className="text-sm text-gray-600">
                  {company.recovery_rate_latest 
                    ? `${company.recovery_rate_latest.toFixed(1)}%`
                    : 'N/A'
                  }
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredAndSortedCompanies.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No companies found matching &quot;{searchTerm}&quot;</p>
            <p className="text-sm">Try adjusting your search terms</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
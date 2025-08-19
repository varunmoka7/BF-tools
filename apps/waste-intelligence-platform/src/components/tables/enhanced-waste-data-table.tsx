'use client'

import { useEffect, useState, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { formatNumber, formatPercentage, getComplianceColor } from '@/lib/utils'
import { Building2, MapPin, Recycle, CheckCircle } from 'lucide-react'
import { WasteCompany, FilterOptions } from '@/types/waste'
import { SearchInput } from '@/components/search/search-input'
import { AdvancedFilters } from '@/components/filters/advanced-filters'
import { CSVUpload } from '@/components/upload/csv-upload'
import { Pagination } from '@/components/pagination/pagination'
import { TableSkeleton } from '@/components/skeletons/table-skeleton'
import { NoDataEmptyState, NoSearchResultsEmptyState, NoFilterResultsEmptyState } from '@/components/empty-states/empty-state'
import { useToast } from '@/hooks/use-toast'

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface ApiResponse {
  data: WasteCompany[]
  pagination: PaginationInfo
}

export function EnhancedWasteDataTable() {
  const [data, setData] = useState<WasteCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({})
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      
      if (searchQuery) params.append('search', searchQuery)
      if (filters.country && filters.country.length > 0) {
        params.append('country', filters.country[0]) // For simplicity, using first country
      }
      if (filters.wasteType && filters.wasteType.length > 0) {
        params.append('wasteType', filters.wasteType[0]) // For simplicity, using first waste type
      }
      
      const response = await fetch(`/api/companies-db?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const jsonData: ApiResponse = await response.json()
      
      // Check if response has the new pagination structure
      if (jsonData.data && jsonData.pagination) {
        setData(jsonData.data)
        setPagination(jsonData.pagination)
      } else {
        // Fallback for old API structure
        const fallbackData = Array.isArray(jsonData) ? jsonData : []
        setData(fallbackData)
        setPagination({
          page: 1,
          limit: fallbackData.length,
          total: fallbackData.length,
          totalPages: 1
        })
      }
    } catch (err: any) {
      setError(err.message)
      toast({
        title: 'Error loading data',
        description: 'Failed to load waste management data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, searchQuery, filters, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }, [])

  const handlePageSizeChange = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }))
  }, [])

  const handleUploadSuccess = useCallback((uploadedData: WasteCompany[]) => {
    toast({
      title: 'Upload successful',
      description: `Successfully uploaded data for ${uploadedData.length} companies.`,
      variant: 'success',
    })
    fetchData() // Refresh data
  }, [fetchData, toast])

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({})
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  const hasActiveFilters = Object.values(filters).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : filter !== undefined
  )

  const getEmptyState = () => {
    if (pagination.total === 0) {
      if (searchQuery) {
        return <NoSearchResultsEmptyState onClearSearch={handleClearSearch} />
      }
      if (hasActiveFilters) {
        return <NoFilterResultsEmptyState onClearFilters={handleClearFilters} />
      }
      return <NoDataEmptyState />
    }
    return null
  }

  if (error && !data.length) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button 
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <SearchInput 
            onSearch={handleSearch}
            placeholder="Search companies, countries, or regions..."
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <AdvancedFilters onFiltersChange={handleFiltersChange} />
          <CSVUpload onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>

      {/* Loading State */}
      {loading && <TableSkeleton />}

      {/* Empty State */}
      {!loading && getEmptyState()}

      {/* Data Table */}
      {!loading && data.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waste Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Annual Volume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recycling Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compliance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certifications
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {company.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {company.employees ? `${company.employees} employees` : 'Employee count N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div>{company.country}</div>
                          <div className="text-gray-500">{company.region}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary" className="text-sm">
                        {company.wasteType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Recycle className="h-4 w-4 text-green-500 mr-2" />
                        {formatNumber(company.annualVolume)} tons
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${company.recyclingRate}%` }}
                          ></div>
                        </div>
                        {formatPercentage(company.recyclingRate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <CheckCircle className={`h-4 w-4 mr-2 ${getComplianceColor(company.complianceScore)}`} />
                        <span className={getComplianceColor(company.complianceScore)}>
                          {company.complianceScore}/100
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {company.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.limit}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  )
}
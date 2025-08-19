'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapMarkerData, WasteCompany, FilterOptions } from '@/types/waste'
import { formatNumber } from '@/lib/utils'
import { 
  Globe, 
  Filter, 
  MapPin, 
  Recycle, 
  Building2,
  Search
} from 'lucide-react'

const DynamicMap = dynamic(
  () => import('@/components/maps/leaflet-map'),
  { ssr: false, loading: () => <MapLoadingSkeleton /> }
)

function MapLoadingSkeleton() {
  return (
    <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading global waste map...</p>
        <p className="text-sm text-gray-500">Fetching company locations worldwide</p>
      </div>
    </div>
  )
}

interface MapStats {
  totalCompanies: number
  totalVolume: number
  averageRecycling: number
  countries: number
}

export default function MapPage() {
  const [mapData, setMapData] = useState<MapMarkerData[]>([])
  const [companies, setCompanies] = useState<WasteCompany[]>([])
  const [stats, setStats] = useState<MapStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({})

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/companies-db')
        if (!response.ok) {
          throw new Error('Failed to fetch map data')
        }
        const result = await response.json()
        const data: WasteCompany[] = result.data || []
        
        setCompanies(data)
        
        const markers = data.map(company => ({
          id: company.id,
          position: [company.coordinates?.lat || 0, company.coordinates?.lng || 0] as [number, number],
          companyName: company.name,
          wasteVolume: company.annualVolume,
          wasteType: company.wasteType,
          popupContent: `
            <div class="p-3">
              <h3 class="font-bold text-lg text-green-800">${company.name}</h3>
              <p class="text-sm text-gray-600 mb-2">${company.country}</p>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span class="font-medium">Waste Type:</span>
                  <span class="text-green-700">${company.wasteType}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Volume:</span>
                  <span class="text-blue-700">${company.annualVolume.toLocaleString()} tons</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Recycling:</span>
                  <span class="text-green-700">${company.recyclingRate}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Compliance:</span>
                  <span class="text-orange-700">${company.complianceScore}/100</span>
                </div>
              </div>
            </div>
          `
        }))
        
        setMapData(markers)
        
        // Calculate stats
        const uniqueCountries = new Set(data.map(c => c.country)).size
        const totalVolume = data.reduce((sum, c) => sum + c.annualVolume, 0)
        const avgRecycling = data.reduce((sum, c) => sum + c.recyclingRate, 0) / data.length
        
        setStats({
          totalCompanies: data.length,
          totalVolume,
          averageRecycling: avgRecycling,
          countries: uniqueCountries
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const wasteTypes = [...new Set(companies.map(c => c.wasteType))]
  const countries = [...new Set(companies.map(c => c.country))].sort()

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Map</h2>
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
          <Globe className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Global Waste Map</h1>
            <p className="text-gray-600">Interactive map of waste management companies worldwide</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-500">Filters available</span>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalCompanies)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Countries</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.countries}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <Recycle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalVolume)} tons</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Recycling</CardTitle>
              <Recycle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRecycling.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Map Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waste Types
              </label>
              <div className="flex flex-wrap gap-2">
                {wasteTypes.slice(0, 6).map(type => (
                  <Badge key={type} variant="outline" className="cursor-pointer hover:bg-green-50">
                    {type}
                  </Badge>
                ))}
                {wasteTypes.length > 6 && (
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
                    +{wasteTypes.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Countries
              </label>
              <div className="flex flex-wrap gap-2">
                {countries.slice(0, 5).map(country => (
                  <Badge key={country} variant="outline" className="cursor-pointer hover:bg-blue-50">
                    {country}
                  </Badge>
                ))}
                {countries.length > 5 && (
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
                    +{countries.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volume Range
              </label>
              <div className="space-y-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-orange-50">
                  0-1K tons
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-orange-50">
                  1K-10K tons
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-orange-50">
                  10K+ tons
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Interactive Global Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] relative">
            {loading ? (
              <MapLoadingSkeleton />
            ) : (
              <DynamicMap markers={mapData} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Map Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">Marker Colors</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>High recycling rate (80%+)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Medium recycling rate (50-79%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Low recycling rate (&lt;50%)</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Marker Sizes</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span>Large volume (10K+ tons)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Medium volume (1K-10K tons)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Small volume (&lt;1K tons)</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Interaction</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• Click markers for detailed info</p>
                <p>• Zoom and pan to explore</p>
                <p>• Use filters to refine view</p>
                <p>• Hover for quick preview</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
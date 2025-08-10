'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { mockWasteCompanies } from '@/data/mock-data'
import { MapMarkerData } from '@/types/waste'

// Dynamic import for Leaflet to avoid SSR issues
const DynamicMap = dynamic(
  () => import('./leaflet-map'),
  { ssr: false, loading: () => <MapPlaceholder /> }
)

function MapPlaceholder() {
  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading global waste map...</p>
      </div>
    </div>
  )
}

export function GlobalWasteMap() {
  const [mapData, setMapData] = useState<MapMarkerData[]>([])

  useEffect(() => {
    // Transform company data to map markers
    const markers = mockWasteCompanies.map(company => ({
      id: company.id,
      position: [company.coordinates?.lat || 0, company.coordinates?.lng || 0] as [number, number],
      companyName: company.name,
      wasteVolume: company.annualVolume,
      wasteType: company.wasteType,
      popupContent: `
        <div class="p-2">
          <h3 class="font-semibold text-lg">${company.name}</h3>
          <p class="text-sm text-gray-600">${company.country}</p>
          <div class="mt-2 space-y-1">
            <p><span class="font-medium">Waste Type:</span> ${company.wasteType}</p>
            <p><span class="font-medium">Annual Volume:</span> ${company.annualVolume.toLocaleString()} tons</p>
            <p><span class="font-medium">Recycling Rate:</span> ${company.recyclingRate}%</p>
            <p><span class="font-medium">Compliance Score:</span> ${company.complianceScore}/100</p>
          </div>
        </div>
      `
    }))

    setMapData(markers)
  }, [])

  return (
    <div className="w-full h-96">
      <DynamicMap markers={mapData} />
    </div>
  )
}
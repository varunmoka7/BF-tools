'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { MapMarkerData } from '@/types/waste'

interface LeafletMapProps {
  markers: MapMarkerData[]
}

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjUgMEMxOS40MDM2IDAgMjUgNS41OTY0NCAyNSAxMi41QzI1IDE5LjQwMzYgMTkuNDAzNiAyNSAxMi41IDI1QzUuNTk2NDQgMjUgMCAxOS40MDM2IDAgMTIuNUMwIDUuNTk2NDQgNS41OTY0NCAwIDEyLjUgMFoiIGZpbGw9IiNFRjQ0NDQiLz4KPHBhdGggZD0iTTEyLjUgNDFMMjQuNzQyNyAxNUgwLjI1NzI1NEwxMi41IDQxWiIgZmlsbD0iI0VGNDQ0NCIvPgo8L3N2Zz4K',
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjUgMEMxOS40MDM2IDAgMjUgNS41OTY0NCAyNSAxMi41QzI1IDE5LjQwMzYgMTkuNDAzNiAyNSAxMi41IDI1QzUuNTk2NDQgMjUgMCAxOS40MDM2IDAgMTIuNUMwIDUuNTk2NDQgNS41OTY0NCAwIDEyLjUgMFoiIGZpbGw9IiMxNkE5NEEiLz4KPHBhdGggZD0iTTEyLjUgNDFMMjQuNzQyNyAxNUgwLjI1NzI1NEwxMi41IDQxWiIgZmlsbD0iIzE2QTk0QSIvPgo8L3N2Zz4K',
  shadowUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDEiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCA0MSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGVsbGlwc2UgY3g9IjIwLjUiIGN5PSIyMC41IiByeD0iMjAuNSIgcnk9IjIwLjUiIGZpbGw9ImJsYWNrIiBmaWxsLW9wYWNpdHk9IjAuMyIvPgo8L3N2Zz4K',
})

export default function LeafletMap({ markers }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView([20, 0], 2)
    mapInstanceRef.current = map

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || !markers.length) return

    // Clear existing markers
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstanceRef.current?.removeLayer(layer)
      }
    })

    // Add new markers
    markers.forEach((marker) => {
      if (marker.position[0] === 0 && marker.position[1] === 0) return

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="bg-green-600 rounded-full w-4 h-4 border-2 border-white shadow-lg">
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })

      const leafletMarker = L.marker(marker.position, { icon })
        .addTo(mapInstanceRef.current!)

      if (marker.popupContent) {
        leafletMarker.bindPopup(marker.popupContent, {
          maxWidth: 300,
          className: 'custom-popup'
        })
      }
    })
  }, [markers])

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg border"
      style={{ minHeight: '400px' }}
    />
  )
}
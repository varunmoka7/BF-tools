import React, { useState, useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WasteData, WasteType } from '@/types/waste'
import { formatNumber, formatPercentage, getWasteColorIntensity } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import 'leaflet/dist/leaflet.css'

interface GlobalWasteFootprintMapProps {
  data: WasteData[]
  className?: string
}

interface MapControlsProps {
  selectedYear: number
  onYearChange: (year: number) => void
  selectedWasteType: WasteType
  onWasteTypeChange: (type: WasteType) => void
  availableYears: number[]
}

const MapControls: React.FC<MapControlsProps> = ({
  selectedYear,
  onYearChange,
  selectedWasteType,
  onWasteTypeChange,
  availableYears
}) => {
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 space-y-4 min-w-[280px]">
      <div>
        <label className="text-sm font-medium mb-2 block">Year: {selectedYear}</label>
        <Slider
          value={[selectedYear]}
          onValueChange={(value) => onYearChange(value[0])}
          min={Math.min(...availableYears)}
          max={Math.max(...availableYears)}
          step={1}
          className="w-full"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Waste Type</label>
        <Select value={selectedWasteType} onValueChange={(value: WasteType) => onWasteTypeChange(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="total">Total Waste</SelectItem>
            <SelectItem value="hazardous">Hazardous Waste</SelectItem>
            <SelectItem value="municipal">Municipal Waste</SelectItem>
            <SelectItem value="industrial">Industrial Waste</SelectItem>
            <SelectItem value="construction">Construction Waste</SelectItem>
            <SelectItem value="electronic">Electronic Waste</SelectItem>
            <SelectItem value="medical">Medical Waste</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs text-gray-600">
        <div className="font-medium mb-1">Recovery Rate Scale:</div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>&lt;20%</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>20-40%</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>40-60%</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-lime-500"></div>
          <span>60-80%</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>&gt;80%</span>
        </div>
      </div>
    </div>
  )
}

const WastePopup: React.FC<{ data: WasteData; wasteType: WasteType }> = ({ data, wasteType }) => {
  const getWasteValue = (data: WasteData, type: WasteType): number => {
    switch (type) {
      case 'total':
        return data.totalWaste
      case 'hazardous':
        return data.hazardousWaste
      case 'municipal':
        return data.wasteTypes.municipal
      case 'industrial':
        return data.wasteTypes.industrial
      case 'construction':
        return data.wasteTypes.construction
      case 'electronic':
        return data.wasteTypes.electronic
      case 'medical':
        return data.wasteTypes.medical
      default:
        return data.totalWaste
    }
  }

  const wasteValue = getWasteValue(data, wasteType)
  const wasteShare = wasteType !== 'total' ? (wasteValue / data.totalWaste) * 100 : 100

  return (
    <div className="p-2 min-w-[280px]">
      <div className="font-semibold text-lg mb-2">{data.country}</div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Waste Volume:</span>
          <span className="font-medium">{formatNumber(wasteValue, { compact: true, unit: ' tons' })}</span>
        </div>
        
        {wasteType !== 'total' && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Share of Total:</span>
            <span className="font-medium">{formatPercentage(wasteShare)}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Recovery Rate:</span>
          <Badge variant={data.recoveryRate >= 70 ? 'success' : data.recoveryRate >= 50 ? 'warning' : 'danger'}>
            {formatPercentage(data.recoveryRate)}
          </Badge>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Market Opportunity:</span>
          <span className="font-medium">${formatNumber(data.marketOpportunity, { compact: true, unit: 'M' })}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t">
        <div className="text-sm font-medium mb-2">Treatment Methods:</div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div>Recycling: {formatPercentage(data.treatmentMethods.recycling)}</div>
          <div>Composting: {formatPercentage(data.treatmentMethods.composting)}</div>
          <div>Energy Recovery: {formatPercentage(data.treatmentMethods.energyRecovery)}</div>
          <div>Landfill: {formatPercentage(data.treatmentMethods.landfill)}</div>
          <div>Incineration: {formatPercentage(data.treatmentMethods.incineration)}</div>
        </div>
      </div>
    </div>
  )
}

export const GlobalWasteFootprintMap: React.FC<GlobalWasteFootprintMapProps> = ({ data, className }) => {
  const [selectedYear, setSelectedYear] = useState(2024)
  const [selectedWasteType, setSelectedWasteType] = useState<WasteType>('total')

  const availableYears = useMemo(() => {
    return [...new Set(data.map(item => item.year))].sort()
  }, [data])

  const filteredData = useMemo(() => {
    return data.filter(item => item.year === selectedYear)
  }, [data, selectedYear])

  const getMarkerRadius = (wasteData: WasteData, wasteType: WasteType): number => {
    const getWasteValue = (data: WasteData, type: WasteType): number => {
      switch (type) {
        case 'total':
          return data.totalWaste
        case 'hazardous':
          return data.hazardousWaste
        case 'municipal':
          return data.wasteTypes.municipal
        case 'industrial':
          return data.wasteTypes.industrial
        case 'construction':
          return data.wasteTypes.construction
        case 'electronic':
          return data.wasteTypes.electronic
        case 'medical':
          return data.wasteTypes.medical
        default:
          return data.totalWaste
      }
    }

    const wasteValue = getWasteValue(wasteData, wasteType)
    const maxWaste = Math.max(...filteredData.map(d => getWasteValue(d, wasteType)))
    return Math.max(8, (wasteValue / maxWaste) * 40)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Global Waste Footprint Map</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[600px] w-full">
          <MapContainer
            center={[30, 0]}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
            className="rounded-b-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {filteredData.map((wasteData) => (
              <CircleMarker
                key={`${wasteData.id}-${selectedWasteType}`}
                center={wasteData.coordinates}
                radius={getMarkerRadius(wasteData, selectedWasteType)}
                fillColor={getWasteColorIntensity(wasteData.recoveryRate, 100)}
                color="white"
                weight={2}
                opacity={0.8}
                fillOpacity={0.7}
              >
                <Popup>
                  <WastePopup data={wasteData} wasteType={selectedWasteType} />
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          <MapControls
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            selectedWasteType={selectedWasteType}
            onWasteTypeChange={setSelectedWasteType}
            availableYears={availableYears}
          />
        </div>
      </CardContent>
    </Card>
  )
}
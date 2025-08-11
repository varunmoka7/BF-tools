'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Filter, X, RotateCcw } from 'lucide-react'
import { FilterOptions } from '@/types/waste'

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void
  className?: string
}

const COUNTRIES = [
  'USA', 'Germany', 'Japan', 'UK', 'France', 'Canada', 'Australia', 'Netherlands', 'Sweden', 'China'
]

const WASTE_TYPES = [
  'Municipal Solid Waste', 'Hazardous Waste', 'Industrial Waste', 'Electronic Waste', 
  'Organic Waste', 'Construction Waste', 'Medical Waste', 'Plastic Waste'
]

export function AdvancedFilters({ onFiltersChange, className }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    country: [],
    wasteType: [],
    volumeRange: [0, 1000000],
    recyclingRateRange: [0, 100],
    complianceRange: [0, 100]
  })

  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters)

  const handleCountryChange = (country: string) => {
    const updatedCountries = tempFilters.country?.includes(country)
      ? tempFilters.country.filter(c => c !== country)
      : [...(tempFilters.country || []), country]
    
    setTempFilters({ ...tempFilters, country: updatedCountries })
  }

  const handleWasteTypeChange = (wasteType: string) => {
    const updatedWasteTypes = tempFilters.wasteType?.includes(wasteType)
      ? tempFilters.wasteType.filter(w => w !== wasteType)
      : [...(tempFilters.wasteType || []), wasteType]
    
    setTempFilters({ ...tempFilters, wasteType: updatedWasteTypes })
  }

  const handleRangeChange = (key: keyof FilterOptions, index: number, value: string) => {
    const numValue = parseInt(value) || 0
    const currentRange = tempFilters[key] as [number, number]
    const newRange: [number, number] = [...currentRange]
    newRange[index] = numValue
    setTempFilters({ ...tempFilters, [key]: newRange })
  }

  const applyFilters = () => {
    setFilters(tempFilters)
    onFiltersChange(tempFilters)
    setIsOpen(false)
  }

  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
      country: [],
      wasteType: [],
      volumeRange: [0, 1000000],
      recyclingRateRange: [0, 100],
      complianceRange: [0, 100]
    }
    setTempFilters(defaultFilters)
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.country && filters.country.length > 0) count++
    if (filters.wasteType && filters.wasteType.length > 0) count++
    if (filters.volumeRange && (filters.volumeRange[0] > 0 || filters.volumeRange[1] < 1000000)) count++
    if (filters.recyclingRateRange && (filters.recyclingRateRange[0] > 0 || filters.recyclingRateRange[1] < 100)) count++
    if (filters.complianceRange && (filters.complianceRange[0] > 0 || filters.complianceRange[1] < 100)) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Countries Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Countries</label>
            <div className="grid grid-cols-2 gap-2">
              {COUNTRIES.map(country => (
                <label key={country} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempFilters.country?.includes(country) || false}
                    onChange={() => handleCountryChange(country)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{country}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Waste Types Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Waste Types</label>
            <div className="grid grid-cols-1 gap-2">
              {WASTE_TYPES.map(wasteType => (
                <label key={wasteType} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempFilters.wasteType?.includes(wasteType) || false}
                    onChange={() => handleWasteTypeChange(wasteType)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{wasteType}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Volume Range */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Annual Volume Range (tons)</label>
            <div className="flex items-center space-x-3">
              <Input
                type="number"
                placeholder="Min"
                value={tempFilters.volumeRange?.[0] || ''}
                onChange={(e) => handleRangeChange('volumeRange', 0, e.target.value)}
                className="w-24"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={tempFilters.volumeRange?.[1] || ''}
                onChange={(e) => handleRangeChange('volumeRange', 1, e.target.value)}
                className="w-24"
              />
            </div>
          </div>

          {/* Recycling Rate Range */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Recycling Rate Range (%)</label>
            <div className="flex items-center space-x-3">
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="Min"
                value={tempFilters.recyclingRateRange?.[0] || ''}
                onChange={(e) => handleRangeChange('recyclingRateRange', 0, e.target.value)}
                className="w-20"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="Max"
                value={tempFilters.recyclingRateRange?.[1] || ''}
                onChange={(e) => handleRangeChange('recyclingRateRange', 1, e.target.value)}
                className="w-20"
              />
            </div>
          </div>

          {/* Compliance Score Range */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Compliance Score Range</label>
            <div className="flex items-center space-x-3">
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="Min"
                value={tempFilters.complianceRange?.[0] || ''}
                onChange={(e) => handleRangeChange('complianceRange', 0, e.target.value)}
                className="w-20"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="Max"
                value={tempFilters.complianceRange?.[1] || ''}
                onChange={(e) => handleRangeChange('complianceRange', 1, e.target.value)}
                className="w-20"
              />
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-blue-700 hover:text-blue-900 p-1 h-8"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={resetFilters} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
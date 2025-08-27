'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, ZoomControl } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Company, CountryData, MapView } from '@/types/map';

// Color scheme for sectors
const SECTOR_COLORS: Record<string, string> = {
  'Industrials': '#FF6B35',
  'Healthcare': '#4ECDC4',
  'Technology': '#45B7D1',
  'Financial Services': '#96CEB4',
  'Consumer Cyclical': '#FFEAA7',
  'Basic Materials': '#DDA0DD',
  'Utilities': '#98D8C8',
  'Consumer Defensive': '#F7DC6F',
  'Real Estate': '#BB8FCE',
  'Communication Services': '#85C1E9',
  'Energy': '#F1948A',
  'Unknown': '#BDC3C7'
};

// Custom marker icons
const createCustomIcon = (sector: string, size: 'small' | 'medium' | 'large') => {
  const iconSize = size === 'small' ? 20 : size === 'medium' ? 30 : 40;
  const color = SECTOR_COLORS[sector] || SECTOR_COLORS['Unknown'];
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="white"/>
      </svg>
    `)}`,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2],
    popupAnchor: [0, -iconSize / 2]
  });
};

interface GlobalWasteMapProps {
  companies: Company[];
  onCompanySelect?: (company: Company) => void;
}

export default function GlobalWasteMap({ companies, onCompanySelect }: GlobalWasteMapProps) {
  const [mapView, setMapView] = useState<MapView>({ type: 'country', zoomLevel: 4 });
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hoveredCompany, setHoveredCompany] = useState<Company | null>(null);

  // Process data for map visualization
  const countryData = useMemo(() => {
    const countryMap = new Map<string, CountryData>();
    
    companies.forEach(company => {
      const country = company.country;
      if (!countryMap.has(country)) {
        countryMap.set(country, {
          name: country,
          companyCount: 0,
          totalEmployees: 0,
          averageWastePerCompany: 0,
          coordinates: [company.coordinates.lat, company.coordinates.lng]
        });
      }
      
      const data = countryMap.get(country)!;
      data.companyCount++;
      data.totalEmployees += company.employees;
    });
    
    return Array.from(countryMap.values());
  }, [companies]);

  // Filter companies by selected country
  const filteredCompanies = useMemo(() => {
    if (!selectedCountry) return [];
    return companies.filter(company => company.country === selectedCountry);
  }, [companies, selectedCountry]);

  // Handle country click
  const handleCountryClick = (countryName: string) => {
    setSelectedCountry(countryName);
    setMapView({ type: 'company', selectedCountry: countryName, zoomLevel: 6 });
  };

  // Handle company click
  const handleCompanyClick = (company: Company) => {
    onCompanySelect?.(company);
  };

  // Reset to country view
  const resetToCountryView = () => {
    setSelectedCountry(null);
    setMapView({ type: 'country', zoomLevel: 4 });
  };

  // Calculate marker size based on employee count
  const getMarkerSize = (employees: number): 'small' | 'medium' | 'large' => {
    if (employees < 10000) return 'small';
    if (employees < 50000) return 'medium';
    return 'large';
  };

  return (
    <div className="w-full h-full">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-gray-800">Map View</h3>
          
          {mapView.type === 'country' ? (
            <div className="text-sm text-gray-600">
              <p>Click on a country to see companies</p>
              <p className="mt-1">Total: {companies.length} companies</p>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              <p>Viewing companies in: <strong>{selectedCountry}</strong></p>
              <p className="mt-1">Companies: {filteredCompanies.length}</p>
              <button
                onClick={resetToCountryView}
                className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Back to Countries
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <MapContainer
        center={[48.8566, 2.3522]} // Center of Europe
        zoom={mapView.zoomLevel}
        className="w-full h-full"
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        
        {/* Base Map */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Country View */}
        {mapView.type === 'country' && (
          <>
            {/* Country markers with company counts */}
            {countryData.map((country) => (
              <Marker
                key={country.name}
                position={country.coordinates}
                icon={new Icon({
                  iconUrl: `data:image/svg+xml;base64,${btoa(`
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="white" stroke-width="2"/>
                      <text x="20" y="25" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${country.companyCount}</text>
                    </svg>
                  `)}`,
                  iconSize: [40, 40],
                  iconAnchor: [20, 20]
                })}
                eventHandlers={{
                  click: () => handleCountryClick(country.name)
                }}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-bold text-lg">{country.name}</h3>
                    <p className="text-gray-600">Companies: {country.companyCount}</p>
                    <p className="text-gray-600">Total Employees: {country.totalEmployees.toLocaleString()}</p>
                    <button
                      onClick={() => handleCountryClick(country.name)}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      View Companies
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}

        {/* Company View */}
        {mapView.type === 'company' && selectedCountry && (
          <>
            {/* Company markers */}
            {filteredCompanies.map((company) => (
              <Marker
                key={company.id}
                position={[company.coordinates.lat, company.coordinates.lng]}
                icon={createCustomIcon(company.sector, getMarkerSize(company.employees))}
                eventHandlers={{
                  click: () => handleCompanyClick(company),
                  mouseover: () => setHoveredCompany(company),
                  mouseout: () => setHoveredCompany(null)
                }}
              >
                <Popup>
                  <div className="text-center min-w-[200px]">
                    <h3 className="font-bold text-lg">{company.name}</h3>
                    <p className="text-gray-600">{company.sector}</p>
                    <p className="text-gray-600">Employees: {company.employees.toLocaleString()}</p>
                    <p className="text-gray-500 text-sm">{company.coordinates.address}</p>
                    <button
                      onClick={() => handleCompanyClick(company)}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}
      </MapContainer>

      {/* Hover Tooltip */}
      {hoveredCompany && (
        <div className="absolute z-20 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
          <h4 className="font-semibold text-gray-800">{hoveredCompany.name}</h4>
          <p className="text-sm text-gray-600">{hoveredCompany.sector}</p>
          <p className="text-sm text-gray-600">{hoveredCompany.employees.toLocaleString()} employees</p>
        </div>
      )}
    </div>
  );
}
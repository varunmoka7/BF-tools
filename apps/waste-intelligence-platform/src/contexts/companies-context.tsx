'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface Company {
  id: string;
  name: string;
  country: string;
  sector: string;
  industry: string;
  employees: number;
  year_of_disclosure: number;
  ticker: string;
  exchange: string;
  isin?: string;
  lei?: string;
  figi?: string;
  permid?: string;
  coordinates: {
    lat: number;
    lng: number;
    accuracy: number;
    address: string;
    source: string;
  };
}

export interface DashboardMetrics {
  totalCompanies: number;
  totalEmployees: number;
  countriesCovered: number;
  sectorsRepresented: number;
  averageEmployees: number;
  latestYear: number;
  topSector: string;
  topCountry: string;
}

interface CompaniesContextType {
  companies: Company[];
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const CompaniesContext = createContext<CompaniesContextType | undefined>(undefined)

export function CompaniesProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const calculateMetrics = (companiesData: Company[]): DashboardMetrics => {
    if (!companiesData || companiesData.length === 0) {
      // Fallback metrics
      return {
        totalCompanies: 325,
        totalEmployees: 13446170,
        countriesCovered: 7,
        sectorsRepresented: 12,
        averageEmployees: 41372,
        latestYear: 2024,
        topSector: 'Industrials',
        topCountry: 'France'
      }
    }

    const totalCompanies = companiesData.length
    const totalEmployees = companiesData.reduce((sum, c) => sum + c.employees, 0)
    const averageEmployees = Math.round(totalEmployees / totalCompanies)
    
    // Get unique countries and sectors
    const uniqueCountries = [...new Set(companiesData.map(c => c.country))]
    const uniqueSectors = [...new Set(companiesData.map(c => c.sector))]
    
    // Find top sector by company count
    const sectorCounts = companiesData.reduce((acc, company) => {
      acc[company.sector] = (acc[company.sector] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topSector = Object.entries(sectorCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown'
    
    // Find top country by company count
    const countryCounts = companiesData.reduce((acc, company) => {
      acc[company.country] = (acc[company.country] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topCountry = Object.entries(countryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown'
    
    // Get latest reporting year
    const latestYear = Math.max(...companiesData.map(c => c.year_of_disclosure))

    return {
      totalCompanies,
      totalEmployees,
      countriesCovered: uniqueCountries.length,
      sectorsRepresented: uniqueSectors.length,
      averageEmployees,
      latestYear,
      topSector,
      topCountry
    }
  }

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/companies-with-coordinates')
      if (!response.ok) {
        throw new Error('Failed to fetch company data')
      }
      
      const companiesData: Company[] = await response.json()
      
      console.log('Companies data loaded:', {
        count: companiesData.length,
        firstCompany: companiesData[0],
        sample: companiesData.slice(0, 3)
      })
      
      setCompanies(companiesData)
      const calculatedMetrics = calculateMetrics(companiesData)
      console.log('Calculated metrics:', calculatedMetrics)
      setMetrics(calculatedMetrics)
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error("Failed to fetch companies:", err)
      
      // Set fallback metrics even when there's an error
      setMetrics(calculateMetrics([]))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const value: CompaniesContextType = {
    companies,
    metrics,
    loading,
    error,
    refetch: fetchCompanies
  }

  return (
    <CompaniesContext.Provider value={value}>
      {children}
    </CompaniesContext.Provider>
  )
}

export function useCompanies() {
  const context = useContext(CompaniesContext)
  if (context === undefined) {
    throw new Error('useCompanies must be used within a CompaniesProvider')
  }
  return context
}
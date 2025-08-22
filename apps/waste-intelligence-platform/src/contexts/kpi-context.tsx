'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface KPIData {
  totalCompanies: number;
  totalWasteGenerated: number;
  totalWasteRecovered: number;
  avgRecoveryRate: number;
  countriesCovered: number;
  lastUpdated: string;
}

interface KPIContextType {
  kpiData: KPIData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const KPIContext = createContext<KPIContextType | undefined>(undefined)

export function KPIProvider({ children }: { children: ReactNode }) {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchKPIData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/dashboard/kpi')
      if (!response.ok) {
        throw new Error('Failed to fetch KPI data')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch KPI data')
      }
      
      setKpiData(result.data)
      console.log('KPI data loaded:', result.data)
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error("Failed to fetch KPI data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKPIData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const value: KPIContextType = {
    kpiData,
    loading,
    error,
    refetch: fetchKPIData
  }

  return (
    <KPIContext.Provider value={value}>
      {children}
    </KPIContext.Provider>
  )
}

export function useKPI() {
  const context = useContext(KPIContext)
  if (context === undefined) {
    throw new Error('useKPI must be used within a KPIProvider')
  }
  return context
}

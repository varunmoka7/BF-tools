'use client'

import { useState, useEffect } from 'react'

interface WasteRecoveryTrendData {
  period: string
  month: string
  totalGenerated: number
  totalRecovered: number
  totalDisposed: number
  totalRecycled: number
  hazardousWaste: number
  companiesReporting: number
  recoveryRate: number
  recyclingRate: number
  disposalRate: number
  topSector: string
  topSectorRate: number
  dataQuality: string
}

interface WasteRecoveryTrendsResponse {
  success: boolean
  data: WasteRecoveryTrendData[]
  summary: {
    totalPeriods: number
    avgRecoveryRate: number
    trendDirection: number
    latestPeriod: string
    latestRecoveryRate: number
    dataSource: string
  }
  error?: string
}

export function useWasteRecoveryTrends() {
  const [data, setData] = useState<WasteRecoveryTrendData[]>([])
  const [summary, setSummary] = useState<WasteRecoveryTrendsResponse['summary'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWasteRecoveryTrends() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/charts/waste-recovery-trends')
        const result: WasteRecoveryTrendsResponse = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch waste recovery trends')
        }

        if (result.success) {
          setData(result.data || [])
          setSummary(result.summary)
        } else {
          throw new Error(result.error || 'API returned unsuccessful response')
        }
      } catch (err) {
        console.error('Error fetching waste recovery trends:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        setData([])
        setSummary(null)
      } finally {
        setLoading(false)
      }
    }

    fetchWasteRecoveryTrends()
  }, [])

  return {
    data,
    summary,
    loading,
    error,
    refresh: () => {
      setLoading(true)
      // Trigger re-fetch by updating a dependency
      window.location.reload()
    }
  }
}
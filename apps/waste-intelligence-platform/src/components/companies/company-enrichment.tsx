'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

interface CompanyEnrichmentProps {
  companyId: string
  currentDescription?: string
  onEnrichmentComplete?: (newDescription: string) => void
}

interface EnrichmentStatus {
  needsEnrichment: boolean
  lastEnriched?: string
  dataSource?: string
}

export function CompanyEnrichment({
  companyId,
  currentDescription,
  onEnrichmentComplete
}: CompanyEnrichmentProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<EnrichmentStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Check if company needs enrichment
  useEffect(() => {
    checkEnrichmentStatus()
  }, [companyId])

  const checkEnrichmentStatus = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/enrich`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setStatus(result.data)
        }
      }
    } catch (err) {
      console.error('Failed to check enrichment status:', err)
    }
  }

  const enrichCompany = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/companies/${companyId}/enrich`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to enrich company data')
      }

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setStatus(prev => ({ ...prev, needsEnrichment: false, dataSource: result.data.enrichment.source }))

        if (onEnrichmentComplete && result.data.enrichment.description) {
          onEnrichmentComplete(result.data.enrichment.description)
        }
      } else {
        throw new Error(result.error || 'Enrichment failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enrich company data')
    } finally {
      setLoading(false)
    }
  }

  if (!status) return null

  return (
    <div className="flex flex-col gap-2">
      {/* Enrichment Status Indicator */}
      <div className="flex items-center gap-2 text-sm">
        {status.dataSource === 'Generated' || status.needsEnrichment ? (
          <>
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="text-amber-600">
              Generic description - needs real company data
            </span>
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-600">
              Real company data from {status.dataSource}
              {status.lastEnriched && (
                <span className="text-gray-500 ml-1">
                  (Updated: {new Date(status.lastEnriched).toLocaleDateString()})
                </span>
              )}
            </span>
          </>
        )}
      </div>

      {/* Enrichment Action */}
      {(status.needsEnrichment || status.dataSource === 'Generated') && (
        <div className="flex items-center gap-2">
          <Button
            onClick={enrichCompany}
            disabled={loading}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Fetching real data...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-1" />
                Get Real Company Info
              </>
            )}
          </Button>

          {success && (
            <span className="text-green-600 text-xs flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Updated with real data!
            </span>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-xs bg-red-50 p-2 rounded border">
          {error}
        </div>
      )}

      {/* Data Source Info */}
      {status.dataSource && status.dataSource !== 'Generated' && (
        <div className="text-xs text-gray-500">
          Data source: {status.dataSource}
          {status.lastEnriched && (
            <span> • Last updated: {new Date(status.lastEnriched).toLocaleDateString()}</span>
          )}
        </div>
      )}
    </div>
  )
}

export default CompanyEnrichment
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react'

interface Company {
  id: string;
  ticker: string;
  exchange: string;
  isin: string;
  lei: string;
  figi: string;
  permid: string;
}

interface CompanyIdentifiersCardProps {
  company: Company;
}

export function CompanyIdentifiersCard({ company }: CompanyIdentifiersCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (value: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const identifiers = [
    {
      label: 'Ticker',
      value: company.ticker,
      description: 'Stock ticker symbol'
    },
    {
      label: 'Exchange',
      value: company.exchange,
      description: 'Stock exchange listing'
    },
    {
      label: 'ISIN',
      value: company.isin,
      description: 'International Securities Identification Number'
    },
    {
      label: 'LEI',
      value: company.lei,
      description: 'Legal Entity Identifier'
    },
    {
      label: 'FIGI',
      value: company.figi,
      description: 'Financial Instrument Global Identifier'
    },
    {
      label: 'PermID',
      value: company.permid,
      description: 'Refinitiv Permanent Identifier'
    }
  ].filter(identifier => identifier.value && identifier.value !== 'N/A')

  if (identifiers.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Company Identifiers
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {identifiers.map((identifier) => (
              <div key={identifier.label} className="group">
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {identifier.label}:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-900">
                          {identifier.value}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(identifier.value, identifier.label)}
                        >
                          {copiedField === identifier.label ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {identifier.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Information Note */}
          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-700">
              <strong>Note:</strong> These identifiers can be used for financial data integration, 
              regulatory reporting, and cross-referencing with other databases.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
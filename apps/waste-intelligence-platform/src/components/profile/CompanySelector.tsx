'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Building2, Check, Users, Calendar } from 'lucide-react'
import type { Company } from '@/types/auth'

interface CompanySelectorProps {
  className?: string
  onCompanyChange?: (company: Company) => void
}

export function CompanySelector({ className, onCompanyChange }: CompanySelectorProps) {
  const { profile, companies, switchCompany } = useAuth()
  const [selectedCompanyId, setSelectedCompanyId] = useState(profile?.company_id || '')
  const [isSwitching, setIsSwitching] = useState(false)
  const [error, setError] = useState<string>('')

  const handleCompanySwitch = async () => {
    if (!selectedCompanyId || selectedCompanyId === profile?.company_id) {
      return
    }

    setIsSwitching(true)
    setError('')

    try {
      const { error } = await switchCompany(selectedCompanyId)

      if (error) {
        setError(error)
      } else {
        const selectedCompany = companies.find(c => c.id === selectedCompanyId)
        if (selectedCompany && onCompanyChange) {
          onCompanyChange(selectedCompany)
        }
      }
    } catch (error) {
      setError('An unexpected error occurred while switching companies')
    } finally {
      setIsSwitching(false)
    }
  }

  const getSubscriptionBadgeColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800'
      case 'professional': return 'bg-blue-100 text-blue-800'
      case 'free': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (companies.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Company Access</span>
          </CardTitle>
          <CardDescription>
            You don't have access to any companies yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Companies Available</h3>
            <p className="text-gray-500 mb-4">
              Contact your administrator to get access to company data and analytics.
            </p>
            <Button variant="outline">
              Request Access
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentCompany = companies.find(c => c.id === profile?.company_id)
  const hasMultipleCompanies = companies.length > 1

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5" />
          <span>Company Access</span>
        </CardTitle>
        <CardDescription>
          {hasMultipleCompanies
            ? 'Select which company you want to view data for'
            : 'Your current company access'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}

        {/* Current Company Display */}
        {currentCompany && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={currentCompany.logo_url} />
                  <AvatarFallback className="bg-green-100 text-green-800">
                    {getCompanyInitials(currentCompany.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-green-900">
                    {currentCompany.name}
                  </h3>
                  <p className="text-sm text-green-700">Current company</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-600" />
                <Badge className={getSubscriptionBadgeColor(currentCompany.subscription_tier)}>
                  {currentCompany.subscription_tier.charAt(0).toUpperCase() +
                   currentCompany.subscription_tier.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Company Selection */}
        {hasMultipleCompanies && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Available Companies</h4>

            <RadioGroup
              value={selectedCompanyId}
              onValueChange={setSelectedCompanyId}
              className="space-y-3"
            >
              {companies.map((company) => (
                <div key={company.id} className="relative">
                  <Label
                    htmlFor={company.id}
                    className={cn(
                      'flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors',
                      selectedCompanyId === company.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <RadioGroupItem value={company.id} id={company.id} />

                    <Avatar className="h-10 w-10">
                      <AvatarImage src={company.logo_url} />
                      <AvatarFallback>
                        {getCompanyInitials(company.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 truncate">
                          {company.name}
                        </h4>
                        <Badge className={getSubscriptionBadgeColor(company.subscription_tier)}>
                          {company.subscription_tier}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Since {formatDate(company.created_at)}</span>
                        </div>
                        {/* Add more company metadata as needed */}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Action Button */}
            {selectedCompanyId !== profile?.company_id && (
              <div className="pt-4 border-t">
                <Button
                  onClick={handleCompanySwitch}
                  disabled={isSwitching || !selectedCompanyId}
                  className="w-full"
                >
                  {isSwitching ? 'Switching...' : 'Switch Company'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Company Statistics */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Access Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{companies.length}</div>
              <div className="text-gray-500">Available Companies</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {companies.filter(c => c.subscription_tier !== 'free').length}
              </div>
              <div className="text-gray-500">Premium Access</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
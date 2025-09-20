'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { Company } from '@/types/auth'

interface UserSettingsProps {
  className?: string
}

export function UserSettings({ className }: UserSettingsProps) {
  const { user, profile, companies, switchCompany, signOut } = useAuth()
  const [isCompanySwitching, setIsCompanySwitching] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)
  const [error, setError] = useState<string>('')

  const handleCompanySwitch = async (companyId: string) => {
    setIsCompanySwitching(true)
    setError('')

    try {
      const { error } = await switchCompany(companyId)

      if (error) {
        setError(error)
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setIsCompanySwitching(false)
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      await signOut()
    } catch (error) {
      setError('An unexpected error occurred while signing out')
      setIsSigningOut(false)
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

  const currentCompany = companies.find(c => c.id === profile?.company_id)

  return (
    <div className={cn('space-y-6', className)}>
      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your current account details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Management */}
      <Card>
        <CardHeader>
          <CardTitle>Company Access</CardTitle>
          <CardDescription>
            Manage your company affiliations and switch between organizations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentCompany && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{currentCompany.name}</h4>
                  <p className="text-sm text-gray-500">Current company</p>
                </div>
                <Badge className={getSubscriptionBadgeColor(currentCompany.subscription_tier)}>
                  {currentCompany.subscription_tier.charAt(0).toUpperCase() +
                   currentCompany.subscription_tier.slice(1)}
                </Badge>
              </div>
            </div>
          )}

          {companies.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Switch Company</label>
              <Select
                value={profile?.company_id || ''}
                onValueChange={handleCompanySwitch}
                disabled={isCompanySwitching}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{company.name}</span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'ml-2',
                            getSubscriptionBadgeColor(company.subscription_tier)
                          )}
                        >
                          {company.subscription_tier}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isCompanySwitching && (
                <p className="text-sm text-gray-500">Switching company...</p>
              )}
            </div>
          )}

          {companies.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No companies found</p>
              <p className="text-sm text-gray-400">
                Contact your administrator to get access to company data
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Customize your experience with the waste intelligence platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Email Notifications</label>
                <p className="text-sm text-gray-500">
                  Receive updates about waste management insights
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Dashboard Layout</label>
                <p className="text-sm text-gray-500">
                  Customize your dashboard appearance
                </p>
              </div>
              <Button variant="outline" size="sm">
                Customize
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Data Export Preferences</label>
                <p className="text-sm text-gray-500">
                  Set default formats and filters for exports
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your account security and access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Change Password</label>
                <p className="text-sm text-gray-500">
                  Update your account password
                </p>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Two-Factor Authentication</label>
                <p className="text-sm text-gray-500">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Active Sessions</label>
                <p className="text-sm text-gray-500">
                  Manage your active login sessions
                </p>
              </div>
              <Button variant="outline" size="sm">
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Sign Out</label>
                <p className="text-sm text-gray-500">
                  Sign out of your current session
                </p>
              </div>
              <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Sign Out
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Sign Out</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to sign out? You'll need to sign in again to access your account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowSignOutDialog(false)}
                      disabled={isSigningOut}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                    >
                      {isSigningOut ? 'Signing out...' : 'Sign Out'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-red-600">Delete Account</label>
                <p className="text-sm text-gray-500">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
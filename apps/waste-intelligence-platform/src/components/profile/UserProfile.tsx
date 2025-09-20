'use client'

import React, { useState } from 'react'
import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProfilePictureUpload } from './ProfilePictureUpload'
import { cn } from '@/lib/utils'
import type { ProfileUpdateData } from '@/types/auth'

interface UserProfileProps {
  className?: string
}

export function UserProfile({ className }: UserProfileProps) {
  const { user, profile, updateProfile, loading } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<ProfileUpdateData>({
    full_name: profile?.full_name || '',
    company_name: profile?.company_name || '',
    role: profile?.role || 'viewer',
  })

  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name,
        company_name: profile.company_name || '',
        role: profile.role,
      })
    }
  }, [profile])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)

    try {
      const { error } = await updateProfile(formData)

      if (error) {
        setErrors({ general: error })
      } else {
        setIsEditing(false)
        setErrors({})
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name,
        company_name: profile.company_name || '',
        role: profile.role,
      })
    }
    setIsEditing(false)
    setErrors({})
  }

  const handleInputChange = (field: keyof ProfileUpdateData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value as ProfileUpdateData['role'] }))
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'analyst': return 'bg-green-100 text-green-800'
      case 'viewer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <Card className={cn('w-full max-w-2xl mx-auto', className)}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card className={cn('w-full max-w-2xl mx-auto', className)}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            Unable to load profile information
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>
              Manage your account information and preferences
            </CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {errors.general && (
          <Alert variant="destructive">
            {errors.general}
          </Alert>
        )}

        {/* Profile Picture Section */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="text-lg">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>

          {isEditing && (
            <ProfilePictureUpload />
          )}
        </div>

        {/* Account Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              value={user?.email || ''}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">
              Email cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            {isEditing ? (
              <div>
                <Input
                  value={formData.full_name}
                  onChange={handleInputChange('full_name')}
                  className={cn(errors.full_name && 'border-red-500')}
                  placeholder="Enter your full name"
                />
                {errors.full_name && (
                  <p className="text-sm text-red-500 mt-1">{errors.full_name}</p>
                )}
              </div>
            ) : (
              <Input
                value={profile.full_name}
                disabled
                className="bg-gray-50"
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Company</label>
            {isEditing ? (
              <Input
                value={formData.company_name}
                onChange={handleInputChange('company_name')}
                placeholder="Enter your company name"
              />
            ) : (
              <Input
                value={profile.company_name || 'Not specified'}
                disabled
                className="bg-gray-50"
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            {isEditing ? (
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div>
                <Badge className={getRoleColor(profile.role)}>
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Account Details */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <span className="text-gray-500">Member since:</span>
              <p className="font-medium">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Last updated:</span>
              <p className="font-medium">
                {new Date(profile.updated_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-gray-500">User ID:</span>
              <p className="font-mono text-xs break-all">
                {profile.user_id}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
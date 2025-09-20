'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  allowedRoles?: string[]
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = '/login',
  allowedRoles = [],
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (requireAuth && !user) {
      // Redirect to login with return URL
      const currentPath = window.location.pathname
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
      router.push(redirectUrl)
      return
    }

    if (allowedRoles.length > 0 && profile && !allowedRoles.includes(profile.role)) {
      // Redirect to unauthorized page or dashboard
      router.push('/unauthorized')
      return
    }
  }, [user, profile, loading, requireAuth, allowedRoles, redirectTo, router])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Don't render children if authentication is required but user is not authenticated
  if (requireAuth && !user) {
    return null
  }

  // Don't render children if user doesn't have required role
  if (allowedRoles.length > 0 && profile && !allowedRoles.includes(profile.role)) {
    return null
  }

  return <>{children}</>
}
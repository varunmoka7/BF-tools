'use client'

import React from 'react'
import { Suspense } from 'react'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent } from '@/components/ui/card'

function LoginPageContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">W</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Waste Intelligence Platform
          </h1>
          <p className="text-gray-600">
            Advanced analytics for sustainable waste management
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Additional Links */}
        <div className="text-center space-y-4">
          <div className="text-sm text-gray-500">
            <p>
              By signing in, you agree to our{' '}
              <Link
                href="/terms"
                className="text-blue-600 hover:text-blue-500 underline"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-500 underline"
              >
                Privacy Policy
              </Link>
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <Link
                href="/support"
                className="text-blue-600 hover:text-blue-500"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Notice */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="font-medium text-blue-900 mb-2">Demo Account</h3>
              <p className="text-sm text-blue-700 mb-3">
                Try the platform with our demo account:
              </p>
              <div className="space-y-1 text-sm">
                <p className="font-mono bg-white px-2 py-1 rounded border">
                  demo@wasteintelligence.com
                </p>
                <p className="font-mono bg-white px-2 py-1 rounded border">
                  demo123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
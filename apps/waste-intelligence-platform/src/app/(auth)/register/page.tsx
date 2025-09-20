'use client'

import React from 'react'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Card, CardContent } from '@/components/ui/card'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">W</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Join Waste Intelligence
          </h1>
          <p className="text-gray-600">
            Start optimizing your waste management today
          </p>
        </div>

        {/* Register Form */}
        <RegisterForm />

        {/* Additional Information */}
        <div className="text-center space-y-4">
          <div className="text-sm text-gray-500">
            <p>
              By creating an account, you agree to our{' '}
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

        {/* Features Preview */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <h3 className="font-medium text-green-900 text-center mb-3">
                What you'll get:
              </h3>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Real-time waste analytics dashboard</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Compliance tracking and reporting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Cost optimization insights</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Environmental impact monitoring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Multi-company management</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
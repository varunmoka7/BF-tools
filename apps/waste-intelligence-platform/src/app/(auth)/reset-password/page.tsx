'use client'

import React from 'react'
import Link from 'next/link'
import { PasswordResetForm } from '@/components/auth/PasswordResetForm'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">W</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reset Password
          </h1>
          <p className="text-gray-600">
            We'll send you a link to reset your password
          </p>
        </div>

        {/* Password Reset Form */}
        <PasswordResetForm />

        {/* Additional Links */}
        <div className="text-center space-y-4">
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign up
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

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-center">
            <h3 className="font-medium text-yellow-800 mb-2">Security Notice</h3>
            <p className="text-sm text-yellow-700">
              For security reasons, password reset links expire after 24 hours.
              If you don't receive an email, please check your spam folder.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
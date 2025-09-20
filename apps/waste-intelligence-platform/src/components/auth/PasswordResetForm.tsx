'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import type { PasswordResetFormData } from '@/types/auth'

interface PasswordResetFormProps {
  className?: string
}

export function PasswordResetForm({ className }: PasswordResetFormProps) {
  const [formData, setFormData] = useState<PasswordResetFormData>({
    email: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [authError, setAuthError] = useState<string>('')

  const { resetPassword } = useAuth()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setAuthError('')

    try {
      const { error } = await resetPassword(formData.email)

      if (error) {
        setAuthError(error)
      } else {
        setIsSuccess(true)
      }
    } catch (error) {
      setAuthError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ email: e.target.value })

    // Clear error when user starts typing
    if (errors.email) {
      setErrors({})
    }
  }

  if (isSuccess) {
    return (
      <Card className={cn('w-full max-w-md mx-auto', className)}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-green-600">
            Check Your Email
          </CardTitle>
          <CardDescription className="text-center">
            We've sent password reset instructions to your email address
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <div className="space-y-2">
              <p className="font-medium">Email sent successfully!</p>
              <p className="text-sm">
                Please check your email ({formData.email}) for password reset instructions.
                The link will expire in 24 hours.
              </p>
            </div>
          </Alert>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => {
                  setIsSuccess(false)
                  setFormData({ email: '' })
                }}
                className="text-blue-600 hover:text-blue-500 underline"
              >
                try again
              </button>
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Reset Password
        </CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {authError && (
            <Alert variant="destructive">
              {authError}
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
              className={cn(errors.email && 'border-red-500')}
              disabled={isLoading}
              autoComplete="email"
              autoFocus
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Sending reset link...' : 'Send Reset Link'}
          </Button>

          <div className="text-center space-y-2">
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Back to Sign In
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
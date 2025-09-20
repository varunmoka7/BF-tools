'use client'

import React, { useState, useRef } from 'react'
import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface ProfilePictureUploadProps {
  className?: string
}

export function ProfilePictureUpload({ className }: ProfilePictureUploadProps) {
  const { uploadAvatar } = useUser()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setError('')
    setIsUploading(true)

    try {
      const { error } = await uploadAvatar(file)

      if (error) {
        setError(error)
      }
    } catch (error) {
      setError('An unexpected error occurred while uploading')
    } finally {
      setIsUploading(false)
      // Clear the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col items-center space-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFileSelect}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Change Picture'}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Supported formats: JPG, PNG, GIF (max 5MB)
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="text-sm">
          {error}
        </Alert>
      )}
    </div>
  )
}
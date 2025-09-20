import { useAuth } from '@/components/auth/AuthProvider'
import type { UserProfile } from '@/types/auth'

export function useUser() {
  const { user, profile, updateProfile, uploadAvatar, loading } = useAuth()

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    return await updateProfile(updates)
  }

  const uploadUserAvatar = async (file: File) => {
    return await uploadAvatar(file)
  }

  const isAuthenticated = !!user
  const hasProfile = !!profile

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    hasProfile,
    updateProfile: updateUserProfile,
    uploadAvatar: uploadUserAvatar,
  }
}
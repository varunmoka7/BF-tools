'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { AuthUser, AuthContextType, UserProfile, Company } from '@/types/auth'
import { toast } from '@/hooks/use-toast'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }

      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user as AuthUser)
          await loadUserProfile(session.user.id)
          await loadUserCompanies(session.user.id)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user as AuthUser)
          await loadUserProfile(session.user.id)
          await loadUserCompanies(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setCompanies([])
        }
        setLoading(false)
      }
    )

    getInitialSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadUserProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error)
        return
      }

      if (data) {
        setProfile(data)
      } else {
        // Create a basic profile if none exists
        const newProfile = {
          user_id: userId,
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
          role: 'viewer' as const,
          company_id: null,
          company_name: null
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single()

        if (createError) {
          console.error('Error creating user profile:', createError)
        } else {
          setProfile(createdProfile)
        }
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
    }
  }

  const loadUserCompanies = async (userId: string) => {
    if (!isSupabaseConfigured) return

    try {
      // This would typically involve a junction table for user-company relationships
      // For now, we'll use a simplified approach
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .limit(10)

      if (error) {
        console.error('Error loading companies:', error)
        return
      }

      setCompanies(data || [])
    } catch (error) {
      console.error('Error in loadUserCompanies:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'Authentication service not configured' }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      toast({
        title: 'Welcome back!',
        description: 'You have been successfully signed in.',
      })

      router.push('/dashboard')
      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'Authentication service not configured' }
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        return { error: error.message }
      }

      toast({
        title: 'Account created!',
        description: 'Please check your email to verify your account.',
      })

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) return

    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setCompanies([])
      router.push('/login')

      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'Authentication service not configured' }
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        return { error: error.message }
      }

      toast({
        title: 'Password reset email sent',
        description: 'Please check your email for password reset instructions.',
      })

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!isSupabaseConfigured || !profile) {
      return { error: 'Authentication service not configured or no profile found' }
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) {
        return { error: error.message }
      }

      setProfile({ ...profile, ...updates } as UserProfile)

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      })

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const uploadAvatar = async (file: File) => {
    if (!isSupabaseConfigured || !user) {
      return { error: 'Authentication service not configured or user not found' }
    }

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        return { error: uploadError.message }
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const avatarUrl = data.publicUrl

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: avatarUrl })

      return { url: avatarUrl }
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const switchCompany = async (companyId: string) => {
    if (!isSupabaseConfigured || !profile) {
      return { error: 'Authentication service not configured or no profile found' }
    }

    try {
      const company = companies.find(c => c.id === companyId)
      if (!company) {
        return { error: 'Company not found' }
      }

      await updateProfile({
        company_id: companyId,
        company_name: company.name,
      })

      toast({
        title: 'Company switched',
        description: `You are now viewing data for ${company.name}.`,
      })

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    companies,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    uploadAvatar,
    switchCompany,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
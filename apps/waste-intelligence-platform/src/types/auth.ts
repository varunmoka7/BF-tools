import { User } from '@supabase/supabase-js'

export interface AuthUser extends User {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
    company_id?: string
    company_name?: string
    role?: string
  }
}

export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  avatar_url?: string
  company_id?: string
  company_name?: string
  role: 'admin' | 'manager' | 'analyst' | 'viewer'
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  logo_url?: string
  subscription_tier: 'free' | 'professional' | 'enterprise'
  created_at: string
}

export interface AuthContextType {
  user: AuthUser | null
  profile: UserProfile | null
  companies: Company[]
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>
  uploadAvatar: (file: File) => Promise<{ error?: string; url?: string }>
  switchCompany: (companyId: string) => Promise<{ error?: string }>
}

export interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  companyName?: string
  acceptTerms: boolean
}

export interface PasswordResetFormData {
  email: string
}

export interface ProfileUpdateData {
  full_name: string
  company_name?: string
  role?: UserProfile['role']
}

export interface AuthError {
  message: string
  field?: string
}
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabaseClient: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
} else if (process.env.NODE_ENV !== 'production') {
  console.warn(
    'Supabase environment variables are missing. Falling back to local mock data for API routes.'
  )
}

export const supabase = supabaseClient
export const isSupabaseConfigured = Boolean(supabaseClient)

export function getSupabaseClient(): SupabaseClient | null {
  return supabaseClient
}

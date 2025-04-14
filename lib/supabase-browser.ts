import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('createClient must be called on the client side')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
} 
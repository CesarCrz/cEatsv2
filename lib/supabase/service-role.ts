import { createClient } from '@supabase/supabase-js'

/**
 * Service Role Client para Supabase
 * Bypassa Row Level Security (RLS) para operaciones administrativas
 * SOLO usar en server-side para operaciones críticas como registro de usuarios
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for service role')
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
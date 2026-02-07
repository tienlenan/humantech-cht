import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Server-side Supabase client using the service role key.
 * Use this in API routes / server actions where elevated privileges are needed.
 */
export function createServerClient() {
  return createClient(supabaseUrl, supabaseServiceRoleKey)
}

/**
 * Browser-side Supabase client using the anon key.
 * Use this for client-side reads that go through RLS policies.
 */
export function createBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

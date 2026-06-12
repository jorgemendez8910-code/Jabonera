import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// service_role client — ONLY for app/api/admin routes, never imported by client code.
// Lazily instantiated so module evaluation (e.g. Next.js build-time page-data
// collection) doesn't crash before the real env vars are available.
let client: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }
  return client
}

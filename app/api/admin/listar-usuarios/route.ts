import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { requireAdminKey } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminKey(request)
  if (unauthorized) return unauthorized

  const { data, error } = await getSupabaseAdmin()
    .from('profiles')
    .select('id, email, full_name, access_status, onboarding_completed')
    .order('email')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users: data })
}

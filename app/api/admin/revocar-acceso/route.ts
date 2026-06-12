import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { requireAdminKey } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminKey(request)
  if (unauthorized) return unauthorized

  const { userId } = await request.json()
  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'userId es obligatorio' }, { status: 400 })
  }

  const supabaseAdmin = getSupabaseAdmin()

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ access_status: 'revoked' })
    .eq('id', userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabaseAdmin.from('feature_events').insert({
    user_id: userId,
    event_name: 'access_revoked',
    metadata: { revoked_by: 'admin' },
  })

  return NextResponse.json({ ok: true })
}

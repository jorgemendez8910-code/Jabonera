import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

// GET /api/auth/validate-token?token=xxx
// Consulta pending_activations con service_role (RLS no permite acceso anónimo).
// Solo retorna lo estrictamente necesario para la página de activación —
// el token mismo nunca se devuelve al cliente.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token || token.length !== 64) {
    console.warn('[validate-token] Token inválido — falta o longitud incorrecta:', token?.length)
    return NextResponse.json({ valid: false, _debug: 'bad_token' }, { status: 200 })
  }

  console.log('[validate-token] token prefix:', token.slice(0, 12) + '…', '| length:', token.length)

  // Verificar env vars en runtime
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  console.log('[validate-token] SUPABASE_URL:', url?.trim())
  console.log('[validate-token] SERVICE_ROLE_KEY length:', key?.length, '| trimmed length:', key?.trim().length)

  const db = getSupabaseAdmin()

  const { data, error } = await db
    .from('pending_activations')
    .select('id, email, expires_at, activated_at')
    .eq('activation_token', token)
    .maybeSingle()

  if (error) {
    console.error('[validate-token] ❌ Supabase error:', error.message, '| code:', error.code, '| hint:', error.hint, '| details:', error.details)
    return NextResponse.json({ valid: false, _debug: 'db_error' }, { status: 200 })
  }

  if (!data) {
    console.warn('[validate-token] ❌ Token NOT FOUND in pending_activations — token prefix:', token.slice(0, 12) + '…')
    // Extra query: count total rows to verify table exists and has data
    const { count, error: countError } = await db
      .from('pending_activations')
      .select('*', { count: 'exact', head: true })
    console.warn('[validate-token] total rows in pending_activations:', count, '| count error:', countError?.message)
    return NextResponse.json({ valid: false, _debug: 'not_found' }, { status: 200 })
  }

  console.log('[validate-token] row found — email:', data.email, '| activated_at:', data.activated_at, '| expires_at:', data.expires_at)

  if (data.activated_at) {
    console.warn('[validate-token] ❌ Token already used at:', data.activated_at)
    return NextResponse.json({ valid: false, reason: 'already_used', _debug: 'used' }, { status: 200 })
  }

  const expired = new Date(data.expires_at) < new Date()
  if (expired) {
    console.warn('[validate-token] ❌ Token expired at:', data.expires_at)
    return NextResponse.json({ valid: false, expired: true, _debug: 'expired' }, { status: 200 })
  }

  console.log('[validate-token] ✅ Token valid for:', data.email)
  return NextResponse.json({ valid: true, email: data.email }, { status: 200 })
}

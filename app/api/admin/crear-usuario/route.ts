import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { requireAdminKey } from '@/lib/admin-auth'

// Manual interim replacement for the Hotmart webhook (not built yet):
// creates the auth user + profile row and returns a temp password for
// the buyer to use on their first login, then set a real one on /activate.
export async function POST(request: NextRequest) {
  const unauthorized = requireAdminKey(request)
  if (unauthorized) return unauthorized

  const { email, fullName: rawFullName } = await request.json()
  const fullName = rawFullName
    ? (rawFullName as string).trim().split(/\s+/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : undefined
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'El correo es obligatorio' }, { status: 400 })
  }

  // Memorable on purpose — an admin reads this aloud / pastes it into WhatsApp
  // for the buyer to type on their phone; they replace it via /activate anyway.
  const tempPassword = `Jabonera${Math.floor(1000 + Math.random() * 9000)}`
  const supabaseAdmin = getSupabaseAdmin()

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  })

  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message ?? 'No se pudo crear el usuario' }, { status: 400 })
  }

  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: created.user.id,
    email,
    full_name: fullName ?? null,
    access_status: 'active',
  })

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(created.user.id)
    return NextResponse.json(
      { error: 'No se pudo crear el perfil; se revirtió la creación del usuario' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    user: { id: created.user.id, email },
    tempPassword,
  })
}

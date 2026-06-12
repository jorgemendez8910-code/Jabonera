import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

interface ActivateBody {
  token: string
  password: string
  name?: string
}

// POST /api/auth/activate
// Crea el usuario usando el cliente admin con email_confirm: true, lo que evita
// que Supabase mande el correo de "Confirma tu dirección de correo".
// El token se re-valida aquí en el servidor — el cliente nunca puede bypassear esto.
export async function POST(request: NextRequest) {
  let body: ActivateBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }

  const { token, password, name: rawName } = body
  const name = rawName
    ? rawName.trim().split(/\s+/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : undefined

  if (!token || typeof token !== 'string' || token.length !== 64) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Contraseña demasiado corta' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  // Re-validar el token en el servidor (segunda línea de defensa)
  const { data: activation, error: fetchError } = await db
    .from('pending_activations')
    .select('id, email, expires_at, activated_at')
    .eq('activation_token', token)
    .maybeSingle()

  if (fetchError) {
    console.error('[activate] DB error al leer token:', fetchError.message)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
  if (!activation) {
    return NextResponse.json({ error: 'Token no encontrado' }, { status: 400 })
  }
  if (activation.activated_at) {
    return NextResponse.json({ error: 'Este enlace ya fue usado' }, { status: 400 })
  }
  if (new Date(activation.expires_at) < new Date()) {
    return NextResponse.json({ error: 'El enlace expiró' }, { status: 400 })
  }

  const email = activation.email as string

  // Crear usuario con email_confirm: true → Supabase NO manda correo de confirmación.
  // Ya verificamos la identidad del comprador vía el token del webhook de Hotmart.
  const { data: created, error: createError } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name ?? null },
  })

  if (createError) {
    // Si el usuario ya existe, lo retornamos con ese error para que el cliente
    // le indique al usuario que inicie sesión directamente.
    if (
      createError.message.toLowerCase().includes('already registered') ||
      createError.message.toLowerCase().includes('already been registered') ||
      createError.message.toLowerCase().includes('user already exists')
    ) {
      return NextResponse.json({ error: 'email_exists' }, { status: 409 })
    }
    console.error('[activate] admin.createUser error:', createError.message)
    return NextResponse.json({ error: 'No se pudo crear la cuenta' }, { status: 500 })
  }

  if (!created.user) {
    return NextResponse.json({ error: 'Error inesperado al crear usuario' }, { status: 500 })
  }

  // Marcar el token como usado y crear/actualizar el perfil
  const { error: rpcError } = await db.rpc('activate_user', {
    p_token: token,
    p_user_id: created.user.id,
    p_email: email,
    p_full_name: name ?? null,
  })

  if (rpcError) {
    // No es fatal: el usuario existe en Auth. Loggear y continuar.
    console.error('[activate] activate_user RPC error:', rpcError.message)
  }

  console.log('[activate] Usuario creado y activado:', email)
  return NextResponse.json({ success: true, email }, { status: 200 })
}

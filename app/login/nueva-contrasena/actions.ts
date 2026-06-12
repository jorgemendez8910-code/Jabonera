'use server'

import { createClient } from '@/lib/supabase/server'

export async function updatePassword(password: string): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: 'No pudimos actualizar tu contraseña. El enlace puede haber expirado.' }
  }

  await supabase.auth.signOut()
}

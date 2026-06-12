'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signIn(email: string, password: string, redirectTo = '/dashboard'): Promise<{ error: string } | void> {
  const safe = typeof redirectTo === 'string' && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
    ? redirectTo
    : '/dashboard'

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes('invalid login credentials')) {
      return { error: 'Correo o contraseña incorrectos. Inténtalo de nuevo 💛' }
    }
    return { error: 'Algo no salió bien. Inténtalo de nuevo en un momento.' }
  }

  redirect(safe)
}

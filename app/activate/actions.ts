'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function activateAccount(password: string): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: 'No pudimos activar tu cuenta. Inténtalo de nuevo en un momento.' }
  }

  redirect('/dashboard')
}

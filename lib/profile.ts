'use server'

import { createClient } from '@/lib/supabase/server'

// Server Action — the only mutation StoreProvider needs (skill: data-patterns).
// Profile reads live in lib/data.ts (getUserProfile), fetched by Server Components.
export async function updateCurrencyPreference(currency: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('profiles').update({ currency_preference: currency }).eq('id', user.id)
}

export async function updateFullName(name: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('profiles').update({ full_name: name.trim() }).eq('id', user.id)
  if (error) return { error: 'No se pudo actualizar el nombre' }
  return {}
}

export async function updatePassword(newPassword: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: 'No se pudo cambiar la contraseña' }
  return {}
}

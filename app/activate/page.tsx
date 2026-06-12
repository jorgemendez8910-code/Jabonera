import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ActivateScreen } from './ActivateScreen'

// Server Component — auth check + fetch (skill: rsc-boundaries)
export default async function ActivatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <ActivateScreen email={user.email ?? ''} />
}

import type { Metadata } from 'next'
import { getUserProfile } from '@/lib/data'
import { CuentaScreen } from './CuentaScreen'

export const metadata: Metadata = { title: 'Mi cuenta' }

function nameFor(profile: { full_name: string | null; email: string } | null): string {
  if (profile?.full_name) return profile.full_name
  if (profile?.email) return profile.email.split('@')[0]
  return 'Artesana'
}

export default async function CuentaPage() {
  const profile = await getUserProfile()
  return (
    <CuentaScreen
      name={nameFor(profile)}
      email={profile?.email ?? ''}
    />
  )
}

import type { Metadata } from 'next'
import { getUserProfile } from '@/lib/data'

export const metadata: Metadata = { title: 'Mi perfil' }
import { getUserCostings } from '@/lib/costings'
import { PerfilScreen } from './PerfilScreen'

function nameFor(profile: { full_name: string | null; email: string } | null): string {
  if (profile?.full_name) return profile.full_name
  if (profile?.email) return profile.email.split('@')[0]
  return 'Artesana'
}

// Server Component — auth via middleware, parallel fetch (skill: rsc-boundaries)
export default async function PerfilPage() {
  const [profile, costings] = await Promise.all([
    getUserProfile(),
    getUserCostings(),
  ])

  const name = nameFor(profile)

  return (
    <PerfilScreen
      name={name}
      email={profile?.email ?? ''}
      avatarInitial={name[0]?.toUpperCase() ?? 'A'}
      costingsCount={costings.length}
    />
  )
}

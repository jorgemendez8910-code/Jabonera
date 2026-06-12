import type { Metadata } from 'next'
import { getCategoriesWithCounts, getUserProfile } from '@/lib/data'

export const metadata: Metadata = { title: 'Mi taller' }
import { getUserCostings } from '@/lib/costings'
import { DashboardScreen } from './DashboardScreen'

function displayNameFor(profile: { full_name: string | null; email: string } | null): string {
  if (profile?.full_name) return profile.full_name.split(' ')[0]
  if (profile?.email) return profile.email.split('@')[0]
  return 'Artesana'
}

// Server Component — auth via middleware, parallel fetch (skill: rsc-boundaries)
export default async function DashboardPage() {
  const [profile, categories, costings] = await Promise.all([
    getUserProfile(),
    getCategoriesWithCounts(),
    getUserCostings(),
  ])

  const displayName = displayNameFor(profile)

  return (
    <DashboardScreen
      displayName={displayName}
      avatarInitial={displayName[0]?.toUpperCase() ?? 'A'}
      categories={categories}
      recentCostings={costings.slice(0, 2)}
    />
  )
}

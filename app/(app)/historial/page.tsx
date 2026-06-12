import type { Metadata } from 'next'
import { getUserCostings } from '@/lib/costings'

export const metadata: Metadata = { title: 'Mis costeos' }
import { HistorialScreen } from './HistorialScreen'

// Server Component — fetches the user's saved costings (skill: rsc-boundaries)
export default async function HistorialPage() {
  const items = await getUserCostings()
  return <HistorialScreen items={items} />
}

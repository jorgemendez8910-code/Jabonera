import { notFound } from 'next/navigation'
import { getFullRecipeById } from '@/lib/data'
import { CosteoScreen } from './CosteoScreen'

// Server Component — fetches the recipe (skill: rsc-boundaries)
export default async function CosteoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const recipe = await getFullRecipeById(id)
  if (!recipe) notFound()

  return <CosteoScreen recipe={recipe} />
}

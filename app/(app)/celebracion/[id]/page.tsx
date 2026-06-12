import { notFound } from 'next/navigation'
import { getFullRecipeById } from '@/lib/data'
import { CelebracionScreen } from './CelebracionScreen'

// Server Component — fetches the recipe (skill: rsc-boundaries)
export default async function CelebracionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const recipe = await getFullRecipeById(id)
  if (!recipe) notFound()

  return <CelebracionScreen recipe={recipe} />
}

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getFullRecipeById } from '@/lib/data'
import { getRecipeProgress } from '@/lib/progress'
import { ProcesoScreen } from './ProcesoScreen'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const recipe = await getFullRecipeById(id)
  return { title: recipe ? `Haciendo ${recipe.name}` : 'Proceso' }
}

export default async function ProcesoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const recipe = await getFullRecipeById(id)
  if (!recipe) notFound()

  const progress = await getRecipeProgress(id)

  return <ProcesoScreen recipe={recipe} initialProgress={progress} />
}

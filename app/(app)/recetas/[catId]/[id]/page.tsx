import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getFullRecipeById } from '@/lib/data'
import { trackEvent } from '@/lib/analytics'
import { checkIsFavorite } from '@/lib/favorites'
import { RecipeDetailScreen } from './RecipeDetailScreen'

export async function generateMetadata({ params }: { params: Promise<{ catId: string; id: string }> }): Promise<Metadata> {
  const { id } = await params
  const recipe = await getFullRecipeById(id)
  return { title: recipe?.name ?? 'Receta' }
}

export default async function RecipeDetailPage({ params }: { params: Promise<{ catId: string; id: string }> }) {
  const { id } = await params
  const [recipe, isFavorite] = await Promise.all([
    getFullRecipeById(id),
    checkIsFavorite(id),
  ])
  if (!recipe) notFound()

  void trackEvent('recipe_viewed', { recipeId: recipe.id })

  return <RecipeDetailScreen recipe={recipe} initialFavorite={isFavorite} />
}

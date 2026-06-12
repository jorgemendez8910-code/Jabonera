import type { Metadata } from 'next'
import { getCategoriesWithCounts, getAllRecipesForSearch } from '@/lib/data'
import { RecetasIndexScreen } from './RecetasIndexScreen'

export const metadata: Metadata = { title: 'Recetas' }

export default async function RecetasIndexPage() {
  const [categories, allRecipes] = await Promise.all([
    getCategoriesWithCounts(),
    getAllRecipesForSearch(),
  ])
  return <RecetasIndexScreen categories={categories} allRecipes={allRecipes} />
}

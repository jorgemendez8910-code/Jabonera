import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getCategoryById, getRecipeStubsByCategory } from '@/lib/data'
import { RecetasListScreen } from './RecetasListScreen'

export async function generateMetadata({ params }: { params: Promise<{ catId: string }> }): Promise<Metadata> {
  const { catId } = await params
  const category = await getCategoryById(catId)
  return { title: category?.name ?? 'Recetas' }
}

export default async function RecetasListPage({ params }: { params: Promise<{ catId: string }> }) {
  const { catId } = await params
  const [category, recipes] = await Promise.all([
    getCategoryById(catId),
    getRecipeStubsByCategory(catId),
  ])

  if (!category) notFound()

  return <RecetasListScreen catId={catId} category={category} recipes={recipes} />
}

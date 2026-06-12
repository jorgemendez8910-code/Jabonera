'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface FavoriteRecipe {
  recipeId: string
  recipeName: string
  categoryId: string
  gradient: string
  imageUrl?: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: string
}

export async function toggleFavorite(recipeId: string): Promise<{ isFavorite: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { isFavorite: false, error: 'No autenticado' }

  const { data: existing } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)
    .maybeSingle()

  if (existing) {
    await supabase.from('user_favorites').delete().eq('id', existing.id)
    revalidatePath('/perfil/favoritas')
    return { isFavorite: false }
  }

  await supabase.from('user_favorites').insert({ user_id: user.id, recipe_id: recipeId })
  revalidatePath('/perfil/favoritas')
  return { isFavorite: true }
}

export async function checkIsFavorite(recipeId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)
    .maybeSingle()

  return !!data
}

export async function getFavoriteRecipes(): Promise<FavoriteRecipe[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: favs } = await supabase
    .from('user_favorites')
    .select('recipe_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!favs?.length) return []

  const recipeIds = favs.map(f => f.recipe_id as string)

  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, name, category_id, gradient, image_url, difficulty, estimated_time')
    .in('id', recipeIds)
    .eq('active', true)

  if (!recipes?.length) return []

  const recipeMap = new Map(recipes.map(r => [r.id as string, r]))

  return recipeIds
    .map(id => {
      const r = recipeMap.get(id)
      if (!r) return null
      return {
        recipeId: r.id as string,
        recipeName: r.name as string,
        categoryId: r.category_id as string,
        gradient: r.gradient as string,
        imageUrl: (r.image_url as string | null) ?? undefined,
        difficulty: r.difficulty as 'easy' | 'medium' | 'hard',
        estimatedTime: r.estimated_time as string,
      }
    })
    .filter((x): x is FavoriteRecipe => x !== null)
}

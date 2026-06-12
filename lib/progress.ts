'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// Server Actions for the "proceso" (guided steps) flow — replaces the
// jabonera_v1_proceso_${id} localStorage Set with recipe_progress +
// step_completions rows, scoped per (user_id, recipe_id).

export interface RecipeProgress {
  currentStep: number
  completedStepIds: string[]
  completed: boolean
}

export async function getRecipeProgress(recipeId: string): Promise<RecipeProgress> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { currentStep: 0, completedStepIds: [], completed: false }

  const [{ data: progress }, { data: completions }] = await Promise.all([
    supabase
      .from('recipe_progress')
      .select('current_step, completed')
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)
      .maybeSingle(),
    supabase
      .from('step_completions')
      .select('step_id')
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId),
  ])

  return {
    currentStep: progress?.current_step ?? 0,
    completedStepIds: (completions ?? []).map((c) => c.step_id),
    completed: progress?.completed ?? false,
  }
}

export async function startRecipeProgress(recipeId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('recipe_progress')
    .upsert(
      { user_id: user.id, recipe_id: recipeId, current_step: 0, completed: false },
      { onConflict: 'user_id,recipe_id', ignoreDuplicates: true }
    )
}

export async function confirmStep(recipeId: string, stepId: string, stepNumber: number): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await Promise.all([
    supabase
      .from('step_completions')
      .upsert(
        { user_id: user.id, recipe_id: recipeId, step_id: stepId },
        { onConflict: 'user_id,recipe_id,step_id', ignoreDuplicates: true }
      ),
    supabase
      .from('recipe_progress')
      .upsert(
        { user_id: user.id, recipe_id: recipeId, current_step: stepNumber, completed: false },
        { onConflict: 'user_id,recipe_id' }
      ),
  ])

  revalidatePath(`/proceso/${recipeId}`)
}

export async function completeRecipe(recipeId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('recipe_progress')
    .upsert(
      { user_id: user.id, recipe_id: recipeId, completed: true, completed_at: new Date().toISOString() },
      { onConflict: 'user_id,recipe_id' }
    )

  revalidatePath(`/proceso/${recipeId}`)
  revalidatePath(`/celebracion/${recipeId}`)
  revalidatePath('/dashboard')
}

import { createClient } from '@/lib/supabase/server'
import type {
  DbCategory,
  DbProfile,
  DbRecipe,
  DbRecipeIngredient,
  DbRecipeStep,
  DbRecipeWithDetails,
} from '@/types/database'
import type { Category, Ingredient, Recipe, RecipeStub, Step } from '@/lib/recipes'

// Server-Component-only data layer (skill: rsc-boundaries / data-patterns):
// queries Supabase and maps snake_case rows into the existing camelCase UI
// types from lib/recipes.ts, so the already-built screens need no changes.

function mapCategory(row: DbCategory, count: number): Category {
  return {
    id: row.id,
    emoji: row.emoji,
    name: row.name,
    color: row.color_var,
    tint: row.tint_var,
    count,
  }
}

export async function getCategoriesWithCounts(): Promise<Category[]> {
  const supabase = await createClient()
  const [{ data: cats }, { data: recipeRows }] = await Promise.all([
    supabase.from('categories').select('*').eq('active', true).order('sort_order'),
    supabase.from('recipes').select('category_id').eq('active', true),
  ])

  const counts = new Map<string, number>()
  for (const { category_id } of recipeRows ?? []) {
    counts.set(category_id, (counts.get(category_id) ?? 0) + 1)
  }

  return (cats ?? []).map((c) => mapCategory(c as DbCategory, counts.get(c.id) ?? 0))
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient()
  const [{ data: cat }, { count }] = await Promise.all([
    supabase.from('categories').select('*').eq('id', id).maybeSingle(),
    supabase.from('recipes').select('id', { count: 'exact', head: true }).eq('category_id', id).eq('active', true),
  ])

  if (!cat) return null
  return mapCategory(cat as DbCategory, count ?? 0)
}

function mapRecipeStub(row: DbRecipe & { recipe_steps?: { id: string }[] | null }): RecipeStub {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    difficulty: row.difficulty,
    estimatedTime: row.estimated_time,
    steps: row.steps_count ?? row.recipe_steps?.length ?? 0,
    gradient: row.gradient,
    imageUrl: row.image_url ?? undefined,
    full: !row.is_stub,
  }
}

export async function getAllRecipesForSearch(): Promise<RecipeStub[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('recipes')
    .select('*')
    .eq('active', true)
    .order('name')
  return (data ?? []).map(row => mapRecipeStub(row as DbRecipe))
}

export async function getRecipeStubsByCategory(catId: string): Promise<RecipeStub[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('recipes')
    .select('*, recipe_steps(id)')
    .eq('category_id', catId)
    .eq('active', true)
    .order('sort_order')

  return (data ?? []).map((row) => mapRecipeStub(row as DbRecipe & { recipe_steps: { id: string }[] }))
}

function mapIngredient(row: DbRecipeIngredient): Ingredient {
  return {
    id: row.ingredient_id,
    name: row.name,
    icon: row.icon,
    baseAmount: row.base_amount,
    unit: row.unit,
    costUnit: row.cost_unit,
    buyQty: row.buy_qty,
    buyUnit: row.buy_unit,
    notes: row.notes ?? undefined,
  }
}

function mapStep(row: DbRecipeStep): Step {
  return {
    id: row.step_id,
    stepNumber: row.step_number,
    title: row.title,
    icon: row.icon,
    instruction: row.instruction,
    ingredientsList: row.is_ingredient_list || undefined,
    ingredientsUsed: row.ingredient_ids?.length ? row.ingredient_ids : undefined,
    durationMinutes: row.duration_minutes ?? undefined,
    tip: row.tip ?? undefined,
    warning: row.warning ?? undefined,
  }
}

function mapRecipe(row: DbRecipeWithDetails): Recipe {
  return {
    id: row.id,
    name: row.name,
    category: row.category_id,
    description: row.description,
    difficulty: row.difficulty,
    estimatedTime: row.estimated_time,
    curatingTime: row.curating_time,
    baseUnits: row.base_units,
    benefits: row.benefits,
    gradient: row.gradient,
    imageUrl: row.image_url ?? undefined,
    ingredients: [...row.ingredients].sort((a, b) => a.sort_order - b.sort_order).map(mapIngredient),
    steps: [...row.steps].sort((a, b) => a.sort_order - b.sort_order).map(mapStep),
    tips: row.tips,
  }
}

export async function getUserProfile(): Promise<DbProfile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  return (data as DbProfile) ?? null
}

export async function getFullRecipeById(id: string): Promise<Recipe | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('recipes')
    .select('*, ingredients:recipe_ingredients(*), steps:recipe_steps(*)')
    .eq('id', id)
    .maybeSingle()

  if (!data) return null
  return mapRecipe(data as DbRecipeWithDetails)
}

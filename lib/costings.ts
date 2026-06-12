'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { DbCosting, DbCostingIngredient } from '@/types/database'

// Server Actions for the costings flow (skill: data-patterns) — replaces the
// localStorage-backed history/saveCosteo/deleteCosteo that used to live on
// StoreProvider. The UI-facing CosteoItem shape matches the old localStorage
// CosteoItem so historial/dashboard/perfil render unchanged.

export interface CosteoItem {
  id: string
  recipeId: string
  recipeName: string
  batchSize: number
  date: string
  totalBatchCost: number
  costPerUnit: number
  selectedMargin: number
  suggestedPrice: number
  gradient: string
  imageUrl?: string
  currency: string
}

export interface CosteoIngredientDetail {
  id: string
  name: string
  usedAmount: number
  usedUnit: string
  buyQty: number
  buyUnit: string
  pricePaid: number
  costCalculated: number
}

export interface CosteoDetail extends CosteoItem {
  profitPerUnit: number
  extraPackaging: number
  extraLabel: number
  extraLabor: number
  isCustom: boolean
  createdAt: string
  ingredients: CosteoIngredientDetail[]
}

export interface CosteoIngredientInput {
  ingredientId: string
  name: string
  usedAmount: number
  usedUnit: string
  buyQty: number
  buyUnit: string
  pricePaid: number
  costCalculated: number
}

export interface SaveCosteoInput {
  recipeId: string | null
  recipeName: string
  batchSize: number
  currency: string
  totalBatchCost: number
  costPerUnit: number
  selectedMargin: number
  suggestedPrice: number
  isCustom: boolean
  gradient: string | null
  imageUrl?: string
  extraPackaging?: number
  extraLabel?: number
  extraLabor?: number
  ingredients?: CosteoIngredientInput[]
}

const FALLBACK_GRADIENT = 'linear-gradient(135deg, #F4C4A0 0%, #E8C870 100%)'

function mapCosteo(row: DbCosting): CosteoItem {
  return {
    id: row.id,
    recipeId: row.recipe_id ?? 'custom',
    recipeName: row.recipe_name,
    batchSize: row.batch_size,
    date: new Date(row.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
    totalBatchCost: row.total_batch_cost,
    costPerUnit: row.cost_per_unit,
    selectedMargin: row.selected_margin,
    suggestedPrice: row.suggested_price,
    gradient: row.gradient ?? FALLBACK_GRADIENT,
    imageUrl: row.image_url ?? undefined,
    currency: row.currency,
  }
}

function revalidateCostingRoutes() {
  revalidatePath('/historial')
  revalidatePath('/dashboard')
  revalidatePath('/perfil')
}

export async function getUserCostings(): Promise<CosteoItem[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('costings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  return (data ?? []).map((row) => mapCosteo(row as DbCosting))
}

export async function saveCostingToSupabase(input: SaveCosteoInput): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Necesitas iniciar sesión para guardar un costeo' }

  const { data: costing, error } = await supabase
    .from('costings')
    .insert({
      user_id: user.id,
      recipe_id: input.recipeId,
      recipe_name: input.recipeName,
      batch_size: input.batchSize,
      currency: input.currency,
      total_batch_cost: input.totalBatchCost,
      cost_per_unit: input.costPerUnit,
      selected_margin: input.selectedMargin,
      suggested_price: input.suggestedPrice,
      profit_per_unit: input.suggestedPrice - input.costPerUnit,
      extra_packaging: input.extraPackaging ?? 0,
      extra_label: input.extraLabel ?? 0,
      extra_labor: input.extraLabor ?? 0,
      is_custom: input.isCustom,
      gradient: input.gradient,
      image_url: input.imageUrl ?? null,
    })
    .select('id')
    .single()

  if (error || !costing) {
    return { error: 'No pudimos guardar tu costeo. Inténtalo de nuevo.' }
  }

  if (input.ingredients?.length) {
    await supabase.from('costing_ingredients').insert(
      input.ingredients.map((ing) => ({
        costing_id: costing.id,
        ingredient_id: ing.ingredientId,
        name: ing.name,
        used_amount: ing.usedAmount,
        used_unit: ing.usedUnit,
        buy_qty: ing.buyQty,
        buy_unit: ing.buyUnit,
        price_paid: ing.pricePaid,
        cost_calculated: ing.costCalculated,
      }))
    )
  }

  revalidateCostingRoutes()
  return { id: costing.id }
}

export async function getCostingById(id: string): Promise<CosteoDetail | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: row }, { data: ingRows }] = await Promise.all([
    supabase.from('costings').select('*').eq('id', id).eq('user_id', user.id).maybeSingle(),
    supabase.from('costing_ingredients').select('*').eq('costing_id', id).order('name'),
  ])

  if (!row) return null

  const costing = row as DbCosting
  const base = mapCosteo(costing)

  return {
    ...base,
    profitPerUnit: costing.profit_per_unit,
    extraPackaging: costing.extra_packaging,
    extraLabel: costing.extra_label,
    extraLabor: costing.extra_labor,
    isCustom: costing.is_custom,
    createdAt: costing.created_at,
    ingredients: (ingRows ?? []).map((r) => {
      const ing = r as DbCostingIngredient
      return {
        id: ing.id,
        name: ing.name,
        usedAmount: ing.used_amount,
        usedUnit: ing.used_unit,
        buyQty: ing.buy_qty,
        buyUnit: ing.buy_unit,
        pricePaid: ing.price_paid,
        costCalculated: ing.cost_calculated,
      }
    }),
  }
}

export async function deleteCosting(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Necesitas iniciar sesión' }

  const { error } = await supabase
    .from('costings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: 'No pudimos eliminar este costeo.' }

  revalidateCostingRoutes()
  return {}
}

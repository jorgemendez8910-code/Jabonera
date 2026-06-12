// Raw row shapes from the Supabase schema (snake_case, as stored).
// lib/data.ts maps these into the camelCase UI types from lib/recipes.ts —
// screens never see these directly.

export interface DbCategory {
  id: string
  name: string
  emoji: string
  color_var: string
  tint_var: string
  sort_order: number
  active: boolean
}

export interface DbRecipe {
  id: string
  category_id: string
  name: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimated_time: string
  curating_time: string
  base_units: number
  benefits: string[]
  gradient: string
  image_url: string | null
  tips: string[]
  active: boolean
  is_stub: boolean
  sort_order: number
  // Present on stub rows that have no recipe_steps yet — the mapper falls
  // back to counting joined recipe_steps when this is null/absent.
  steps_count?: number | null
}

export interface DbRecipeIngredient {
  id: string
  recipe_id: string
  ingredient_id: string
  name: string
  icon: string
  base_amount: number
  unit: 'g' | 'ml' | 'drops' | 'tsp' | 'tbsp' | 'units'
  cost_unit: 'g' | 'ml'
  buy_qty: number
  buy_unit: string
  notes: string | null
  sort_order: number
}

export interface DbRecipeStep {
  id: string
  recipe_id: string
  step_id: string
  step_number: number
  title: string
  instruction: string
  icon: string
  tip: string | null
  warning: string | null
  duration_minutes: number | null
  ingredient_ids: string[]
  is_ingredient_list: boolean
  sort_order: number
}

export interface DbRecipeWithDetails extends DbRecipe {
  ingredients: DbRecipeIngredient[]
  steps: DbRecipeStep[]
}

export interface DbProfile {
  id: string
  email: string
  full_name: string | null
  access_status: 'active' | 'revoked' | 'suspended'
  currency_preference: string
  onboarding_step: number
  onboarding_completed: boolean
}

export interface DbCosting {
  id: string
  user_id: string
  recipe_id: string | null
  recipe_name: string
  batch_size: number
  currency: string
  total_batch_cost: number
  cost_per_unit: number
  selected_margin: number
  suggested_price: number
  profit_per_unit: number
  extra_packaging: number
  extra_label: number
  extra_labor: number
  is_custom: boolean
  gradient: string | null
  image_url: string | null
  created_at: string
}

export interface DbCostingIngredient {
  id: string
  costing_id: string
  ingredient_id: string
  name: string
  used_amount: number
  used_unit: string
  buy_qty: number
  buy_unit: string
  price_paid: number
  cost_calculated: number
}

/* ============================================================
   Jabonera — UI data shapes
   Canonical camelCase types every screen renders against.
   Real data comes from Supabase via lib/data.ts, which maps
   the raw DB rows (types/database.ts) into these shapes.
   ============================================================ */

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Category {
  id: string
  emoji: string
  name: string
  color: string
  tint: string
  count: number
}

export interface Ingredient {
  id: string
  name: string
  icon: string
  baseAmount: number
  unit: string
  costUnit: 'g' | 'ml'
  buyQty: number
  buyUnit: string
  notes?: string
}

export interface Step {
  id: string
  stepNumber: number
  title: string
  icon: string
  instruction: string
  ingredientsList?: boolean
  ingredientsUsed?: string[]
  durationMinutes?: number
  tip?: string
  warning?: string
}

export interface Recipe {
  id: string
  name: string
  category: string
  description: string
  difficulty: Difficulty
  estimatedTime: string
  curatingTime: string
  baseUnits: number
  benefits: string[]
  gradient: string
  imageUrl?: string       // Supabase Storage URL — undefined means use gradient
  ingredients: Ingredient[]
  steps: Step[]
  tips: string[]
}

export interface RecipeStub {
  id: string
  name: string
  categoryId: string
  difficulty: Difficulty
  estimatedTime: string
  steps: number
  gradient: string
  imageUrl?: string       // Supabase Storage URL — undefined means use gradient
  full: boolean
}

export const difficultyMeta: Record<Difficulty, { label: string; dot: string; dots: number }> = {
  easy:   { label: 'Fácil',    dot: 'var(--diff-easy)',   dots: 1 },
  medium: { label: 'Media',    dot: 'var(--diff-medium)', dots: 2 },
  hard:   { label: 'Avanzada', dot: 'var(--diff-hard)',   dots: 3 },
}

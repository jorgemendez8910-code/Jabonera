/* ============================================================
   Jabonera — Pricing utilities
   ============================================================ */

import type { Ingredient } from './recipes'

export interface Margin {
  key: number
  label: string
  dot: string
  hint: string
}

export const MARGINS: Margin[] = [
  { key: 40, label: 'Básico',      dot: 'var(--diff-medium)', hint: 'Precio de arranque, ideal para tus primeras ventas.' },
  { key: 60, label: 'Recomendado', dot: 'var(--color-clay)',  hint: 'El equilibrio entre competitivo y rentable.' },
  { key: 80, label: 'Premium',     dot: 'var(--diff-easy)',   hint: 'Para producto cuidado, empaque bonito y marca fuerte.' },
]

export interface Currency {
  code: string
  symbol: string
  name: string
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$',       name: 'Dólar EE.UU.' },
  { code: 'MXN', symbol: 'Mex$',   name: 'Peso mexicano' },
  { code: 'COP', symbol: 'Col$',   name: 'Peso colombiano' },
  { code: 'PEN', symbol: 'S/',     name: 'Sol peruano' },
  { code: 'ARS', symbol: 'Arg$',   name: 'Peso argentino' },
  { code: 'CLP', symbol: 'Chile$', name: 'Peso chileno' },
  { code: 'BRL', symbol: 'R$',     name: 'Real brasileño' },
  { code: 'GTQ', symbol: 'Q',      name: 'Quetzal' },
  { code: 'DOP', symbol: 'RD$',    name: 'Peso dominicano' },
  { code: 'CRC', symbol: '₡',      name: 'Colón costarricense' },
  { code: 'UYU', symbol: 'U$',     name: 'Peso uruguayo' },
  { code: 'EUR', symbol: '€',      name: 'Euro' },
  { code: 'GBP', symbol: '£',      name: 'Libra esterlina' },
]

export const UNIT_OPTIONS: Record<'g' | 'ml', { key: string; label: string; factor: number }[]> = {
  g:  [
    { key: 'g',  label: 'g',     factor: 1        },
    { key: 'kg', label: 'kg',    factor: 1000     },
    { key: 'oz', label: 'oz',    factor: 28.3495  },
    { key: 'lb', label: 'lb',    factor: 453.592  },
  ],
  ml: [
    { key: 'ml', label: 'ml',    factor: 1        },
    { key: 'l',  label: 'L',     factor: 1000     },
    { key: 'fl', label: 'fl oz', factor: 29.5735  },
  ],
}

export const ALL_UNITS = [
  { key: 'g',  label: 'g'     },
  { key: 'kg', label: 'kg'    },
  { key: 'oz', label: 'oz'    },
  { key: 'lb', label: 'lb'    },
  { key: 'ml', label: 'ml'    },
  { key: 'l',  label: 'L'     },
  { key: 'fl', label: 'fl oz' },
]

export function currencyByCode(code: string): Currency {
  return CURRENCIES.find(c => c.code === code) ?? CURRENCIES[0]
}

export function fmtMoney(n: number, code: string): string {
  const sym = currencyByCode(code).symbol
  return `${sym}${(n || 0).toFixed(2)}`
}

export function unitOptionsFor(costUnit: 'g' | 'ml') {
  return UNIT_OPTIONS[costUnit] ?? UNIT_OPTIONS.g
}

export function unitFactor(costUnit: 'g' | 'ml', key: string): number {
  return unitOptionsFor(costUnit).find(u => u.key === key)?.factor ?? 1
}

export function scaleAmount(baseAmount: number, baseUnits: number, batchSize: number): number {
  return (baseAmount / baseUnits) * batchSize
}

export function usedInCostUnit(ing: Ingredient, scaledAmount: number): number {
  if (ing.unit === 'drops') return scaledAmount / 20 // ~20 drops per ml
  return scaledAmount
}

export function ingredientCost(usedCostUnit: number, buyQty: number, paid: number): number {
  if (!buyQty || !paid) return 0
  return (usedCostUnit / buyQty) * paid
}

export function suggestedPrice(costPerUnit: number, margin: number): number {
  return costPerUnit * (1 + margin / 100)
}

export function fmtAmount(n: number): string {
  const r = Math.round(n * 10) / 10
  return Number.isInteger(r) ? String(r) : r.toFixed(1)
}

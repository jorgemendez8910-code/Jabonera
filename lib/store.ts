/* ============================================================
   Jabonera — Store types + localStorage helpers
   Schema versioned to v1 so future migrations are safe.

   `history`/saveCosteo/deleteCosteo moved to lib/costings.ts
   (server-fetched + Server Actions). `currency` is now seeded
   from the user's profile (lib/data.ts) and written through to
   Supabase (lib/profile.ts) — localStorage is just a fast cache
   while that profile loads. `batchSize` stays local-only.
   ============================================================ */

const V = 'v1'
export const KEYS = {
  currency: `jabonera_${V}_currency`,
  batch:    `jabonera_${V}_batch`,
} as const

export interface StoreState {
  currency: string
  batchSize: number
}

export interface StoreActions {
  setCurrency:  (c: string) => void
  setBatchSize: (n: number) => void
}

export type Store = StoreState & StoreActions

// — localStorage helpers (always parse safely) —

export function readCurrency(fallback: string): string {
  if (typeof window === 'undefined') return fallback
  return localStorage.getItem(KEYS.currency) ?? fallback
}

export function readBatch(): number {
  if (typeof window === 'undefined') return 8
  return parseInt(localStorage.getItem(KEYS.batch) ?? '8', 10) || 8
}

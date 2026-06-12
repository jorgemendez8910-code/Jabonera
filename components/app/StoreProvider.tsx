'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { type Store, KEYS, readCurrency, readBatch } from '@/lib/store'
import { updateCurrencyPreference } from '@/lib/profile'

// — Context with explicit interface (skill: state-context-interface) —
const StoreCtx = createContext<Store | null>(null)

export function StoreProvider({ children, initialCurrency }: { children: React.ReactNode; initialCurrency: string }) {
  // Lazy initializers: localStorage cache wins if present, else the
  // server-fetched profile value passed down as initialCurrency
  // (skill: rerender-lazy-state-init)
  const [currency,  setCurrencyState] = useState<string>(() => readCurrency(initialCurrency))
  const [batchSize, setBatchState]    = useState<number>(readBatch)

  const ls = typeof window !== 'undefined' ? localStorage : null

  const setCurrency = useCallback((c: string) => {
    setCurrencyState(c)
    ls?.setItem(KEYS.currency, c)
    void updateCurrencyPreference(c)
  }, [ls])

  const setBatchSize = useCallback((n: number) => {
    setBatchState(n)
    ls?.setItem(KEYS.batch, String(n))
  }, [ls])

  const store: Store = { currency, batchSize, setCurrency, setBatchSize }

  return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

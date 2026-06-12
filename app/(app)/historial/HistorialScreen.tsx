'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/app/BottomNav'
import { TopBar } from '@/components/app/TopBar'
import { JButton } from '@/components/app/JButton'
import { Icon } from '@/components/app/Icon'
import { RecipeImage } from '@/components/app/RecipeImage'
import { fmtMoney } from '@/lib/pricing'
import { deleteCosting } from '@/lib/costings'
import type { CosteoItem } from '@/lib/costings'

const UNDO_DELAY = 5000

export function HistorialScreen({ items: initialItems }: { items: CosteoItem[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [, startTransition] = useTransition()

  const [confirmId, setConfirmId]   = useState<string | null>(null)
  const [undoItem,  setUndoItem]    = useState<CosteoItem | null>(null)
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const confirmItem = confirmId ? items.find(h => h.id === confirmId) ?? null : null

  function requestDelete(id: string) {
    setConfirmId(id)
  }

  function cancelDelete() {
    setConfirmId(null)
  }

  function commitDelete(id: string) {
    const item = items.find(h => h.id === id)
    if (!item) return
    setConfirmId(null)
    setItems(prev => prev.filter(h => h.id !== id))

    if (undoTimer.current) clearTimeout(undoTimer.current)
    setUndoItem(item)

    undoTimer.current = setTimeout(() => {
      setUndoItem(null)
      startTransition(() => { void deleteCosting(id) })
    }, UNDO_DELAY)
  }

  function undoDelete() {
    if (!undoItem) return
    if (undoTimer.current) clearTimeout(undoTimer.current)
    setItems(prev => [undoItem, ...prev])
    setUndoItem(null)
  }

  return (
    <div className="app-root tex-noise">
      <TopBar />
      <div className="app-scroll pad-bot" style={{ padding: '100px 22px 96px' }}>
        <h1 className="screen-h1" style={{ fontSize: 28, marginBottom: 4 }}>Tus costeos</h1>
        <p className="screen-sub" style={{ marginBottom: 18 }}>{items.length} {items.length === 1 ? 'cálculo guardado' : 'cálculos guardados'}</p>

        {/* custom costeo CTA */}
        <button onClick={() => router.push('/costeo/custom')} className="j-card"
          style={{ width: '100%', border: 'none', textAlign: 'left', padding: 16, marginBottom: 18,
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'linear-gradient(120deg, var(--color-clay), var(--clay-700))', color: '#fff' }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,.18)', display: 'grid', placeItems: 'center' }}>
            <Icon name="plus" size={22} color="#fff" stroke={2.6} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15.5 }}>Costeo personalizado</div>
            <div style={{ fontSize: 12.5, opacity: .85 }}>Calcula con tus propios ingredientes y cantidades</div>
          </div>
          <Icon name="arrowR" size={20} color="#fff" />
        </button>

        {items.length === 0 ? (
          <div className="j-card" style={{ padding: 30, textAlign: 'center', marginTop: 14 }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🧮</div>
            <h3 style={{ fontSize: 19, marginBottom: 6 }}>Todavía no hay costeos</h3>
            <p className="screen-sub" style={{ fontSize: 14, marginBottom: 18 }}>Elige una receta o crea un costeo personalizado para empezar.</p>
            <JButton onClick={() => router.push('/recetas')} icon="book">Explorar recetas</JButton>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map(h => {
              const ccy = h.currency || 'USD'
              return (
                <div key={h.id} className="j-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={() => router.push(`/historial/${h.id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0,
                      background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0 }}>
                    <RecipeImage
                      src={h.imageUrl}
                      gradient={h.gradient || 'linear-gradient(135deg,var(--color-peach),var(--color-honey))'}
                      alt={h.recipeName}
                      variant="thumbnail"
                      style={{ width: 50, height: 50, borderRadius: 13, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.recipeName}</div>
                      <div className="screen-sub" style={{ fontSize: 12 }}>{h.date} · {h.batchSize} u · {ccy} · ganancia {h.selectedMargin}%</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--color-clay)', whiteSpace: 'nowrap' }}>{fmtMoney(h.suggestedPrice, ccy)}</div>
                      <div className="screen-sub" style={{ fontSize: 11.5, whiteSpace: 'nowrap' }}>cuesta {fmtMoney(h.costPerUnit, ccy)}</div>
                    </div>
                  </button>
                  <button onClick={() => requestDelete(h.id)} aria-label={`Eliminar costeo de ${h.recipeName}`} style={{ background: 'none', border: 'none', padding: 6, marginLeft: 2, flexShrink: 0 }}>
                    <Icon name="trash" size={18} color="var(--color-muted)" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <BottomNav />

      {/* ── Confirmation bottom sheet ── */}
      {confirmId && (
        <div
          onClick={cancelDelete}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            zIndex: 1000, padding: '0 16px 32px' }}>
          <div
            className="j-card pop-in"
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 460, padding: 22, borderRadius: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 17, textAlign: 'center', marginBottom: confirmItem ? 4 : 18 }}>
              ¿Eliminar este costeo?
            </div>
            {confirmItem && (
              <div className="screen-sub" style={{ textAlign: 'center', fontSize: 13.5, marginBottom: 20 }}>
                {confirmItem.recipeName}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={cancelDelete}
                style={{ flex: 1, padding: '13px 0', borderRadius: 14,
                  border: '1.5px solid rgba(74,55,40,.15)', background: '#fff',
                  fontWeight: 800, fontSize: 15, cursor: 'pointer', color: 'var(--color-bark)' }}>
                Cancelar
              </button>
              <button
                onClick={() => commitDelete(confirmId)}
                style={{ flex: 1, padding: '13px 0', borderRadius: 14,
                  border: 'none', background: 'var(--color-clay)', color: '#fff',
                  fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Undo toast ── */}
      {undoItem && (
        <div
          className="pop-in"
          style={{ position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--color-bark)', color: '#fff',
            padding: '12px 12px 12px 18px', borderRadius: 14,
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 8px 28px rgba(0,0,0,.22)', zIndex: 999,
            whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Costeo eliminado</span>
          <button
            onClick={undoDelete}
            style={{ background: 'rgba(255,255,255,.18)', border: 'none', color: '#fff',
              fontWeight: 800, fontSize: 14, padding: '7px 13px', borderRadius: 10, cursor: 'pointer' }}>
            Deshacer
          </button>
        </div>
      )}
    </div>
  )
}

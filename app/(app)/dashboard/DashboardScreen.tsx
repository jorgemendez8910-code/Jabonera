'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { BottomNav } from '@/components/app/BottomNav'
import { Icon } from '@/components/app/Icon'
import { RecipeImage } from '@/components/app/RecipeImage'
import { fmtMoney } from '@/lib/pricing'
import type { Category } from '@/lib/recipes'
import type { CosteoItem } from '@/lib/costings'

const SUBTITLES = ['¿Qué jabón hacemos hoy?', 'Tu taller te espera ✨', 'Hoy es buen día para crear', 'Manos a la obra, artesana']

// Extracted to avoid inline component (skill: rerender-no-inline-components)
function CosteoMiniCard({ item, onClick }: { item: CosteoItem; onClick: () => void }) {
  const ccy = item.currency || 'USD'
  return (
    <button onClick={onClick} className="j-card" style={{ width: '100%', border: 'none', textAlign: 'left',
      padding: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
      <RecipeImage
        src={item.imageUrl}
        gradient={item.gradient || 'var(--color-peach)'}
        alt={item.recipeName}
        variant="thumbnail"
        style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.recipeName}</div>
        <div className="screen-sub" style={{ fontSize: 12.5 }}>{item.date} · {item.batchSize} unidades</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--color-clay)' }}>{fmtMoney(item.suggestedPrice, ccy)}</div>
        <div className="screen-sub" style={{ fontSize: 11.5 }}>cuesta {fmtMoney(item.costPerUnit, ccy)}</div>
      </div>
    </button>
  )
}

interface DashboardScreenProps {
  displayName: string
  avatarInitial: string
  categories: Category[]
  recentCostings: CosteoItem[]
}

export function DashboardScreen({ displayName, avatarInitial, categories, recentCostings }: DashboardScreenProps) {
  const router = useRouter()
  const sub = useMemo(() => SUBTITLES[Math.floor(Math.random() * SUBTITLES.length)], [])
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <div className="app-root tex-noise">
      <div className="app-scroll pad-bot" style={{ padding: '0 0 96px' }}>
        {/* header */}
        <div style={{ padding: '62px 22px 8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="screen-sub" style={{ fontWeight: 800, marginBottom: 2 }}>{sub}</p>
            <h1 className="screen-h1" style={{ fontSize: 27 }}>Hola, <span style={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{displayName} <span style={{ fontFamily: 'var(--font-body)' }}>👋</span></span></h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="j-card"
                aria-label="Notificaciones"
                style={{ width: 42, height: 42, borderRadius: 14, border: 'none', display: 'grid', placeItems: 'center' }}>
                <Icon name="bell" size={21} color="var(--color-bark)" />
              </button>
              {notifOpen && (
                <div
                  className="pop-in"
                  style={{ position: 'absolute', top: 50, right: 0, width: 272,
                    background: '#fff', borderRadius: 18, boxShadow: '0 12px 36px rgba(74,55,40,.18)',
                    padding: '18px 18px 16px', zIndex: 100 }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 4 }}>Notificaciones</div>
                  <div style={{ width: '100%', height: 1, background: 'rgba(74,55,40,.08)', marginBottom: 14 }} />
                  <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                    <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 4 }}>Todo al día</div>
                    <div className="screen-sub" style={{ fontSize: 13, lineHeight: 1.5 }}>No tienes notificaciones nuevas</div>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => router.push('/perfil')} aria-label="Ir a mi perfil" className="j-card"
              style={{ width: 42, height: 42, borderRadius: 14, border: 'none', display: 'grid', placeItems: 'center', background: 'var(--color-peach)' }}>
              <span style={{ fontWeight: 800, color: 'var(--color-bark)' }}>{avatarInitial}</span>
            </button>
          </div>
          {notifOpen && (
            <div
              onClick={() => setNotifOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            />
          )}
        </div>

        {/* category grid */}
        <div style={{ padding: '18px 22px 0' }}>
          <h3 style={{ fontSize: 18, marginBottom: 14 }}>Tus categorías</h3>
          <div className="cat-grid">
            {categories.map((c, i) => (
              <button key={c.id} onClick={() => router.push(`/recetas/${c.id}`)}
                className="pop-in cat-card-sq"
                style={{ animationDelay: `${i * 60}ms`, border: 'none', textAlign: 'left',
                  borderRadius: 20, padding: '18px 16px', background: c.color, cursor: 'pointer',
                  boxShadow: 'var(--shadow-card)', minHeight: 120,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 34 }}>{c.emoji}</span>
                <span>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--color-bark)' }}>{c.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(74,55,40,.6)' }}>{c.count} recetas</div>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* últimos costeos */}
        <div style={{ padding: '26px 22px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 18 }}>Últimos costeos</h3>
            {recentCostings.length > 0 && (
              <button onClick={() => router.push('/historial')}
                style={{ background: 'none', border: 'none', color: 'var(--color-clay)', fontWeight: 800, fontSize: 14 }}>
                Ver todos →
              </button>
            )}
          </div>
          {recentCostings.length === 0 ? (
            <div className="j-card" style={{ padding: 22, textAlign: 'center' }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>💰</div>
              <p style={{ fontWeight: 700, margin: 0, fontSize: 15 }}>Aún no has calculado precios</p>
              <p className="screen-sub" style={{ fontSize: 13.5, marginTop: 4 }}>Elige una receta y descubre cuánto cobrar.</p>
            </div>
          ) : (
            recentCostings.map(h => <CosteoMiniCard key={h.id} item={h} onClick={() => router.push('/historial')} />)
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

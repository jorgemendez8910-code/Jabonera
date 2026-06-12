'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/components/app/StoreProvider'
import { TopBar } from '@/components/app/TopBar'
import { JButton } from '@/components/app/JButton'
import { Badge, DifficultyBadge } from '@/components/app/Badge'
import { Icon } from '@/components/app/Icon'
import { RecipeImage } from '@/components/app/RecipeImage'
import { trackEvent } from '@/lib/analytics'
import { toggleFavorite } from '@/lib/favorites'
import type { Recipe } from '@/lib/recipes'

const QUICK_QTYS = [4, 8, 12, 24]
const BATCH_MIN  = 1
const BATCH_MAX  = 48

function BatchSelector({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const atMin = value <= BATCH_MIN
  const atMax = value >= BATCH_MAX

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, marginBottom: atMax ? 10 : 18 }}>
        <button
          onClick={() => onChange(Math.max(BATCH_MIN, value - 1))}
          aria-label="menos"
          disabled={atMin}
          className="j-card"
          style={{ width: 60, height: 60, borderRadius: 20, border: 'none', display: 'grid', placeItems: 'center', background: '#fff',
            opacity: atMin ? 0.4 : 1, cursor: atMin ? 'not-allowed' : 'pointer' }}>
          <Icon name="minus" size={26} color="var(--color-clay)" stroke={2.6} />
        </button>
        <div style={{ textAlign: 'center', minWidth: 96 }}>
          <div key={value} className="num-tick" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 58, lineHeight: 1, color: 'var(--color-bark)' }}>{value}</div>
          <div className="screen-sub" style={{ fontSize: 13, fontWeight: 800, marginTop: 2 }}>jabones</div>
        </div>
        <button
          onClick={() => onChange(Math.min(BATCH_MAX, value + 1))}
          aria-label="más"
          disabled={atMax}
          className="j-card"
          style={{ width: 60, height: 60, borderRadius: 20, border: 'none', display: 'grid', placeItems: 'center', background: 'var(--color-clay)',
            opacity: atMax ? 0.4 : 1, cursor: atMax ? 'not-allowed' : 'pointer' }}>
          <Icon name="plus" size={26} color="#fff" stroke={2.6} />
        </button>
      </div>
      {atMax && (
        <p className="screen-sub" style={{ textAlign: 'center', fontSize: 12.5, marginBottom: 10, color: 'var(--color-clay)', fontWeight: 800 }}>
          Máximo {BATCH_MAX} jabones
        </p>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        {QUICK_QTYS.map(q => {
          const active = value === q
          return (
            <button key={q} onClick={() => onChange(q)}
              style={{ flex: 1, maxWidth: 70, height: 48, borderRadius: 14, fontWeight: 800, fontSize: 17,
                border: active ? 'none' : '1.5px solid rgba(74,55,40,.14)',
                background: active ? 'var(--color-bark)' : '#fff', color: active ? '#fff' : 'var(--color-bark)',
                cursor: 'pointer' }}>
              {q}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function RecipeDetailScreen({ recipe, initialFavorite }: { recipe: Recipe; initialFavorite: boolean }) {
  const router = useRouter()
  const store  = useStore()

  const [batch, setBatch]   = useState(store.batchSize || recipe.baseUnits || 8)
  const [fav,   setFav]     = useState(initialFavorite)
  const [favBusy, setFavBusy] = useState(false)

  const start = () => {
    store.setBatchSize(batch)
    if (batch !== recipe.baseUnits) trackEvent('batch_size_changed', { recipeId: recipe.id, batchSize: batch })
    router.push(`/proceso/${recipe.id}`)
  }

  const handleFav = async () => {
    if (favBusy) return
    setFav(f => !f)
    setFavBusy(true)
    const result = await toggleFavorite(recipe.id)
    setFav(result.isFavorite)
    setFavBusy(false)
  }

  return (
    <div className="app-root">
      <TopBar right={
        <button
          onClick={handleFav}
          aria-label={fav ? 'Quitar de favoritas' : 'Guardar en favoritas'}
          className="j-card"
          style={{ width: 42, height: 42, borderRadius: 14, border: 'none', display: 'grid', placeItems: 'center',
            opacity: favBusy ? 0.6 : 1, transition: 'opacity .15s' }}>
          <Icon
            name="heart"
            size={20}
            color="var(--color-clay)"
            fill={fav ? 'var(--color-clay)' : 'none'}
          />
        </button>
      } />
      <div className="app-scroll pad-bot" style={{ padding: 0 }}>
        {/* hero */}
        <RecipeImage
          src={recipe.imageUrl}
          gradient={recipe.gradient}
          alt={recipe.name}
          variant="hero"
          style={{ height: 240, display: 'grid', placeItems: 'center' }}
        >
          {/* Show emoji only when there's no photo — the photo speaks for itself */}
          {!recipe.imageUrl && (
            <span style={{ fontSize: 70, filter: 'drop-shadow(0 6px 14px rgba(74,55,40,.25))', position: 'relative', zIndex: 1 }}>🧼</span>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg, rgba(255,255,255,.05) 0 14px, transparent 14px 28px)' }} />
        </RecipeImage>
        <div className="tex-noise" style={{ background: 'var(--color-cream)', borderRadius: '26px 26px 0 0', marginTop: -26, position: 'relative', padding: '24px 22px 120px' }}>
          <div className="proc-body">
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <Badge bg="var(--clay-100)" color="var(--clay-700)" dot="var(--color-clay)">{recipe.category}</Badge>
            <DifficultyBadge difficulty={recipe.difficulty} />
          </div>
          <h1 className="screen-h1" style={{ fontSize: 28, marginBottom: 10 }}>{recipe.name}</h1>
          <p style={{ color: 'var(--color-bark)', opacity: .82, fontSize: 15, lineHeight: 1.5, margin: 0 }}>{recipe.description}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, color: 'var(--color-muted)', fontSize: 13.5, fontWeight: 700 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="clock" size={16} /> {recipe.estimatedTime}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="layers" size={16} /> {recipe.steps.length} pasos</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
            {recipe.benefits.map(b => (
              <span key={b} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff',
                padding: '8px 12px', borderRadius: 99, fontSize: 13, fontWeight: 700, boxShadow: 'var(--shadow-card)' }}>
                <Icon name="check" size={14} color="var(--diff-easy)" stroke={3} /> {b}
              </span>
            ))}
          </div>
          <div className="j-card" style={{ padding: '22px 20px', marginTop: 26 }}>
            <h3 style={{ fontSize: 19, textAlign: 'center', marginBottom: 4 }}>¿Cuántos jabones quieres hacer?</h3>
            <p className="screen-sub" style={{ textAlign: 'center', fontSize: 13.5, marginBottom: 20 }}>Los ingredientes se ajustan al instante.</p>
            <BatchSelector value={batch} onChange={setBatch} />
            <p className="screen-sub" style={{ textAlign: 'center', fontSize: 12.5, marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icon name="layers" size={15} color="var(--color-muted)" /> Verás la lista de ingredientes al empezar el proceso
            </p>
          </div>
          </div>{/* proc-body */}
        </div>
      </div>
      <div className="proc-cta">
        <JButton block onClick={start} iconRight="arrowR">Empezar el proceso</JButton>
      </div>
    </div>
  )
}

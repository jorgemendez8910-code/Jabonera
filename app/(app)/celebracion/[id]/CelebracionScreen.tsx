'use client'

import { useRouter } from 'next/navigation'
import { useStore } from '@/components/app/StoreProvider'
import { JButton } from '@/components/app/JButton'
import { Bubbles } from '@/components/app/Bubbles'
import { Icon } from '@/components/app/Icon'
import { RecipeImage } from '@/components/app/RecipeImage'
import type { Recipe } from '@/lib/recipes'

export function CelebracionScreen({ recipe }: { recipe: Recipe }) {
  const router = useRouter()
  const store  = useStore()
  const batch  = store.batchSize || recipe.baseUnits || 8

  return (
    <div className="app-root" style={{ background: 'linear-gradient(180deg, var(--color-cream), var(--blush-50))' }}>
      <Bubbles count={20} />
      <div className="app-scroll" style={{ padding: '0 26px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100%' }}>
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div className="task-center-inner">
          <div
            className="pop-in"
            style={{ width: 110, height: 110, borderRadius: '50%', margin: '0 auto 22px',
              background: 'radial-gradient(circle at 35% 30%, #fff, var(--color-honey))',
              boxShadow: '0 16px 40px rgba(232,200,112,.4)', display: 'grid', placeItems: 'center', fontSize: 56 }}
          >
            🎉
          </div>
          <h1 className="screen-h1" style={{ fontSize: 32, marginBottom: 10 }}>¡Lo lograste!</h1>
          <p style={{ fontSize: 16, color: 'var(--color-bark)', opacity: .82, lineHeight: 1.5, margin: '0 auto', maxWidth: 280 }}>
            Tu jabón está en proceso de curado. La paciencia es parte del arte.
          </p>
          <div className="j-card pop-in" style={{ padding: 18, marginTop: 26, textAlign: 'left', animationDelay: '.1s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <RecipeImage
                src={recipe.imageUrl}
                gradient={recipe.gradient}
                alt={recipe.name}
                variant="thumbnail"
                style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0 }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}>{recipe.name}</div>
                <div className="screen-sub" style={{ fontSize: 13 }}>{batch} jabones hechos</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--lavender-50)', padding: '12px 14px', borderRadius: 12 }}>
              <Icon name="clock" size={18} color="var(--color-bark)" />
              <span style={{ fontSize: 14, fontWeight: 700 }}>Curado estimado: <b>{recipe.curatingTime}</b></span>
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <JButton block onClick={() => router.push(`/costeo/${recipe.id}`)} iconRight="arrowR">Calcular mi precio de venta</JButton>
            <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', marginTop: 14, color: 'var(--color-muted)', fontWeight: 800, fontSize: 14.5 }}>
              Volver al inicio
            </button>
          </div>
        </div>{/* task-center-inner */}
        </div>
      </div>
    </div>
  )
}

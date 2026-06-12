'use client'

import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/app/TopBar'
import { DifficultyBadge } from '@/components/app/Badge'
import { Icon } from '@/components/app/Icon'
import { RecipeImage } from '@/components/app/RecipeImage'
import type { Category, RecipeStub } from '@/lib/recipes'

interface RecetasListScreenProps {
  catId: string
  category: Category
  recipes: RecipeStub[]
}

export function RecetasListScreen({ catId, category, recipes }: RecetasListScreenProps) {
  const router = useRouter()

  return (
    <div className="app-root tex-noise">
      <TopBar />
      <div className="app-scroll pad-bot" style={{ padding: '108px 22px 96px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: category.color, display: 'grid', placeItems: 'center', fontSize: 30 }}>{category.emoji}</div>
          <div>
            <h1 className="screen-h1" style={{ fontSize: 27 }}>{category.name}</h1>
            <p className="screen-sub" style={{ fontSize: 14 }}>{category.count} recetas disponibles</p>
          </div>
        </div>

        <div className="recipe-grid" style={{ marginTop: 20 }}>
          {recipes.map((r, i) => (
            <button key={r.id}
              onClick={() => r.full ? router.push(`/recetas/${catId}/${r.id}`) : undefined}
              className="pop-in j-card"
              style={{ animationDelay: `${i * 90}ms`, border: 'none', textAlign: 'left',
                padding: 0, overflow: 'hidden', cursor: r.full ? 'pointer' : 'default', opacity: r.full ? 1 : .62,
                display: 'flex', flexDirection: 'column' }}>
              <RecipeImage
                src={r.imageUrl}
                gradient={r.gradient}
                alt={r.name}
                className="recipe-card-img"
                style={{ height: 96 }}
              >
                {!r.full && (
                  <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, fontWeight: 800,
                    background: 'rgba(255,255,255,.85)', padding: '4px 8px', borderRadius: 99, color: 'var(--color-muted)', zIndex: 1 }}>
                    Pronto
                  </span>
                )}
              </RecipeImage>
              <div style={{ padding: '12px 13px 14px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, lineHeight: 1.15, marginBottom: 8 }}>{r.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <DifficultyBadge difficulty={r.difficulty} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, color: 'var(--color-muted)', fontSize: 12, fontWeight: 700 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="clock" size={14} /> {r.estimatedTime}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="layers" size={14} /> {r.steps}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

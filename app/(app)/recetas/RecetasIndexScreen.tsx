'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/app/BottomNav'
import { RecipeImage } from '@/components/app/RecipeImage'
import { DifficultyBadge } from '@/components/app/Badge'
import { Icon } from '@/components/app/Icon'
import type { Category, RecipeStub } from '@/lib/recipes'

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

export function RecetasIndexScreen({ categories, allRecipes }: {
  categories: Category[]
  allRecipes: RecipeStub[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const results = q ? allRecipes.filter(r => r.name.toLowerCase().includes(q)) : []

  return (
    <div className="app-root tex-noise">
      <div className="app-scroll pad-bot" style={{ padding: '62px 22px 96px' }}>
        <h1 className="screen-h1" style={{ fontSize: 30, marginBottom: 4 }}>Recetas</h1>
        <p className="screen-sub" style={{ marginBottom: 18 }}>
          {q ? `${results.length} resultado${results.length !== 1 ? 's' : ''}` : 'Elige una categoría para empezar.'}
        </p>

        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: 22 }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-muted)', display: 'grid', placeItems: 'center', pointerEvents: 'none',
          }}>
            <SearchIcon />
          </span>
          <input
            className="j-input"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar receta..."
            style={{ paddingLeft: 42 }}
          />
        </div>

        {q ? (
          results.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {results.map(r => (
                <button
                  key={r.id}
                  onClick={() => router.push(`/recetas/${r.categoryId}/${r.id}`)}
                  className="j-card"
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14,
                    border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%' }}>
                  <RecipeImage
                    src={r.imageUrl}
                    gradient={r.gradient}
                    alt={r.name}
                    variant="thumbnail"
                    style={{ width: 50, height: 50, borderRadius: 13, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <DifficultyBadge difficulty={r.difficulty} />
                      <span className="screen-sub" style={{ fontSize: 12 }}>{r.estimatedTime}</span>
                    </div>
                  </div>
                  <Icon name="arrowR" size={18} color="var(--color-muted)" />
                </button>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '56px 0' }}>
              <div style={{ fontSize: 42, marginBottom: 14 }}>🧼</div>
              <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-bark)', marginBottom: 6 }}>
                No encontramos recetas para "{query}"
              </p>
              <p className="screen-sub" style={{ fontSize: 13.5 }}>Prueba con otro nombre</p>
            </div>
          )
        ) : (
          <div className="cat-grid">
            {categories.map((c, i) => (
              <button key={c.id} onClick={() => router.push(`/recetas/${c.id}`)}
                className="pop-in cat-card-sq"
                style={{
                  animationDelay: `${i * 50}ms`, border: 'none', textAlign: 'left',
                  borderRadius: 20, padding: '18px 16px',
                  background: c.color, boxShadow: 'var(--shadow-card)', cursor: 'pointer',
                  minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                }}>
                <span style={{ fontSize: 34 }}>{c.emoji}</span>
                <span>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--color-bark)', lineHeight: 1.2 }}>{c.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(74,55,40,.6)', marginTop: 3 }}>{c.count} recetas</div>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}

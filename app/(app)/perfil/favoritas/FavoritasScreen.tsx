'use client'

import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/app/TopBar'
import { JButton } from '@/components/app/JButton'
import { Icon } from '@/components/app/Icon'
import { RecipeImage } from '@/components/app/RecipeImage'
import { DifficultyBadge } from '@/components/app/Badge'
import { BottomNav } from '@/components/app/BottomNav'
import type { FavoriteRecipe } from '@/lib/favorites'

export function FavoritasScreen({ recipes }: { recipes: FavoriteRecipe[] }) {
  const router = useRouter()

  return (
    <div className="app-root tex-noise">
      <TopBar title="Recetas favoritas" />
      <div className="app-scroll pad-bot" style={{ padding: '100px 22px 96px' }}>
        <p className="screen-sub" style={{ marginBottom: 18 }}>
          {recipes.length === 0
            ? 'Todavía no tienes favoritas'
            : `${recipes.length} ${recipes.length === 1 ? 'receta guardada' : 'recetas guardadas'}`}
        </p>

        {recipes.length === 0 ? (
          <div className="j-card" style={{ padding: 30, textAlign: 'center', marginTop: 14 }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🤍</div>
            <h3 style={{ fontSize: 19, marginBottom: 6 }}>Nada por aquí aún</h3>
            <p className="screen-sub" style={{ fontSize: 14, marginBottom: 18 }}>
              Toca el corazón en cualquier receta para guardarla aquí.
            </p>
            <JButton onClick={() => router.push('/recetas')} icon="book">Explorar recetas</JButton>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recipes.map(r => (
              <button
                key={r.recipeId}
                onClick={() => router.push(`/recetas/${r.categoryId}/${r.recipeId}`)}
                className="j-card"
                style={{ width: '100%', border: 'none', textAlign: 'left', padding: 14,
                  display: 'flex', alignItems: 'center', gap: 12 }}>
                <RecipeImage
                  src={r.imageUrl}
                  gradient={r.gradient}
                  alt={r.recipeName}
                  variant="thumbnail"
                  style={{ width: 56, height: 56, borderRadius: 14, flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 5 }}>
                    {r.recipeName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <DifficultyBadge difficulty={r.difficulty} />
                    <span className="screen-sub" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="clock" size={13} color="var(--color-muted)" />
                      {r.estimatedTime}
                    </span>
                  </div>
                </div>
                <Icon name="arrowR" size={18} color="var(--color-muted)" />
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}

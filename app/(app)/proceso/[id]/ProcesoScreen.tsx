'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/components/app/StoreProvider'
import { JButton } from '@/components/app/JButton'
import { ProgressBar } from '@/components/app/ProgressBar'
import { Icon } from '@/components/app/Icon'
import { scaleAmount, fmtAmount } from '@/lib/pricing'
import { startRecipeProgress, confirmStep, completeRecipe, type RecipeProgress } from '@/lib/progress'
import { trackEvent } from '@/lib/analytics'
import type { Recipe } from '@/lib/recipes'

interface ProcesoScreenProps {
  recipe: Recipe
  initialProgress: RecipeProgress
}

export function ProcesoScreen({ recipe, initialProgress }: ProcesoScreenProps) {
  const router = useRouter()
  const store  = useStore()
  const batch  = store.batchSize || recipe.baseUnits || 8

  const steps     = recipe.steps
  const scrollRef = useRef<HTMLDivElement>(null)
  const [idx,       setIdx]      = useState(() => Math.min(initialProgress.currentStep, steps.length - 1))
  const [done,      setDone]     = useState<Set<string>>(() => new Set(initialProgress.completedStepIds))
  const [dir,       setDir]      = useState(1)
  const [showFade,  setShowFade] = useState(false)

  // Mark the recipe as started server-side, once (skill: rsc-boundaries — Server Actions mutate)
  useEffect(() => {
    void startRecipeProgress(recipe.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const step   = steps[idx]
  const isDone = done.has(step.id)

  // Scroll-fade: show gradient when content overflows; hide when user reaches the bottom
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    el.scrollTo(0, 0)

    const check = () => {
      const overflows = el.scrollHeight > el.clientHeight
      const atBottom  = el.scrollTop + el.clientHeight >= el.scrollHeight - 24
      setShowFade(overflows && !atBottom)
    }

    check()
    el.addEventListener('scroll', check, { passive: true })
    const ro = new ResizeObserver(check)
    ro.observe(el)

    return () => {
      el.removeEventListener('scroll', check)
      ro.disconnect()
    }
  }, [step.id])
  const isLast = idx === steps.length - 1
  const pct    = ((idx + (isDone ? 1 : 0)) / steps.length) * 100

  const confirm = () => {
    setDone(prev => new Set([...prev, step.id]))
    void confirmStep(recipe.id, step.id, step.stepNumber)
    void trackEvent('step_confirmed', { recipeId: recipe.id, stepId: step.id, stepNumber: step.stepNumber })
  }

  const goNext = () => {
    if (isLast) {
      void completeRecipe(recipe.id)
      router.push(`/celebracion/${recipe.id}`)
      return
    }
    setDir(1); setIdx(i => i + 1)
  }

  const goPrev = () => {
    if (idx === 0) { router.back(); return }
    setDir(-1); setIdx(i => i - 1)
  }

  const usedIngredients = (step.ingredientsUsed ?? []).flatMap(ingId => {
    const ing = recipe.ingredients.find(x => x.id === ingId)
    if (!ing) return []
    return [{ ...ing, amt: scaleAmount(ing.baseAmount, recipe.baseUnits, batch) }]
  })

  return (
    <div className="app-root" style={{ background: 'var(--color-cream)' }}>
      {/* progress header */}
      <div className="proc-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <button onClick={goPrev} aria-label="Volver" className="j-card" style={{ width: 38, height: 38, borderRadius: 12, border: 'none', display: 'grid', placeItems: 'center' }}>
            <Icon name="arrowL" size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 800, color: 'var(--color-muted)', marginBottom: 6 }}>
              <span>Paso {idx + 1} de {steps.length}</span>
              <span>{recipe.name}</span>
            </div>
            <ProgressBar value={pct} />
          </div>
        </div>
      </div>

      {/* step body */}
      <div ref={scrollRef} className="app-scroll" style={{ padding: '128px 22px 150px' }}>
        <div className="proc-body">
        <div key={step.id} style={{ animation: `${dir > 0 ? 'jFadeSlide' : 'jFadeSlideBack'} .34s cubic-bezier(.22,1,.36,1) both` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 64, lineHeight: 1, color: 'var(--color-clay)', opacity: .9 }}>
              {String(step.stepNumber).padStart(2, '0')}
            </span>
            <div style={{ width: 76, height: 76, borderRadius: 24, background: '#fff', boxShadow: 'var(--shadow-card)', display: 'grid', placeItems: 'center', fontSize: 38 }}>{step.icon}</div>
          </div>
          <h1 className="screen-h1" style={{ fontSize: 27, lineHeight: 1.18, margin: '14px 0 16px' }}>{step.title}</h1>
          <p style={{ fontSize: 16.5, lineHeight: 1.55, color: 'var(--color-bark)', opacity: .9, margin: 0 }}>{step.instruction}</p>

          {/* full ingredient list (gather step) */}
          {step.ingredientsList && (
            <div style={{ marginTop: 18, background: '#fff', borderRadius: 16, padding: '6px 4px', boxShadow: 'var(--shadow-card)' }}>
              {recipe.ingredients.map((ing, i) => {
                const amt = scaleAmount(ing.baseAmount, recipe.baseUnits, batch)
                return (
                  <div key={ing.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
                    borderBottom: i < recipe.ingredients.length - 1 ? '1px solid rgba(74,55,40,.06)' : 'none' }}>
                    <span style={{ fontSize: 22, width: 28, textAlign: 'center', flexShrink: 0 }}>{ing.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{ing.name}</div>
                      {ing.notes && <div className="screen-sub" style={{ fontSize: 12 }}>{ing.notes}</div>}
                    </div>
                    <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--color-clay)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {fmtAmount(amt)} <span style={{ fontSize: 12.5, color: 'var(--color-muted)', fontWeight: 700 }}>{ing.unit === 'drops' ? 'gotas' : ing.unit}</span>
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* step-specific ingredients */}
          {usedIngredients.length > 0 && (
            <div style={{ marginTop: 16, background: '#fff', borderRadius: 16, padding: '6px 4px', boxShadow: 'var(--shadow-card)' }}>
              {usedIngredients.map((ing, i) => (
                <div key={ing.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  borderBottom: i < usedIngredients.length - 1 ? '1px solid rgba(74,55,40,.06)' : 'none' }}>
                  <span style={{ fontSize: 20, width: 26, textAlign: 'center', flexShrink: 0 }}>{ing.icon}</span>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 14.5 }}>{ing.name}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--color-bark)', color: '#fff',
                    padding: '6px 12px', borderRadius: 99, fontWeight: 900, fontSize: 14.5, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {fmtAmount(ing.amt)} {ing.unit === 'drops' ? 'gotas' : ing.unit}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* instructor tip */}
          {step.tip && (
            <div style={{ marginTop: 18, background: 'var(--lavender-50)', border: '1px solid rgba(216,208,232,.7)', borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12 }}>
              <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 10, background: 'var(--color-lavender)', display: 'grid', placeItems: 'center' }}>
                <Icon name="bulb" size={19} color="var(--color-bark)" />
              </span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 2 }}>Tip de la instructora</div>
                <div style={{ fontSize: 14.5, fontStyle: 'italic', lineHeight: 1.45, color: 'var(--color-bark)', opacity: .88 }}>{step.tip}</div>
              </div>
            </div>
          )}

          {/* warning */}
          {step.warning && (
            <div style={{ marginTop: 12, background: 'var(--blush-50)', border: '1px solid rgba(242,196,196,.8)', borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12 }}>
              <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 10, background: 'var(--color-blush)', display: 'grid', placeItems: 'center' }}>
                <Icon name="warn" size={19} color="var(--diff-hard)" />
              </span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 2, color: 'var(--diff-hard)' }}>Cuidado</div>
                <div style={{ fontSize: 14.5, lineHeight: 1.45, color: 'var(--color-bark)', opacity: .9 }}>{step.warning}</div>
              </div>
            </div>
          )}
        </div>
        </div>{/* proc-body */}
      </div>

      {/* scroll-overflow fade */}
      {showFade && (
        <div
          aria-hidden="true"
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 160,
            background: 'linear-gradient(transparent, var(--color-cream))',
            pointerEvents: 'none', zIndex: 20 }}
        />
      )}

      {/* bottom CTA — proc-cta is z-index: 25 in CSS, stays above the fade */}
      <div className="proc-cta">
        {!isDone ? (
          <button onClick={confirm} className="j-btn j-btn-block"
            style={{ background: '#fff', color: 'var(--color-bark)', border: '2px solid rgba(74,55,40,.12)', boxShadow: 'var(--shadow-card)' }}>
            <span style={{ width: 24, height: 24, borderRadius: 8, border: '2px solid var(--color-muted)', display: 'inline-grid', placeItems: 'center' }} />
            Ya lo hice
          </button>
        ) : (
          <JButton block onClick={goNext} iconRight={isLast ? undefined : 'arrowR'}>
            {isLast ? '¡Terminé mi jabón! 🎉' : 'Siguiente paso'}
          </JButton>
        )}
        {isDone && !isLast && (
          <div style={{ textAlign: 'center', marginTop: 10, fontSize: 13, fontWeight: 800, color: 'var(--diff-easy)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Icon name="check" size={16} color="var(--diff-easy)" stroke={3} /> Paso completado
          </div>
        )}
      </div>
    </div>
  )
}

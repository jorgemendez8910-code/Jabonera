import { difficultyMeta } from '@/lib/recipes'
import type { Difficulty } from '@/lib/recipes'

interface BadgeProps {
  children: React.ReactNode
  bg?: string
  color?: string
  dot?: string
  style?: React.CSSProperties
}

export function Badge({ children, bg, color, dot, style }: BadgeProps) {
  return (
    <span className="j-badge" style={{ background: bg, color, ...style }}>
      {dot && <span className="j-dot" style={{ background: dot }} />}
      {children}
    </span>
  )
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const m = difficultyMeta[difficulty]
  return (
    <span className="j-badge" style={{ background: '#fff', color: 'var(--color-bark)', boxShadow: 'var(--shadow-card)' }}>
      <span style={{ display: 'inline-flex', gap: 3 }}>
        {[0, 1, 2].map(i => (
          <span key={i} className="j-dot" style={{ width: 7, height: 7, background: i < m.dots ? m.dot : 'rgba(74,55,40,.15)' }} />
        ))}
      </span>
      {m.label}
    </span>
  )
}

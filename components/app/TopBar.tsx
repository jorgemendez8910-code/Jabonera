'use client'

import { useRouter } from 'next/navigation'
import { Icon } from './Icon'

interface TopBarProps {
  title?: string
  right?: React.ReactNode
}

export function TopBar({ title, right }: TopBarProps) {
  const router = useRouter()
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '52px 18px 10px',
      background: 'linear-gradient(var(--color-cream) 60%, transparent)',
    }}>
      <button
        onClick={() => router.back()}
        aria-label="Volver"
        className="j-card"
        style={{ width: 42, height: 42, borderRadius: 14, border: 'none', display: 'grid', placeItems: 'center' }}
      >
        <Icon name="arrowL" size={22} color="var(--color-bark)" />
      </button>
      {title
        ? <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>{title}</span>
        : <span style={{ width: 42 }} />
      }
      {right ?? <span style={{ width: 42 }} />}
    </div>
  )
}

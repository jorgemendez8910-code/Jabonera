'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Icon } from './Icon'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Inicio',  icon: 'home',  href: '/dashboard' },
  { key: 'recetas',   label: 'Recetas', icon: 'book',  href: '/recetas' },
  { key: 'costeos',   label: 'Costeos', icon: 'calc',  href: '/historial' },
  { key: 'perfil',    label: 'Perfil',  icon: 'user',  href: '/perfil' },
] as const

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  const activeKey = pathname.startsWith('/recetas')   ? 'recetas'
    : pathname.startsWith('/historial') || pathname.startsWith('/costeo') ? 'costeos'
    : pathname.startsWith('/perfil')    ? 'perfil'
    : 'dashboard'

  return (
    <nav className="j-bottomnav">
      {/* Brand mark — visible only in the desktop sidebar via CSS */}
      <div className="nav-brand">
        <span style={{ fontSize: 24 }}>🧼</span>
        <span>Jabonera</span>
      </div>

      {NAV_ITEMS.map(it => {
        const active = it.key === activeKey
        return (
          <button
            key={it.key}
            className={`j-navitem${active ? ' active' : ''}`}
            onClick={() => router.push(it.href)}
          >
            <Icon name={it.icon} size={24} stroke={active ? 2.4 : 2} fill={active ? 'rgba(196,132,108,.14)' : 'none'} />
            <span>{it.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

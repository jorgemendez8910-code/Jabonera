'use client'

import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/app/BottomNav'
import { Icon } from '@/components/app/Icon'
import { createClient } from '@/lib/supabase/client'

const MENU_ROWS = [
  { icon: 'user',  label: 'Mi cuenta',            href: '/perfil/cuenta' },
  { icon: 'calc',  label: 'Historial de costeos', href: '/historial' },
  { icon: 'heart', label: 'Recetas favoritas',     href: '/perfil/favoritas' },
]

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--color-clay)' }}>{n}</div>
      <div className="screen-sub" style={{ fontSize: 12, fontWeight: 700 }}>{l}</div>
    </div>
  )
}

interface PerfilScreenProps {
  name: string
  email: string
  avatarInitial: string
  costingsCount: number
}

export function PerfilScreen({ name, email, avatarInitial, costingsCount }: PerfilScreenProps) {
  const router = useRouter()

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="app-root tex-noise">
      <div className="app-scroll pad-bot" style={{ padding: '62px 22px 96px' }}>
        {/* avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 26 }}>
          <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--color-peach)', display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, marginBottom: 12 }}>{avatarInitial}</div>
          <h1 className="screen-h1" style={{ fontSize: 24, textTransform: 'capitalize' }}>{name}</h1>
          <p className="screen-sub" style={{ fontSize: 13.5 }}>{email} · Acceso de por vida</p>
          <div style={{ display: 'flex', gap: 22, marginTop: 16 }}>
            <Stat n={costingsCount} l="Costeos" />
            <Stat n={2} l="Jabones" />
            <Stat n={6} l="Categorías" />
          </div>
        </div>

        {/* menu */}
        <div className="j-card" style={{ overflow: 'hidden' }}>
          {MENU_ROWS.map((r, i) => (
            <button key={r.label} onClick={() => r.href && router.push(r.href)}
              style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 14, padding: '15px 16px',
                borderBottom: i < MENU_ROWS.length - 1 ? '1px solid rgba(74,55,40,.07)' : 'none' }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--clay-100)', display: 'grid', placeItems: 'center' }}>
                <Icon name={r.icon} size={19} color="var(--color-clay)" />
              </span>
              <span style={{ flex: 1, fontWeight: 700, fontSize: 15 }}>{r.label}</span>
              <Icon name="arrowR" size={18} color="var(--color-muted)" />
            </button>
          ))}
        </div>

        <button onClick={signOut}
          style={{ width: '100%', marginTop: 18, padding: 15, border: 'none', borderRadius: 14,
            background: '#fff', color: 'var(--diff-hard)', fontWeight: 800, fontSize: 15, boxShadow: 'var(--shadow-card)' }}>
          Cerrar sesión
        </button>
      </div>
      <BottomNav />
    </div>
  )
}

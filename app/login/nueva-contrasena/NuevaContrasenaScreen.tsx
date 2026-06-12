'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/app/Logo'
import { JButton } from '@/components/app/JButton'
import { Icon } from '@/components/app/Icon'
import { createClient } from '@/lib/supabase/client'
import { updatePassword } from './actions'
import '@/app/app.css'

// Session states:
//  loading  — detecting session (hash or cookies)
//  ok       — session confirmed, show the form
//  expired  — no valid session, show the expired message
type SessionState = 'loading' | 'ok' | 'expired'

export function NuevaContrasenaScreen() {
  const router = useRouter()
  const [sessionState, setSessionState] = useState<SessionState>('loading')
  const [pass,    setPass]    = useState('')
  const [confirm, setConfirm] = useState('')
  const [err,     setErr]     = useState<Record<string, string>>({})
  const [done,    setDone]    = useState(false)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()

    async function initSession() {
      // 1. Check if there is already a valid session in cookies (e.g. from a
      //    PKCE flow or a previously established session).
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSessionState('ok')
        return
      }

      // 2. The recovery link uses the implicit flow: Supabase redirects to this
      //    page with tokens in the URL hash (#access_token=...&type=recovery).
      //    Hash fragments are never sent to the server, so we read them here.
      const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : ''
      const params = new URLSearchParams(hash)
      const accessToken  = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const type         = params.get('type')

      if (accessToken && refreshToken && type === 'recovery') {
        const { error } = await supabase.auth.setSession({
          access_token:  accessToken,
          refresh_token: refreshToken,
        })

        if (!error) {
          // Clean the tokens from the URL bar (cosmetic, not security-critical)
          window.history.replaceState(null, '', window.location.pathname)
          setSessionState('ok')
        } else {
          console.error('[reset] setSession error:', error.message)
          setSessionState('expired')
        }
      } else {
        // No cookies and no hash tokens → link is invalid or expired
        setSessionState('expired')
      }
    }

    initSession()
  }, [])

  // ── Loading ────────────────────────────────────────────────────────────────
  if (sessionState === 'loading') {
    return (
      <div className="app-root tex-noise"
        style={{ minHeight: '100svh', background: 'var(--color-cream)',
          display: 'grid', placeItems: 'center' }}>
        <Logo size={30} />
      </div>
    )
  }

  // ── Enlace expirado / inválido ─────────────────────────────────────────────
  if (sessionState === 'expired') {
    return (
      <div className="app-root tex-noise"
        style={{ minHeight: '100svh', background: 'var(--color-cream)' }}>
        <div style={{ position: 'relative', maxWidth: 420, margin: '0 auto',
          padding: '64px 26px 40px', textAlign: 'center' }}>
          <div style={{ marginTop: 18, marginBottom: 34,
            display: 'flex', justifyContent: 'center' }}>
            <Logo size={30} />
          </div>
          <div style={{ fontSize: 56, marginBottom: 18 }}>⏰</div>
          <h1 className="screen-h1" style={{ fontSize: 28, marginBottom: 10 }}>
            Enlace expirado
          </h1>
          <p className="screen-sub" style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 30 }}>
            Este enlace ya no es válido. Solicita uno nuevo y úsalo dentro
            de los próximos 60 minutos.
          </p>
          <JButton block onClick={() => router.push('/login/recuperar')} iconRight="arrowR">
            Solicitar nuevo enlace
          </JButton>
        </div>
      </div>
    )
  }

  // ── Contraseña actualizada ─────────────────────────────────────────────────
  if (done) {
    return (
      <div className="app-root tex-noise"
        style={{ minHeight: '100svh', background: 'var(--color-cream)' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 220,
          height: 220, opacity: .5,
          background: 'radial-gradient(circle at 60% 40%, var(--color-blush), transparent 62%)' }} />
        <div style={{ position: 'relative', maxWidth: 420, margin: '0 auto',
          padding: '64px 26px 40px', textAlign: 'center' }}>
          <div style={{ marginTop: 18, marginBottom: 34,
            display: 'flex', justifyContent: 'center' }}>
            <Logo size={30} />
          </div>
          <div className="pop-in" style={{ width: 80, height: 80, borderRadius: '50%',
            margin: '0 auto 22px', background: 'var(--color-sage)',
            display: 'grid', placeItems: 'center' }}>
            <Icon name="check" size={40} color="#fff" stroke={3} />
          </div>
          <h1 className="screen-h1" style={{ fontSize: 28, marginBottom: 10 }}>
            ¡Contraseña actualizada!
          </h1>
          <p className="screen-sub" style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 30 }}>
            Ya puedes entrar con tu nueva contraseña.
          </p>
          <JButton block onClick={() => router.push('/login')} iconRight="arrowR">
            Iniciar sesión
          </JButton>
        </div>
      </div>
    )
  }

  // ── Formulario ─────────────────────────────────────────────────────────────
  const submit = () => {
    const e: Record<string, string> = {}
    if (pass.length < 6)  e.pass    = 'Usa al menos 6 caracteres para mayor seguridad'
    if (confirm !== pass) e.confirm = 'Las contraseñas no coinciden todavía'
    setErr(e)
    if (Object.keys(e).length) return

    startTransition(async () => {
      const result = await updatePassword(pass)
      if (result?.error) {
        setErr({ form: result.error })
      } else {
        setDone(true)
      }
    })
  }

  return (
    <div className="app-root tex-noise"
      style={{ minHeight: '100svh', background: 'var(--color-cream)' }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 220,
        height: 220, opacity: .5,
        background: 'radial-gradient(circle at 60% 40%, var(--color-blush), transparent 62%)' }} />
      <div style={{ position: 'absolute', top: 90, left: -60, width: 200,
        height: 200, opacity: .45,
        background: 'radial-gradient(circle at 50% 50%, var(--color-lavender), transparent 64%)' }} />
      <div style={{ position: 'relative', maxWidth: 420, margin: '0 auto',
        padding: '64px 26px 40px' }}>
        <div style={{ marginTop: 18, marginBottom: 34 }}><Logo size={30} /></div>
        <h1 className="screen-h1" style={{ fontSize: 30, marginBottom: 8 }}>
          Nueva contraseña
        </h1>
        <p className="screen-sub" style={{ marginBottom: 30 }}>
          Elige una contraseña segura para tu cuenta.
        </p>

        <div style={{ marginBottom: 18 }}>
          <label className="j-label">Nueva contraseña</label>
          <input className="j-input" type="password" value={pass}
            placeholder="Mínimo 6 caracteres"
            onChange={e => setPass(e.target.value)} />
          {err.pass && (
            <div style={{ color: 'var(--diff-hard)', fontSize: 13,
              fontWeight: 700, marginTop: 7 }}>{err.pass}</div>
          )}
        </div>

        <div style={{ marginBottom: 18 }}>
          <label className="j-label">Confirma tu contraseña</label>
          <input className="j-input" type="password" value={confirm}
            placeholder="Escríbela de nuevo"
            onChange={e => setConfirm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()} />
          {err.confirm && (
            <div style={{ color: 'var(--diff-hard)', fontSize: 13,
              fontWeight: 700, marginTop: 7 }}>{err.confirm}</div>
          )}
        </div>

        {err.form && (
          <div style={{ color: 'var(--diff-hard)', fontSize: 13,
            fontWeight: 700, marginTop: -8, marginBottom: 18 }}>
            {err.form}
          </div>
        )}

        <JButton block onClick={submit} iconRight="arrowR"
          disabled={pending} style={{ marginTop: 8 }}>
          {pending ? 'Guardando…' : 'Guardar nueva contraseña'}
        </JButton>
      </div>
    </div>
  )
}

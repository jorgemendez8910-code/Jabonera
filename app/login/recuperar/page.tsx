'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/app/Logo'
import { JButton } from '@/components/app/JButton'
import { Icon } from '@/components/app/Icon'
import { requestPasswordReset } from './actions'
import '@/app/app.css'

export default function RecuperarPage() {
  const router  = useRouter()
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [errMsg,  setErrMsg]  = useState('')
  const [pending, startTransition] = useTransition()

  const submit = () => {
    if (!email.includes('@')) {
      setErrMsg('Revisa tu correo, parece que falta algo 💛')
      return
    }
    setErrMsg('')
    startTransition(async () => {
      await requestPasswordReset(email)
      setSent(true)
    })
  }

  if (sent) {
    return (
      <div className="app-root tex-noise" style={{ minHeight: '100svh', background: 'var(--color-cream)' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, opacity: .5,
          background: 'radial-gradient(circle at 60% 40%, var(--color-blush), transparent 62%)' }} />
        <div style={{ position: 'relative', maxWidth: 420, margin: '0 auto', padding: '64px 26px 40px', textAlign: 'center' }}>
          <div style={{ marginTop: 18, marginBottom: 34, display: 'flex', justifyContent: 'center' }}>
            <Logo size={30} />
          </div>
          <div className="pop-in" style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 22px',
            background: 'var(--color-sage)', display: 'grid', placeItems: 'center' }}>
            <Icon name="bell" size={38} color="#fff" stroke={2} />
          </div>
          <h1 className="screen-h1" style={{ fontSize: 28, marginBottom: 10 }}>Revisa tu correo</h1>
          <p className="screen-sub" style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
            Si ese correo está registrado, te enviamos un enlace para restablecer tu contraseña.
            Revisa tu bandeja de entrada.
          </p>
          <button onClick={() => router.push('/login')}
            style={{ background: 'none', border: 'none', color: 'var(--color-clay)', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
            ← Volver al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-root tex-noise" style={{ minHeight: '100svh', background: 'var(--color-cream)' }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, opacity: .5,
        background: 'radial-gradient(circle at 60% 40%, var(--color-blush), transparent 62%)' }} />
      <div style={{ position: 'absolute', top: 90, left: -60, width: 200, height: 200, opacity: .45,
        background: 'radial-gradient(circle at 50% 50%, var(--color-lavender), transparent 64%)' }} />
      <div style={{ position: 'relative', maxWidth: 420, margin: '0 auto', padding: '64px 26px 40px' }}>
        <div style={{ marginTop: 18, marginBottom: 34 }}><Logo size={30} /></div>
        <h1 className="screen-h1" style={{ fontSize: 30, marginBottom: 8 }}>¿Olvidaste tu contraseña?</h1>
        <p className="screen-sub" style={{ marginBottom: 30 }}>
          Escribe tu correo y te enviamos un enlace para crear una nueva.
        </p>

        <div style={{ marginBottom: 18 }}>
          <label className="j-label">Correo electrónico</label>
          <input
            className="j-input"
            type="email"
            inputMode="email"
            value={email}
            placeholder="tu@correo.com"
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
          {errMsg && (
            <div style={{ color: 'var(--diff-hard)', fontSize: 13, fontWeight: 700, marginTop: 7 }}>{errMsg}</div>
          )}
        </div>

        <JButton block onClick={submit} iconRight="arrowR" disabled={pending} style={{ marginTop: 8 }}>
          {pending ? 'Enviando…' : 'Enviar enlace'}
        </JButton>

        <button onClick={() => router.push('/login')}
          style={{ background: 'none', border: 'none', marginTop: 22, color: 'var(--color-muted)',
            fontSize: 14, fontWeight: 700, width: '100%', textAlign: 'center', cursor: 'pointer' }}>
          ← Volver al inicio de sesión
        </button>
      </div>
    </div>
  )
}

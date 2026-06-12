'use client'

import { useState, useTransition, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Logo } from '@/components/app/Logo'
import { JButton } from '@/components/app/JButton'
import { trackEvent } from '@/lib/analytics'
import { signIn } from './actions'
import '@/app/app.css'

const SUPPORT_WHATSAPP_URL =
  'https://wa.me/50763633127?text=' +
  encodeURIComponent('Hola, compré Jabonera pero no tengo mi acceso. Mi correo es:')

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

function Field({ label, type = 'text', value, onChange, placeholder, error }: {
  label: string; type?: string; value: string; onChange: (v: string) => void
  placeholder?: string; error?: string
}) {
  const [showPass, setShowPass] = useState(false)
  const isPassword = type === 'password'
  const inputType  = isPassword && showPass ? 'text' : type

  return (
    <div style={{ marginBottom: 18 }}>
      <label className="j-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input className="j-input" type={inputType} value={value} placeholder={placeholder}
          inputMode={type === 'email' ? 'email' : undefined}
          onChange={e => onChange(e.target.value)}
          style={isPassword ? { paddingRight: 44 } : undefined} />
        {isPassword && (
          <button
            type="button"
            aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => setShowPass(s => !s)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', padding: 4, cursor: 'pointer',
              color: 'var(--color-muted)', display: 'grid', placeItems: 'center' }}>
            {showPass ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && <div style={{ color: 'var(--diff-hard)', fontSize: 13, fontWeight: 700, marginTop: 7 }}>{error}</div>}
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginPageContent /></Suspense>
}

function LoginPageContent() {
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [pass,  setPass]  = useState('')
  const [err,   setErr]   = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()

  const submit = () => {
    const e: Record<string, string> = {}
    if (!email.includes('@')) e.email = 'Revisa tu correo, parece que falta algo 💛'
    if (pass.length < 4)      e.pass  = 'Tu contraseña es un poquito corta'
    setErr(e)
    if (Object.keys(e).length) return

    startTransition(async () => {
      const result = await signIn(email, pass, redirectTo)
      if (result?.error) setErr({ form: result.error })
    })
  }

  const contactSupport = () => {
    trackEvent('support_link_clicked')
    window.open(SUPPORT_WHATSAPP_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="app-root tex-noise" style={{ minHeight: '100svh', background: 'var(--color-cream)' }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, opacity: .5,
        background: 'radial-gradient(circle at 60% 40%, var(--color-blush), transparent 62%)' }} />
      <div style={{ position: 'absolute', top: 90, left: -60, width: 200, height: 200, opacity: .45,
        background: 'radial-gradient(circle at 50% 50%, var(--color-lavender), transparent 64%)' }} />
      <div style={{ position: 'relative', maxWidth: 420, margin: '0 auto', padding: '64px 26px 40px' }}>
        <div style={{ marginTop: 18, marginBottom: 34 }}><Logo size={30} /></div>
        <h1 className="screen-h1" style={{ fontSize: 32, marginBottom: 8 }}>Hola de nuevo</h1>
        <p className="screen-sub" style={{ marginBottom: 30 }}>Entra para seguir creando jabones que se venden solos.</p>
        <Field label="Correo" type="email" value={email} onChange={setEmail} placeholder="tu@correo.com" error={err.email} />
        <Field label="Contraseña" type="password" value={pass} onChange={setPass} placeholder="••••••••" error={err.pass} />
        <div style={{ textAlign: 'right', marginTop: -10, marginBottom: 20 }}>
          <a href="/login/recuperar"
            style={{ color: 'var(--color-clay)', fontSize: 13.5, fontWeight: 700, textDecoration: 'none' }}>
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        {err.form && <div style={{ color: 'var(--diff-hard)', fontSize: 13, fontWeight: 700, marginTop: -8, marginBottom: 18 }}>{err.form}</div>}
        <JButton block onClick={submit} iconRight="arrowR" disabled={pending} style={{ marginTop: 8 }}>
          {pending ? 'Entrando…' : 'Entrar a mi cuenta'}
        </JButton>
        <button onClick={contactSupport}
          style={{ background: 'none', border: 'none', marginTop: 26, color: 'var(--color-muted)', fontSize: 14, fontWeight: 700, textAlign: 'center', lineHeight: 1.5, width: '100%', cursor: 'pointer' }}>
          ¿Compraste y no recibiste tu acceso?<br />
          <span style={{ color: 'var(--color-clay)' }}>Contactar soporte →</span>
        </button>
      </div>
    </div>
  )
}

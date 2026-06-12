'use client'

import { useState, useTransition } from 'react'
import { Logo } from '@/components/app/Logo'
import { JButton } from '@/components/app/JButton'
import { activateAccount } from './actions'
import '@/app/app.css'

function Field({ label, type = 'text', value, onChange, placeholder, error, readOnly }: {
  label: string; type?: string; value: string; onChange?: (v: string) => void
  placeholder?: string; error?: string; readOnly?: boolean
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label className="j-label">{label}</label>
      <input className="j-input" type={type} value={value} placeholder={placeholder}
        readOnly={readOnly}
        onChange={e => onChange?.(e.target.value)}
        style={readOnly ? { background: 'rgba(74,55,40,.05)', color: 'var(--color-muted)' } : undefined} />
      {error && <div style={{ color: 'var(--diff-hard)', fontSize: 13, fontWeight: 700, marginTop: 7 }}>{error}</div>}
    </div>
  )
}

export function ActivateScreen({ email }: { email: string }) {
  const [pass,    setPass]    = useState('')
  const [confirm, setConfirm] = useState('')
  const [err,     setErr]     = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()

  const submit = () => {
    const e: Record<string, string> = {}
    if (pass.length < 6)    e.pass    = 'Usa al menos 6 caracteres para mayor seguridad'
    if (confirm !== pass)   e.confirm = 'Las contraseñas no coinciden todavía'
    setErr(e)
    if (Object.keys(e).length) return

    startTransition(async () => {
      const result = await activateAccount(pass)
      if (result?.error) setErr({ form: result.error })
    })
  }

  return (
    <div className="app-root tex-noise" style={{ minHeight: '100svh', background: 'var(--color-cream)' }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, opacity: .5,
        background: 'radial-gradient(circle at 60% 40%, var(--color-blush), transparent 62%)' }} />
      <div style={{ position: 'relative', maxWidth: 420, margin: '0 auto', padding: '64px 26px 40px' }}>
        <div style={{ marginTop: 18, marginBottom: 30 }}><Logo size={28} wordmark={false} /></div>
        <div style={{ fontSize: 44, marginBottom: 14 }}>🧼</div>
        <h1 className="screen-h1" style={{ fontSize: 30, marginBottom: 10 }}>¡Bienvenida a Jabonera!</h1>
        <p className="screen-sub" style={{ marginBottom: 28 }}>Crea tu contraseña para entrar. Solo te tomará un momento.</p>
        <Field label="Tu correo" type="email" value={email} readOnly />
        <Field label="Nueva contraseña" type="password" value={pass} onChange={setPass} placeholder="Mínimo 6 caracteres" error={err.pass} />
        <Field label="Confirma tu contraseña" type="password" value={confirm} onChange={setConfirm} placeholder="Escríbela de nuevo" error={err.confirm} />
        {err.form && <div style={{ color: 'var(--diff-hard)', fontSize: 13, fontWeight: 700, marginTop: -8, marginBottom: 18 }}>{err.form}</div>}
        <JButton block onClick={submit} iconRight="arrowR" disabled={pending} style={{ marginTop: 8 }}>
          {pending ? 'Activando…' : 'Activar mi cuenta'}
        </JButton>
        <p style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: 12.5, marginTop: 20, lineHeight: 1.5 }}>
          Tu acceso es de por vida.
        </p>
      </div>
    </div>
  )
}

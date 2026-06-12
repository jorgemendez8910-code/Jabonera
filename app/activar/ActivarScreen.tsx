'use client'

import { useEffect, useState, useTransition } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

// ── Tipos ─────────────────────────────────────────────────────────────────

type PageState = 'loading' | 'error' | 'form'

interface ValidationResult {
  valid: boolean
  email?: string
  expired?: boolean
}

// ── Constantes ────────────────────────────────────────────────────────────

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? '525500000000'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, tengo problemas para activar mi cuenta de Jabonera.')}`

// ── Skeleton de carga ─────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div style={{ padding: '40px 32px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <div className="skel" style={{ width: 56, height: 56, borderRadius: '50%' }} />
      </div>
      <div className="skel" style={{ height: 28, borderRadius: 8, width: '70%', margin: '0 auto 14px' }} />
      <div className="skel" style={{ height: 16, borderRadius: 6, marginBottom: 10 }} />
      <div className="skel" style={{ height: 16, borderRadius: 6, marginBottom: 10, width: '85%' }} />
      <div className="skel" style={{ height: 52, borderRadius: 12, marginTop: 28 }} />
    </div>
  )
}

// ── Estado de error ───────────────────────────────────────────────────────

function ErrorState({ expired }: { expired?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '40px 32px 32px', textAlign: 'center' }}
    >
      <div style={{ fontSize: 52, marginBottom: 20 }}>⚠️</div>
      <h2 style={st.h2}>
        {expired ? 'El enlace expiró' : 'Enlace inválido'}
      </h2>
      <p style={st.subtext}>
        {expired
          ? 'Este enlace de activación tiene más de 72 horas. Escríbenos y te mandamos uno nuevo de inmediato.'
          : 'Este enlace no es válido o ya fue usado. Si crees que es un error, contáctanos.'}
      </p>
      <button
        onClick={() => window.open(WHATSAPP_URL, '_blank')}
        style={st.btnBlush}
      >
        Escribir por WhatsApp
      </button>
    </motion.div>
  )
}

// ── Formulario de activación ──────────────────────────────────────────────

interface FormErrors {
  name?: string
  password?: string
  confirm?: string
  general?: string
}

function ActivationForm({ email, token }: { email: string; token: string }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [pending, startTransition] = useTransition()
  const [showPass, setShowPass] = useState(false)

  const validate = (): FormErrors => {
    const e: FormErrors = {}
    if (password.length < 8) e.password = 'Usa al menos 8 caracteres'
    if (confirm !== password) e.confirm = 'Las contraseñas no coinciden'
    return e
  }

  const submit = () => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return

    startTransition(async () => {
      // Paso 1: el servidor crea el usuario con email_confirm: true (admin API).
      // Esto evita que Supabase mande su propio correo de "Confirma tu email".
      const res = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, name: name || null }),
      })

      const result: { success?: boolean; error?: string; email?: string } = await res.json()

      if (!res.ok || !result.success) {
        if (res.status === 409 || result.error === 'email_exists') {
          setErrors({ general: 'Ya tienes una cuenta con este correo. Inicia sesión directamente.' })
          return
        }
        setErrors({ general: result.error ?? 'No pudimos crear tu cuenta. Inténtalo de nuevo.' })
        return
      }

      // Paso 2: iniciar sesión para obtener la cookie de sesión.
      // El usuario ya existe y está confirmado, así que signInWithPassword no manda ningún correo.
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        setErrors({ general: 'Cuenta creada, pero no pudimos iniciar sesión. Intenta entrar desde el login.' })
        return
      }

      router.push('/dashboard')
    })
  }

  const passOk = password.length >= 8
  const confirmOk = password === confirm && confirm.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '36px 32px 32px' }}
    >
      <h2 style={st.h2}>Crea tu contraseña</h2>
      <p style={st.subtext}>Tu acceso es de por vida. Solo falta este paso.</p>

      <Field label="Tu correo" type="email" value={email} readOnly />

      <Field
        label="Tu nombre (opcional)"
        type="text"
        value={name}
        onChange={setName}
        placeholder="Ej. María García"
      />

      <div style={{ position: 'relative' }}>
        <Field
          label="Crea tu contraseña"
          type={showPass ? 'text' : 'password'}
          value={password}
          onChange={setPassword}
          placeholder="Mínimo 8 caracteres"
          error={errors.password}
        />
        <button
          type="button"
          onClick={() => setShowPass(v => !v)}
          style={st.showPassBtn}
          aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPass ? '🙈' : '👁️'}
        </button>
      </div>

      <Field
        label="Confirma tu contraseña"
        type="password"
        value={confirm}
        onChange={setConfirm}
        placeholder="Escríbela de nuevo"
        error={errors.confirm}
      />

      <ul style={st.requirements}>
        <li style={{ ...st.reqItem, color: passOk ? 'var(--diff-easy)' : 'var(--color-muted)' }}>
          <span style={{ marginRight: 6 }}>{passOk ? '✓' : '○'}</span>Al menos 8 caracteres
        </li>
        <li style={{ ...st.reqItem, color: confirmOk ? 'var(--diff-easy)' : 'var(--color-muted)' }}>
          <span style={{ marginRight: 6 }}>{confirmOk ? '✓' : '○'}</span>Las contraseñas coinciden
        </li>
      </ul>

      {errors.general && <div style={st.errorBanner}>{errors.general}</div>}

      <button onClick={submit} disabled={pending} style={st.btnPrimary}>
        {pending ? 'Activando tu cuenta…' : 'Activar mi cuenta y entrar →'}
      </button>
    </motion.div>
  )
}

function Field({
  label, type = 'text', value, onChange, placeholder, error, readOnly,
}: {
  label: string; type?: string; value: string; onChange?: (v: string) => void
  placeholder?: string; error?: string; readOnly?: boolean
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={st.label}>{label}</label>
      <input
        style={{ ...st.input, ...(readOnly ? st.inputReadOnly : {}) }}
        type={type}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={readOnly}
        onChange={e => onChange?.(e.target.value)}
        onFocus={e => { if (!readOnly) (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(200,216,192,0.45)' }}
        onBlur={e => { (e.target as HTMLInputElement).style.boxShadow = 'none' }}
      />
      {error && <div style={st.fieldError}>{error}</div>}
    </div>
  )
}

// ── Pantalla principal ─────────────────────────────────────────────────────

export function ActivarScreen() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [state, setState] = useState<PageState>('loading')
  const [email, setEmail] = useState('')
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    if (!token) { setState('error'); return }

    fetch(`/api/auth/validate-token?token=${encodeURIComponent(token)}`)
      .then(r => r.json() as Promise<ValidationResult>)
      .then(result => {
        if (result.valid && result.email) {
          setEmail(result.email)
          setState('form')
        } else {
          setExpired(result.expired ?? false)
          setState('error')
        }
      })
      .catch(() => setState('error'))
  }, [token])

  return (
    <div style={st.page} className="tex-noise">
      <div style={st.bubble} />

      <div style={st.wrapper}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={st.card}
        >
          {/* Header de la card */}
          <div style={st.cardHeader}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🧼</div>
            <span style={st.cardHeaderTitle}>Jabonera</span>
          </div>

          {/* Contenido por estado */}
          <AnimatePresence mode="wait">
            {state === 'loading' && (
              <motion.div key="loading" exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                <LoadingSkeleton />
              </motion.div>
            )}
            {state === 'error' && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ErrorState expired={expired} />
              </motion.div>
            )}
            {state === 'form' && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ActivationForm email={email} token={token} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p style={st.footerNote}>
          ¿Tienes dudas?{' '}
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={st.footerLink}>
            Escríbenos por WhatsApp
          </a>
        </p>
      </div>

      <style>{`
        @keyframes skelPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
        .skel {
          background: rgba(200,216,192,0.35);
          animation: skelPulse 1.6s ease-in-out infinite;
        }
        input:focus { outline: none; }
        button:not(:disabled):hover { opacity: 0.88; }
      `}</style>
    </div>
  )
}

// ── Estilos ───────────────────────────────────────────────────────────────

const st = {
  page: {
    minHeight: '100svh',
    background: 'var(--color-cream)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute' as const,
    top: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'radial-gradient(circle at 60% 40%, rgba(242,196,196,0.45), transparent 68%)',
    pointerEvents: 'none' as const,
  },
  wrapper: {
    width: '100%',
    maxWidth: 440,
    position: 'relative' as const,
    zIndex: 1,
  },
  card: {
    background: 'var(--color-white)',
    borderRadius: 'var(--r-card)',
    boxShadow: 'var(--shadow-lift)',
    overflow: 'hidden',
  },
  cardHeader: {
    background: 'var(--color-sage)',
    padding: '28px 32px 24px',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--color-bark)',
    letterSpacing: '-0.01em',
  },
  h2: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--color-bark)',
    margin: '0 0 10px',
    textAlign: 'center' as const,
  },
  subtext: {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    color: 'var(--color-muted)',
    lineHeight: 1.6,
    margin: '0 0 24px',
    textAlign: 'center' as const,
  },
  label: {
    display: 'block',
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--color-bark)',
    marginBottom: 7,
    letterSpacing: '0.01em',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid rgba(74,55,40,0.18)',
    borderRadius: 10,
    background: '#fff',
    color: 'var(--color-bark)',
    fontFamily: 'var(--font-body)',
    fontSize: 15,
    transition: 'border-color .18s, box-shadow .18s',
    boxSizing: 'border-box' as const,
  },
  inputReadOnly: {
    background: 'rgba(74,55,40,0.04)',
    color: 'var(--color-muted)',
    cursor: 'not-allowed' as const,
    borderColor: 'rgba(74,55,40,0.10)',
  },
  fieldError: {
    fontFamily: 'var(--font-body)',
    fontSize: 12.5,
    fontWeight: 700,
    color: 'var(--diff-hard)',
    marginTop: 6,
  },
  requirements: {
    listStyle: 'none',
    padding: 0,
    margin: '-4px 0 20px',
    fontFamily: 'var(--font-body)',
    fontSize: 12.5,
    lineHeight: 1.7,
  },
  reqItem: {
    display: 'flex',
    alignItems: 'center',
    transition: 'color .25s',
  },
  errorBanner: {
    background: 'var(--blush-50)',
    border: '1.5px solid var(--color-blush)',
    borderRadius: 10,
    padding: '12px 14px',
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--diff-hard)',
    marginBottom: 18,
  },
  btnPrimary: {
    display: 'block',
    width: '100%',
    padding: '16px 24px',
    background: 'var(--color-clay)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--r-pill)',
    fontFamily: 'var(--font-body)',
    fontSize: 16,
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'opacity .18s',
    marginTop: 8,
    letterSpacing: '0.01em',
  },
  btnBlush: {
    display: 'inline-block',
    padding: '14px 28px',
    background: 'var(--color-blush)',
    color: 'var(--color-bark)',
    border: 'none',
    borderRadius: 'var(--r-pill)',
    fontFamily: 'var(--font-body)',
    fontSize: 15,
    fontWeight: 800,
    cursor: 'pointer',
    marginTop: 20,
    transition: 'opacity .18s',
  },
  showPassBtn: {
    position: 'absolute' as const,
    right: 12,
    top: 34,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: '4px',
    lineHeight: 1,
  },
  footerNote: {
    textAlign: 'center' as const,
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    color: 'var(--color-muted)',
    marginTop: 20,
  },
  footerLink: {
    color: 'var(--color-clay)',
    textDecoration: 'underline',
  },
} as const

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/app/TopBar'
import { BottomNav } from '@/components/app/BottomNav'
import { JButton } from '@/components/app/JButton'
import { updateFullName, updatePassword } from '@/lib/profile'

interface CuentaScreenProps {
  name: string
  email: string
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-muted)', textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: 10 }}>{title}</p>
      <div className="j-card" style={{ padding: '4px 16px' }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid rgba(74,55,40,.07)' }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-muted)', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', border: 'none', outline: 'none', background: 'transparent',
  fontSize: 15, fontWeight: 600, color: 'var(--color-bark)', fontFamily: 'inherit',
}

export function CuentaScreen({ name, email }: CuentaScreenProps) {
  const router = useRouter()

  const [fullName, setFullName] = useState(name)
  const [nameMsg, setNameMsg] = useState('')
  const [nameSaving, setNameSaving] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passMsg, setPassMsg] = useState('')
  const [passSaving, setPassSaving] = useState(false)

  async function saveName() {
    if (!fullName.trim()) return
    setNameSaving(true)
    setNameMsg('')
    const { error } = await updateFullName(fullName)
    setNameMsg(error ?? 'Nombre actualizado')
    setNameSaving(false)
    if (!error) router.refresh()
  }

  async function savePassword() {
    if (newPassword.length < 6) {
      setPassMsg('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      setPassMsg('Las contraseñas no coinciden')
      return
    }
    setPassSaving(true)
    setPassMsg('')
    const { error } = await updatePassword(newPassword)
    if (error) {
      setPassMsg(error)
    } else {
      setPassMsg('Contraseña actualizada')
      setNewPassword('')
      setConfirmPassword('')
    }
    setPassSaving(false)
  }

  return (
    <div className="app-root tex-noise">
      <TopBar title="Mi cuenta" />
      <div className="app-scroll" style={{ padding: '100px 22px 96px' }}>

        <Section title="Información personal">
          <Field label="Nombre">
            <input
              style={inputStyle}
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </Field>
          <div style={{ padding: '14px 0' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-muted)', marginBottom: 6 }}>
              Correo electrónico
            </label>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-muted)' }}>{email}</span>
          </div>
        </Section>

        <JButton block onClick={saveName} disabled={nameSaving || !fullName.trim()}>
          {nameSaving ? 'Guardando…' : 'Guardar nombre'}
        </JButton>
        {nameMsg && (
          <p style={{ textAlign: 'center', fontSize: 13, marginTop: 10,
            color: nameMsg.includes('No') ? 'var(--diff-hard)' : 'var(--color-clay)' }}>
            {nameMsg}
          </p>
        )}

        <div style={{ marginTop: 32 }}>
          <Section title="Seguridad">
            <Field label="Nueva contraseña">
              <input
                style={inputStyle}
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
            </Field>
            <div style={{ padding: '14px 0' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-muted)', marginBottom: 6 }}>
                Confirmar contraseña
              </label>
              <input
                style={inputStyle}
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                autoComplete="new-password"
              />
            </div>
          </Section>

          <JButton block onClick={savePassword} disabled={passSaving || !newPassword || !confirmPassword}>
            {passSaving ? 'Cambiando…' : 'Cambiar contraseña'}
          </JButton>
          {passMsg && (
            <p style={{ textAlign: 'center', fontSize: 13, marginTop: 10,
              color: passMsg.includes('No') || passMsg.includes('no') || passMsg.includes('menos') ? 'var(--diff-hard)' : 'var(--color-clay)' }}>
              {passMsg}
            </p>
          )}
        </div>

      </div>
      <BottomNav />
    </div>
  )
}

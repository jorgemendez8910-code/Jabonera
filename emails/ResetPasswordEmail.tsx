import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

export interface ResetPasswordEmailProps {
  resetUrl: string
}

const WHATSAPP_NUMBER = process.env.SUPPORT_WHATSAPP ?? '525500000000'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, solicité recuperar mi contraseña de Jabonera y necesito ayuda.')}`

export function ResetPasswordEmail({ resetUrl }: ResetPasswordEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Restablece tu contraseña de Jabonera — enlace válido por 60 minutos.</Preview>

      <Body style={body}>
        <Container style={container}>

          {/* ── Header ──────────────────────────────────────────────── */}
          <Section style={header}>
            <Heading style={logoText}>🧼 Jabonera</Heading>
          </Section>

          {/* ── Contenido principal ─────────────────────────────────── */}
          <Section style={content}>
            <Heading style={h1}>Recupera tu contraseña</Heading>

            <Text style={paragraph}>
              Recibimos una solicitud para restablecer la contraseña de tu cuenta
              en Jabonera. Haz clic en el botón de abajo para crear una nueva:
            </Text>

            {/* ── CTA principal ────────────────────────────────────── */}
            <Section style={buttonSection}>
              <Button href={resetUrl} style={ctaButton}>
                Crear nueva contraseña →
              </Button>
            </Section>

            {/* ── Link de respaldo ─────────────────────────────────── */}
            <Text style={fallbackLabel}>
              ¿El botón no funciona? Copia este enlace en tu navegador:
            </Text>
            <Text style={fallbackUrl}>{resetUrl}</Text>

            {/* ── Nota de expiración ───────────────────────────────── */}
            <Section style={expiryBox}>
              <Text style={expiryText}>
                ⏳ Este enlace es válido por <strong>60 minutos</strong> y solo puede
                usarse una vez. Si no solicitaste este cambio, puedes ignorar este correo
                — tu contraseña seguirá siendo la misma.
              </Text>
            </Section>
          </Section>

          {/* ── Separador ───────────────────────────────────────────── */}
          <Hr style={divider} />

          {/* ── Soporte ─────────────────────────────────────────────── */}
          <Section style={supportSection}>
            <Text style={supportTitle}>¿Necesitas ayuda?</Text>
            <Text style={supportText}>
              Si tú no solicitaste este cambio o tienes algún problema, escríbenos por{' '}
              <Link href={WHATSAPP_URL} style={link}>WhatsApp</Link>{' '}
              y te ayudamos de inmediato.
            </Text>
          </Section>

          {/* ── Footer ──────────────────────────────────────────────── */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Jabonera · Hecho con amor para artesanas
            </Text>
            <Text style={footerMuted}>
              Recibiste este correo porque alguien solicitó recuperar el acceso a
              esta cuenta. Si no fuiste tú, ignora este mensaje.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default ResetPasswordEmail

// ── Estilos inline ────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: '#fdf6ee',
  fontFamily: 'Arial, Helvetica, sans-serif',
  margin: 0,
  padding: 0,
}

const container: React.CSSProperties = {
  maxWidth: 560,
  margin: '32px auto',
  backgroundColor: '#fdf6ee',
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 4px 24px rgba(74,55,40,0.10)',
}

const header: React.CSSProperties = {
  backgroundColor: '#c8d8c0',
  padding: '32px 40px 24px',
  textAlign: 'center',
}

const logoText: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: 28,
  fontWeight: 700,
  color: '#4a3728',
  margin: 0,
  letterSpacing: '-0.01em',
}


const content: React.CSSProperties = {
  padding: '36px 40px 28px',
}

const h1: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: 26,
  fontWeight: 700,
  color: '#4a3728',
  margin: '0 0 20px',
  letterSpacing: '-0.01em',
}

const paragraph: React.CSSProperties = {
  fontSize: 15,
  lineHeight: '1.65',
  color: '#4a3728',
  margin: '0 0 16px',
}

const buttonSection: React.CSSProperties = {
  textAlign: 'center',
  margin: '28px 0 20px',
}

const ctaButton: React.CSSProperties = {
  backgroundColor: '#c4846c',
  color: '#ffffff',
  fontSize: 16,
  fontWeight: 700,
  fontFamily: 'Arial, Helvetica, sans-serif',
  textDecoration: 'none',
  borderRadius: 8,
  padding: '16px 40px',
  display: 'inline-block',
  letterSpacing: '0.01em',
}

const fallbackLabel: React.CSSProperties = {
  fontSize: 12,
  color: '#8c7b70',
  margin: '16px 0 4px',
  textAlign: 'center',
}

const fallbackUrl: React.CSSProperties = {
  fontSize: 11,
  color: '#8c7b70',
  wordBreak: 'break-all',
  textAlign: 'center',
  margin: '0 0 20px',
}

const expiryBox: React.CSSProperties = {
  backgroundColor: '#fbf4dd',
  borderRadius: 10,
  padding: '12px 16px',
  margin: '16px 0 0',
}

const expiryText: React.CSSProperties = {
  fontSize: 13,
  color: '#4a3728',
  margin: 0,
  lineHeight: '1.5',
}

const divider: React.CSSProperties = {
  borderColor: 'rgba(74,55,40,0.10)',
  margin: '0 40px',
}

const supportSection: React.CSSProperties = {
  padding: '24px 40px 16px',
}

const supportTitle: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: 15,
  fontWeight: 700,
  color: '#4a3728',
  margin: '0 0 8px',
}

const supportText: React.CSSProperties = {
  fontSize: 14,
  color: '#4a3728',
  lineHeight: '1.6',
  margin: 0,
}

const link: React.CSSProperties = {
  color: '#c4846c',
  textDecoration: 'underline',
}

const footer: React.CSSProperties = {
  padding: '16px 40px 28px',
  textAlign: 'center',
}

const footerText: React.CSSProperties = {
  fontSize: 12,
  color: '#8c7b70',
  margin: '0 0 6px',
}

const footerMuted: React.CSSProperties = {
  fontSize: 11,
  color: '#8c7b70',
  opacity: 0.7,
  margin: 0,
  lineHeight: '1.5',
}

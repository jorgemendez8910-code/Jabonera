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

export interface ActivationEmailProps {
  buyerName: string
  activationUrl: string
  expiresInHours?: number
}

// Número de WhatsApp para soporte (incluir código de país sin +)
const WHATSAPP_NUMBER = process.env.SUPPORT_WHATSAPP ?? '525500000000'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, acabo de comprar Jabonera y necesito ayuda con mi acceso.')}`

export function ActivationEmail({
  buyerName,
  activationUrl,
  expiresInHours = 72,
}: ActivationEmailProps) {
  const firstName = buyerName?.split(' ')[0] ?? 'artesana'

  return (
    <Html lang="es">
      <Head />
      <Preview>¡Tu acceso a Jabonera está listo! Activa tu cuenta aquí.</Preview>

      <Body style={body}>
        <Container style={container}>

          {/* ── Header ──────────────────────────────────────────────── */}
          <Section style={header}>
            <Heading style={logoText}>🧼 Jabonera</Heading>
          </Section>

          {/* ── Contenido principal ─────────────────────────────────── */}
          <Section style={content}>
            <Heading style={h1}>¡Bienvenida, {firstName}!</Heading>

            <Text style={paragraph}>
              Gracias por unirte a Jabonera. Estamos emocionadas de acompañarte en
              tu camino artesanal — desde tu primera receta hasta que tengas tu
              precio de venta perfecto calculado.
            </Text>

            <Text style={paragraph}>
              Tu acceso ya está listo. Haz clic en el botón para crear tu contraseña
              y entrar a tu cuenta:
            </Text>

            {/* ── CTA principal ────────────────────────────────────── */}
            <Section style={buttonSection}>
              <Button href={activationUrl} style={ctaButton}>
                Activar mi cuenta →
              </Button>
            </Section>

            {/* ── Link de respaldo para clientes que bloquean botones ─ */}
            <Text style={fallbackLabel}>
              ¿El botón no funciona? Copia este enlace en tu navegador:
            </Text>
            <Text style={fallbackUrl}>{activationUrl}</Text>

            {/* ── Nota de expiración ───────────────────────────────── */}
            <Section style={expiryBox}>
              <Text style={expiryText}>
                ⏳ Este enlace estará activo por {expiresInHours} horas. Si expira,
                escríbenos y lo renovamos de inmediato.
              </Text>
            </Section>
          </Section>

          {/* ── Separador ───────────────────────────────────────────── */}
          <Hr style={divider} />

          {/* ── Soporte ─────────────────────────────────────────────── */}
          <Section style={supportSection}>
            <Text style={supportTitle}>¿Necesitas ayuda?</Text>
            <Text style={supportText}>
              Estamos aquí para ti. Escríbenos por{' '}
              <Link href={WHATSAPP_URL} style={link}>WhatsApp</Link>{' '}
              y te respondemos en minutos.
            </Text>
          </Section>

          {/* ── Footer ──────────────────────────────────────────────── */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Jabonera · Hecho con amor para artesanas
            </Text>
            <Text style={footerMuted}>
              Recibiste este correo porque compraste Jabonera. No es necesario
              responder a esta dirección.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default ActivationEmail

// ── Estilos inline ────────────────────────────────────────────────────────
// React Email renderiza en clientes de correo que ignoran <style>; los estilos
// deben ser inline. Usamos Georgia/Arial como fallbacks de las tipografías del
// producto (Playfair Display → Georgia; Nunito → Arial).

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

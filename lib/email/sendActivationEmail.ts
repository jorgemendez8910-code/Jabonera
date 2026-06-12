import { Resend } from 'resend'
import { ActivationEmail } from '@/emails/ActivationEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

// Dominio remitente verificado en Resend. Cambiar a dominio propio en producción.
const FROM_ADDRESS = process.env.EMAIL_FROM ?? 'Jabonera <noreply@jabonera.com>'

interface SendActivationEmailParams {
  buyerName: string
  email: string
  activationUrl: string
  expiresInHours?: number
}

interface SendResult {
  success: boolean
  error?: string
}

export async function sendActivationEmail({
  buyerName,
  email,
  activationUrl,
  expiresInHours = 72,
}: SendActivationEmailParams): Promise<SendResult> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: '¡Tu acceso a Jabonera está listo! 🧼',
      react: ActivationEmail({ buyerName, activationUrl, expiresInHours }),
    })

    if (error) {
      console.error('[email] Resend error:', error.message)
      return { success: false, error: error.message }
    }

    console.log(`[email] Correo de activación enviado a ${email}`)
    return { success: true }

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[email] Error inesperado al enviar correo:', message)
    return { success: false, error: message }
  }
}

import { Resend } from 'resend'
import { ResetPasswordEmail } from '@/emails/ResetPasswordEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_ADDRESS = process.env.EMAIL_FROM ?? 'Jabonera <noreply@jabonera.com>'

interface SendResetPasswordEmailParams {
  email: string
  resetUrl: string
}

interface SendResult {
  success: boolean
  error?: string
}

export async function sendResetPasswordEmail({
  email,
  resetUrl,
}: SendResetPasswordEmailParams): Promise<SendResult> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: 'Recupera tu contraseña de Jabonera 🔑',
      react: ResetPasswordEmail({ resetUrl }),
    })

    if (error) {
      console.error('[email] Resend error (reset password):', error.message)
      return { success: false, error: error.message }
    }

    console.log(`[email] Correo de recuperación enviado a ${email}`)
    return { success: true }

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[email] Error inesperado al enviar correo de recuperación:', message)
    return { success: false, error: message }
  }
}

'use server'

import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { sendResetPasswordEmail } from '@/lib/email/sendResetPasswordEmail'

export async function requestPasswordReset(email: string): Promise<void> {
  // Fire-and-forget — never reveal whether the email exists or not.
  // If anything fails we silently swallow the error.
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://jabonera.com'

    // generateLink does NOT send any email on its own — it only returns the link.
    // We use the admin client (service_role) so it works without a browser session.
    const { data, error } = await getSupabaseAdmin().auth.admin.generateLink({
      type: 'recovery',
      email: email.trim(),
      options: {
        // After Supabase verifies the token it redirects here with the session
        // tokens in the URL hash (#access_token=...&type=recovery).
        // NuevaContrasenaScreen reads and applies those tokens client-side.
        redirectTo: `${appUrl}/login/nueva-contrasena`,
      },
    })

    if (error || !data?.properties?.action_link) {
      // User doesn't exist or another error — stay silent.
      console.error('[reset] generateLink error (silenced):', error?.message)
      return
    }

    await sendResetPasswordEmail({
      email: email.trim(),
      resetUrl: data.properties.action_link,
    })

  } catch (err) {
    // Never surface errors to the client — prevents email enumeration.
    console.error('[reset] Unexpected error (silenced):', err instanceof Error ? err.message : err)
  }
}

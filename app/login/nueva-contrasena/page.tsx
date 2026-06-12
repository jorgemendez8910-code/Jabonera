import { NuevaContrasenaScreen } from './NuevaContrasenaScreen'

// The user arrives here after clicking the recovery link in their email.
// Supabase redirects with session tokens in the URL hash (#access_token=...&type=recovery).
// Since hash fragments are never sent to the server, the session check is handled
// entirely client-side inside NuevaContrasenaScreen.
export default function NuevaContrasenaPage() {
  return <NuevaContrasenaScreen />
}

import { NextResponse } from 'next/server'

const WHATSAPP_URL =
  'https://wa.me/50763633127?text=' +
  encodeURIComponent('Hola, quiero ponerme en contacto con el equipo de Jabonera.')

export function GET() {
  return NextResponse.redirect(WHATSAPP_URL)
}

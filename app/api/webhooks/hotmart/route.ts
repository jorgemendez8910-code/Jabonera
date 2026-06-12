import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { sendActivationEmail } from '@/lib/email/sendActivationEmail'
import { randomBytes } from 'crypto'

// Flip this env var to bypass signature validation during local dev / ngrok testing.
// In production, HOTMART_SKIP_SIGNATURE should be absent or 'false'.
const SKIP_SIGNATURE = process.env.HOTMART_SKIP_SIGNATURE === 'true'

// ── Types ──────────────────────────────────────────────────────────────────

interface HotmartBuyer {
  email: string
  name: string
}

interface HotmartPurchase {
  transaction: string
  status: string
  price?: { value: number; currency_value: string }
}

interface HotmartPayload {
  event: string
  data: {
    buyer: HotmartBuyer
    purchase: HotmartPurchase
    product?: { id: number; name: string }
  }
}

type WebhookStatus = 'processed' | 'ignored' | 'error'

// ── Signature validation ────────────────────────────────────────────────────

async function validateHotmartSignature(request: NextRequest, rawBody: string): Promise<boolean> {
  if (SKIP_SIGNATURE) {
    console.warn('[webhook] ⚠️  Validación de firma DESACTIVADA (HOTMART_SKIP_SIGNATURE=true)')
    return true
  }

  const secret = process.env.HOTMART_WEBHOOK_SECRET
  if (!secret) {
    console.error('[webhook] HOTMART_WEBHOOK_SECRET no configurado — rechazando request')
    return false
  }

  const receivedToken = request.headers.get('x-hotmart-webhook-token')
  if (!receivedToken) return false

  // Hotmart firma con HMAC-SHA256 sobre el cuerpo raw del request
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))
  const computed = Buffer.from(signature).toString('hex')

  // timingSafeEqual equivalente en Web Crypto: comparamos en tiempo constante
  // convirtiendo ambos strings a Uint8Array del mismo largo
  const a = encoder.encode(computed)
  const b = encoder.encode(receivedToken)
  if (a.length !== b.length) return false

  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

// ── Helpers para escribir en Supabase ──────────────────────────────────────

async function logWebhookEvent(
  eventType: string,
  payload: unknown,
  status: WebhookStatus,
  errorMessage?: string,
) {
  const db = getSupabaseAdmin()
  const { error } = await db.from('webhook_events').insert({
    event_type: eventType,
    payload,
    status,
    error_message: errorMessage ?? null,
  })
  if (error) {
    console.error('[webhook] No se pudo registrar en webhook_events:', error.message)
  }
}

// ── Handler principal ──────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Leer el body una sola vez como string — lo necesitamos para validar la firma
  // y para deserializar el JSON. request.body solo puede leerse una vez.
  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  // Validar firma antes de procesar nada
  const signatureOk = await validateHotmartSignature(request, rawBody)
  if (!signatureOk) {
    console.warn('[webhook] Firma inválida — ignorando request')
    // Responder 200 de todas formas: un 401 hace que Hotmart reintente indefinidamente
    return NextResponse.json({ ok: false, reason: 'invalid_signature' }, { status: 200 })
  }

  let payload: HotmartPayload
  try {
    payload = JSON.parse(rawBody) as HotmartPayload
  } catch {
    await logWebhookEvent('UNKNOWN', rawBody, 'error', 'JSON malformado')
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  const { event, data } = payload
  console.log(`[webhook] Evento recibido: ${event}`)

  // ── PURCHASE_APPROVED ────────────────────────────────────────────────────
  if (event === 'PURCHASE_APPROVED') {
    try {
      const db = getSupabaseAdmin()
      const transactionId = data.purchase.transaction
      const email = data.buyer.email?.toLowerCase().trim()
      const name = data.buyer.name ?? ''

      if (!email || !transactionId) {
        await logWebhookEvent(event, payload, 'error', 'Falta email o transaction_id en el payload')
        return NextResponse.json({ ok: false }, { status: 200 })
      }

      // Idempotencia: si ya existe esta transacción, ignorar sin crear duplicados
      const { data: existing } = await db
        .from('pending_activations')
        .select('id')
        .eq('hotmart_transaction_id', transactionId)
        .maybeSingle()

      if (existing) {
        console.log(`[webhook] Transacción ${transactionId} ya procesada — ignorando`)
        await logWebhookEvent(event, payload, 'ignored')
        return NextResponse.json({ ok: true, reason: 'already_processed' }, { status: 200 })
      }

      // Generar token de activación: 32 bytes en hex = 64 caracteres
      const activationToken = randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()

      const { error: insertError } = await db.from('pending_activations').insert({
        email,
        hotmart_transaction_id: transactionId,
        activation_token: activationToken,
        expires_at: expiresAt,
        origin: 'hotmart',
      })

      if (insertError) {
        throw new Error(`pending_activations insert: ${insertError.message}`)
      }

      // Enviar correo de activación (el webhook no falla si el correo falla)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://jabonera.com'
      const activationUrl = `${appUrl}/activar?token=${activationToken}`

      const emailResult = await sendActivationEmail({ buyerName: name, email, activationUrl })
      if (!emailResult.success) {
        console.error(`[webhook] Correo no enviado: ${emailResult.error}`)
      }

      await logWebhookEvent(event, payload, 'processed')
      console.log(`[webhook] PURCHASE_APPROVED procesado para ${email}`)

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[webhook] Error en PURCHASE_APPROVED:', message)
      await logWebhookEvent(event, payload, 'error', message)
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  }

  // ── PURCHASE_REFUNDED / PURCHASE_CHARGEBACK ──────────────────────────────
  if (event === 'PURCHASE_REFUNDED' || event === 'PURCHASE_CHARGEBACK') {
    try {
      const db = getSupabaseAdmin()
      const transactionId = data.purchase.transaction
      const reason = event === 'PURCHASE_REFUNDED' ? 'refund' : 'chargeback'

      const { error } = await db.rpc('revoke_access_by_transaction', {
        p_transaction_id: transactionId,
        p_reason: reason,
      })

      if (error) {
        throw new Error(`revoke_access_by_transaction: ${error.message}`)
      }

      await logWebhookEvent(event, payload, 'processed')
      console.log(`[webhook] ${event} procesado para transacción ${transactionId}`)

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[webhook] Error en ${event}:`, message)
      await logWebhookEvent(event, payload, 'error', message)
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  }

  // ── Cualquier otro evento ────────────────────────────────────────────────
  await logWebhookEvent(event, payload, 'ignored')
  console.log(`[webhook] Evento ${event} ignorado (no requiere acción)`)
  return NextResponse.json({ ok: true, reason: 'event_ignored' }, { status: 200 })
}

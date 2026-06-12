import { NextResponse, type NextRequest } from 'next/server'

// Shared guard for app/api/admin/* routes — these are never linked from the
// UI; they're called manually (or from an external tool) with a secret header
// while there's no Hotmart webhook yet.
export function requireAdminKey(request: NextRequest): NextResponse | null {
  const key = request.headers.get('x-admin-key')
  if (!key || key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  return null
}

# Jabonera — Documentación Interna

> **Este archivo es solo para desarrollo local / referencia del equipo.**
> No se sirve en producción (Vercel lo ignora), pero tampoco incluyas aquí credenciales reales.

---

## ¿Qué es Jabonera?

PWA para artesanas jaboneras latinoamericanas. Permite:

- **Escalar recetas** — ajusta cantidades según el tamaño del lote
- **Seguir el proceso paso a paso** — guía interactiva con progreso guardado
- **Calcular precios de venta** — costeo de ingredientes + margen + sugerencia de precio
- **Historial de costeos** — guardado en Supabase por usuario

Modelo de negocio: acceso de por vida vendido vía **Hotmart**. El webhook de Hotmart dispara el flujo de activación.

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript 5 |
| UI | React 19, CSS custom (sin Tailwind) |
| Base de datos | Supabase (PostgreSQL + Auth + RLS) |
| Email | Resend + React Email |
| Pagos | Hotmart (webhook) |
| Animaciones | Framer Motion |
| Fuentes | Playfair Display + Nunito (next/font) |
| Deploy | Vercel |
| PWA | manifest.ts + public/sw.js |

---

## Estructura de carpetas

```
app/
  page.tsx                  — Landing page (RSC)
  layout.tsx                — Root layout: fuentes, SW registration, PWA meta
  manifest.ts               — PWA manifest
  globals.css               — Design tokens (variables CSS), reset global
  landing.css               — Estilos landing (mobile-first, 720px, 1024px)
  app.css                   — Estilos app: shells, .j-btn, .j-card, .j-input, bottom nav

  login/
    page.tsx                — 'use client', usa Server Action signIn
    actions.ts              — Server Action: signIn con Supabase

  activar/
    page.tsx                — Wrapper con <Suspense> (requerido por useSearchParams)
    ActivarScreen.tsx       — 'use client': valida token → formulario de contraseña → activa cuenta

  activate/                 — Ruta protegida post-login para re-activar si hace falta
    page.tsx                — RSC: verifica sesión, pasa email a ActivateScreen
    ActivateScreen.tsx      — 'use client'

  (app)/                    — Grupo de rutas protegidas (middleware redirige a /login si no hay sesión)
    layout.tsx              — RSC async: obtiene perfil → pasa initialCurrency a StoreProvider
    dashboard/
    recetas/[catId]/[id]/
    proceso/[id]/
    celebracion/[id]/
    costeo/[id]/
    costeo/custom/
    historial/
    perfil/

  api/
    webhooks/hotmart/route.ts   — POST: PURCHASE_APPROVED → genera token → inserta en pending_activations → envía email
    auth/validate-token/route.ts — GET: valida token en pending_activations (usa service_role)

components/
  app/
    StoreProvider.tsx       — 'use client', Context + useReducer, lazy init desde localStorage
    BottomNav.tsx           — 'use client', usa usePathname
    TopBar.tsx              — 'use client', usa router.back()
    Bubbles.tsx             — 'use client', posiciones estables con useMemo
    Icon.tsx, Logo.tsx, JButton.tsx, Badge.tsx — RSC-compatibles (sin hooks)
  landing/
    Nav.tsx                 — 'use client', hamburger toggle
    CountUp.tsx             — 'use client', IntersectionObserver + rAF
    Reveal.tsx              — 'use client', IntersectionObserver

lib/
  recipes.ts                — Tipos + datos estáticos de recetas y categorías
  pricing.ts                — MARGINS, CURRENCIES, fmtMoney, suggestedPrice, scaleAmount
  store.ts                  — Claves localStorage versionadas (jabonera_v1_*), guards SSR
  data.ts                   — Fetchers server-side: getUserProfile, getCategoriesWithCounts, etc.
  costings.ts               — getUserCostings, saveCostingToSupabase
  analytics.ts              — trackEvent (server-side)
  progress.ts               — getRecipeProgress, saveRecipeProgress
  profile.ts                — updateUserProfile
  supabase/
    admin.ts                — Singleton lazy con service_role (solo en rutas API/server)
    server.ts               — createClient para RSC / Server Actions
    client.ts               — createClient para 'use client'
  email/
    sendActivationEmail.ts  — Resend: envía el link de activación

emails/
  ActivationEmail.tsx       — Plantilla React Email del correo de activación

middleware.ts               — Protege rutas (app), excluye /api/* y assets estáticos
```

---

## Patrón de arquitectura: RSC + Screen

Cada ruta de la app sigue este patrón:

```
page.tsx (RSC)
  → fetch server-side (Supabase, paralelo con Promise.all)
  → <XScreen propA={...} propB={...} />   ← serializable

XScreen.tsx ('use client')
  → estado local, eventos, animaciones
```

**Nunca** importar `getSupabaseAdmin()` desde código cliente. **Nunca** poner `'use client'` en `page.tsx` salvo excepciones justificadas (ej. costeo/custom que es 100% interactivo).

---

## Base de datos Supabase

### Tablas principales

| Tabla | Descripción |
|---|---|
| `profiles` | Perfil del usuario (nombre, moneda preferida, estado) |
| `pending_activations` | Tokens de activación generados por webhook de Hotmart |
| `categories` | Categorías de recetas |
| `recipe_ingredients` | Ingredientes de cada receta |
| `costings` | Costeos guardados por usuario |
| `costing_ingredients` | Detalle de ingredientes por costeo |
| `feature_events` | Analytics: eventos de uso |
| `webhook_events` | Log de webhooks recibidos de Hotmart |

### Esquema `pending_activations`

```sql
create table public.pending_activations (
  id                     uuid primary key default extensions.uuid_generate_v4(),
  email                  text not null,
  hotmart_transaction_id text not null unique,
  activation_token       text not null unique default encode(extensions.gen_random_bytes(32), 'hex'),
  expires_at             timestamp with time zone not null default (now() + interval '72 hours'),
  activated_at           timestamp with time zone,   -- se llena al activar la cuenta
  resend_count           integer not null default 0,
  last_resent_at         timestamp with time zone,
  hotmart_payload        jsonb,
  created_at             timestamp with time zone not null default now(),
  origin                 text not null default 'hotmart'
    check (origin in ('hotmart', 'manual', 'gift'))
);
```

> ⚠️ El campo es `activated_at`, NO `used_at`. El código lo refleja correctamente.

### RPC `activate_user`

Llamada desde `ActivarScreen` después del `signUp` exitoso:

```sql
-- Debe: marcar activated_at, crear/actualizar registro en profiles
select activate_user(
  p_token    := '<hex64>',
  p_user_id  := '<uuid>',
  p_email    := 'email@ejemplo.com',
  p_full_name := 'Nombre'
);
```

---

## Flujo completo de activación

```
1. Usuario compra en Hotmart
        ↓
2. POST /api/webhooks/hotmart  (event: PURCHASE_APPROVED)
   → genera token (randomBytes(32).toString('hex') = 64 chars hex)
   → inserta en pending_activations
   → envía email con link: {APP_URL}/activar?token={token}
        ↓
3. Usuario abre link en correo
   → /activar?token=<64hex>
   → ActivarScreen llama GET /api/auth/validate-token?token=...
   → validate-token busca en pending_activations con service_role
   → si válido: muestra formulario de contraseña
        ↓
4. Usuario completa formulario
   → supabase.auth.signUp({ email, password })
   → supabase.rpc('activate_user', { p_token, p_user_id, p_email, p_full_name })
   → router.push('/dashboard')
```

---

## Variables de entorno (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # NUNCA en código cliente

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000   # https://jabonera.app en prod

# Hotmart
HOTMART_WEBHOOK_SECRET=<secret>            # Para validar firma HMAC-SHA256
HOTMART_SKIP_SIGNATURE=true               # Solo en dev/testing, NUNCA en prod

# Email (Resend)
RESEND_API_KEY=re_...

# Soporte
NEXT_PUBLIC_SUPPORT_WHATSAPP=507XXXXXXXX
```

> ⚠️ Los valores en `.env.local` no deben tener espacios después del `=`.
> Correcto: `SUPABASE_SERVICE_ROLE_KEY=eyJ...`
> Incorrecto: `SUPABASE_SERVICE_ROLE_KEY= eyJ...` ← causa errores silenciosos

---

## PWA

- **Manifest**: `app/manifest.ts` — standalone, tema terracota (#C0604A)
- **Service Worker**: `public/sw.js` — cache-first para imágenes, network-first para páginas
- **Registro**: script inline en `app/layout.tsx` con `'serviceWorker' in navigator`
- **Viewport**: `viewport: 'cover'` para que se vea nativa en iOS

---

## LocalStorage

Esquema versionado en `lib/store.ts`:

```
jabonera_v1_history    — CosteoItem[]
jabonera_v1_currency   — 'USD' | 'MXN' | 'COP' | 'ARS' | ...
jabonera_v1_batch      — number (tamaño de lote por defecto)
```

Todos los reads tienen guard SSR (`if (typeof window === 'undefined') return default`).
Los writes usan `ls?.setItem()` donde `ls = typeof window !== 'undefined' ? localStorage : null`.

---

## Comandos

```bash
npm run dev       # Servidor de desarrollo (Next.js)
npm run build     # Build de producción
npm run start     # Servidor de producción local
npm run lint      # ESLint
```

---

## Notas de desarrollo

- **Middleware**: protege todas las rutas excepto `/`, `/login`, `/activar`, y `/api/*`
- **`getSupabaseAdmin()`**: singleton lazy — solo importar en `app/api/` y `lib/*.ts` server-side
- **`randomBytes`**: viene de `node:crypto`, genera tokens de 64 chars hex (32 bytes)
- **Hotmart en local**: usar ngrok + `HOTMART_SKIP_SIGNATURE=true` para testear webhooks
- **Emails en dev**: revisar Resend dashboard o usar `console.log` del `activationUrl` en el webhook

'use client'

import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/app/TopBar'
import { Icon } from '@/components/app/Icon'
import { RecipeImage } from '@/components/app/RecipeImage'
import { fmtMoney } from '@/lib/pricing'
import type { CosteoDetail } from '@/lib/costings'

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '11px 0', borderBottom: '1px solid rgba(74,55,40,.06)' }}>
      <span className="screen-sub" style={{ fontSize: 13.5, fontWeight: 700 }}>{label}</span>
      <span style={{ fontWeight: 800, fontSize: 14.5, color: highlight ? 'var(--color-clay)' : 'var(--color-bark)' }}>
        {value}
      </span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em',
      color: 'var(--color-muted)', margin: '28px 0 10px' }}>
      {children}
    </h2>
  )
}

const UNIT_LABEL: Record<string, string> = {
  g: 'g', ml: 'ml', drops: 'gotas', tsp: 'cdta', tbsp: 'cda', units: 'u',
}
const u = (unit: string) => UNIT_LABEL[unit] ?? unit

export function CosteoDetailScreen({ costing }: { costing: CosteoDetail }) {
  const router = useRouter()
  const ccy    = costing.currency || 'USD'

  const hasExtras = costing.extraPackaging > 0 || costing.extraLabel > 0 || costing.extraLabor > 0

  return (
    <div className="app-root tex-noise" style={{ background: 'var(--color-cream)' }}>
      <TopBar title="Detalle del costeo" />

      <div className="app-scroll" style={{ padding: '100px 22px 48px' }}>
        <div className="proc-body">

          {/* ── Header card ── */}
          <div className="j-card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
            <RecipeImage
              src={costing.imageUrl}
              gradient={costing.gradient || 'linear-gradient(135deg,var(--color-peach),var(--color-honey))'}
              alt={costing.recipeName}
              variant="thumbnail"
              style={{ width: 64, height: 64, borderRadius: 18, flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 18, lineHeight: 1.2, marginBottom: 5 }}>
                {costing.recipeName}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <span className="j-badge" style={{ background: 'var(--clay-100)', color: 'var(--clay-700)' }}>
                  {costing.date}
                </span>
                {costing.isCustom && (
                  <span className="j-badge" style={{ background: 'var(--peach-50)', color: 'var(--color-clay)' }}>
                    Personalizado
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Resumen ── */}
          <SectionTitle>Resumen</SectionTitle>
          <div className="j-card" style={{ padding: '4px 16px' }}>
            <Row label="Moneda"            value={ccy} />
            <Row label="Lote (jabones)"    value={`${costing.batchSize} unidades`} />
            <Row label="Costo del lote"    value={fmtMoney(costing.totalBatchCost, ccy)} />
            <Row label="Costo por unidad"  value={fmtMoney(costing.costPerUnit, ccy)} />
            <Row label="Margen de ganancia" value={`${costing.selectedMargin}%`} />
            <Row label="Ganancia por unidad" value={fmtMoney(costing.profitPerUnit, ccy)} />
            <Row label="Precio de venta"   value={fmtMoney(costing.suggestedPrice, ccy)} highlight />
          </div>

          {/* ── Ingredientes ── */}
          {costing.ingredients.length > 0 && (
            <>
              <SectionTitle>Ingredientes</SectionTitle>
              <div className="j-card" style={{ padding: '4px 0', overflow: 'hidden' }}>
                {costing.ingredients.map((ing, i) => (
                  <div key={ing.id} style={{
                    padding: '13px 16px',
                    borderBottom: i < costing.ingredients.length - 1 ? '1px solid rgba(74,55,40,.06)' : 'none',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 14.5, flex: 1 }}>{ing.name}</span>
                      <span style={{ fontWeight: 900, fontSize: 14.5, color: 'var(--color-clay)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {fmtMoney(ing.costCalculated, ccy)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 5, flexWrap: 'wrap' }}>
                      <span className="screen-sub" style={{ fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="layers" size={13} color="var(--color-muted)" />
                        Usaste {ing.usedAmount} {u(ing.usedUnit)}
                      </span>
                      <span className="screen-sub" style={{ fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="calc" size={13} color="var(--color-muted)" />
                        {fmtMoney(ing.pricePaid, ccy)} por {ing.buyQty} {u(ing.buyUnit)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Costos adicionales ── */}
          {hasExtras && (
            <>
              <SectionTitle>Costos adicionales</SectionTitle>
              <div className="j-card" style={{ padding: '4px 16px' }}>
                {costing.extraPackaging > 0 && <Row label="Empaque"       value={fmtMoney(costing.extraPackaging, ccy)} />}
                {costing.extraLabel > 0     && <Row label="Etiqueta"      value={fmtMoney(costing.extraLabel, ccy)} />}
                {costing.extraLabor > 0     && <Row label="Mano de obra"  value={fmtMoney(costing.extraLabor, ccy)} />}
              </div>
            </>
          )}

          {/* ── Back button ── */}
          <button
            onClick={() => router.push('/historial')}
            style={{ width: '100%', marginTop: 32, padding: '14px 0', border: 'none', borderRadius: 14,
              background: 'var(--clay-100)', color: 'var(--clay-700)', fontWeight: 800, fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
            <Icon name="arrowL" size={18} color="var(--clay-700)" />
            Volver al historial
          </button>

        </div>{/* proc-body */}
      </div>
    </div>
  )
}

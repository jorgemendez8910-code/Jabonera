'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/components/app/StoreProvider'
import { TopBar } from '@/components/app/TopBar'
import { JButton } from '@/components/app/JButton'
import { Icon } from '@/components/app/Icon'
import {
  scaleAmount, usedInCostUnit, ingredientCost, suggestedPrice,
  unitOptionsFor, unitFactor, fmtMoney, fmtAmount, currencyByCode,
  MARGINS, CURRENCIES,
} from '@/lib/pricing'
import type { Margin } from '@/lib/pricing'
import { saveCostingToSupabase } from '@/lib/costings'
import { trackEvent } from '@/lib/analytics'
import type { Recipe } from '@/lib/recipes'

// ─── shared sub-components ────────────────────────────────────

function MoneyInput({ value, onChange, symbol = '$' }: { value: string; onChange: (v: string) => void; symbol?: string }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--color-muted)', fontSize: 14 }}>{symbol}</span>
      <input className="j-input" inputMode="decimal" value={value} placeholder="0.00"
        onChange={e => onChange(e.target.value.replace(/[^\d.]/g, ''))}
        onFocus={e => e.target.select()}
        style={{ paddingLeft: 10 + Math.max(symbol.length, 1) * 9, textAlign: 'right', fontWeight: 800 }} />
    </div>
  )
}

function QtyInput({ value, onChange, unitKey, onUnitChange, options }: {
  value: string; onChange: (v: string) => void
  unitKey: string; onUnitChange: (u: string) => void
  options: { key: string; label: string }[]
}) {
  return (
    <div style={{ position: 'relative' }}>
      <input className="j-input" inputMode="decimal" value={value}
        onChange={e => onChange(e.target.value.replace(/[^\d.]/g, ''))}
        onFocus={e => e.target.select()}
        style={{ paddingRight: 82, textAlign: 'right', fontWeight: 800 }} />
      <select value={unitKey} onChange={e => onUnitChange(e.target.value)}
        style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
          border: 'none', background: 'var(--color-cream)', borderRadius: 8, padding: '5px 4px 5px 7px',
          fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 13, color: 'var(--color-bark)', cursor: 'pointer', minWidth: 64 }}>
        {options.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
      </select>
    </div>
  )
}

function CurrencyPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="j-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--clay-100)', display: 'grid', placeItems: 'center' }}>
        <Icon name="calc" size={16} color="var(--color-clay)" />
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 13.5 }}>Moneda</div>
        <div className="screen-sub" style={{ fontSize: 11.5 }}>Aplica a precios y resultados</div>
      </div>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ border: '1.5px solid rgba(74,55,40,.14)', background: '#fff', borderRadius: 10, padding: '8px 10px',
          fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 14, color: 'var(--color-bark)', cursor: 'pointer' }}>
        {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} · {c.code}</option>)}
      </select>
    </div>
  )
}

interface CalcResult {
  ingredientCosts: { id: string; name: string; cost: number }[]
  extraTotal: number
  totalBatchCost: number
  costPerUnit: number
  price: number
  profit: number
  filledCount: number
}

function ResultsPanel({ calc, batch, ccy, margin, setMargin, customOn, setCustomOn, customMargin, setCustomMargin, effectiveMargin, onSave, saving, saveDisabled }: {
  calc: CalcResult; batch: number; ccy: string
  margin: number; setMargin: (n: number) => void
  customOn: boolean; setCustomOn: (b: boolean) => void
  customMargin: string; setCustomMargin: (s: string) => void
  effectiveMargin: number; onSave: () => void; saving?: boolean; saveDisabled?: boolean
  fmtMoney?: never // imported directly
}) {
  const disabled = (saveDisabled ?? calc.filledCount === 0) || saving
  return (
    <div className="costeo-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div className="screen-sub" style={{ fontSize: 11.5, fontWeight: 800, lineHeight: 1.2 }}>Costo de hacer<br/>cada jabón</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, marginTop: 2 }}>{fmtMoney(calc.costPerUnit, ccy)}</div>
          <div className="screen-sub" style={{ fontSize: 11 }}>lote de {batch}: {fmtMoney(calc.totalBatchCost, ccy)}</div>
        </div>
        <div style={{ width: 1, background: 'rgba(74,55,40,.1)' }} />
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div className="screen-sub" style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--color-clay)', lineHeight: 1.2 }}>Vende cada<br/>jabón a</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, color: 'var(--color-clay)', marginTop: 2 }}>{fmtMoney(calc.price, ccy)}</div>
          <div className="screen-sub" style={{ fontSize: 11 }}>ganancia {effectiveMargin}%</div>
        </div>
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 7 }}>
        Porcentaje de ganancia
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {MARGINS.map((m: Margin) => {
          const active = !customOn && margin === m.key
          return (
            <button key={m.key} onClick={() => { setCustomOn(false); setMargin(m.key) }}
              style={{ flex: 1, padding: '8px 4px', borderRadius: 12, border: active ? 'none' : '1.5px solid rgba(74,55,40,.12)',
                background: active ? 'var(--color-bark)' : '#fff', color: active ? '#fff' : 'var(--color-bark)',
                fontWeight: 800, fontSize: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span className="j-dot" style={{ background: m.dot, width: 7, height: 7 }} />
              {m.label}
              <span style={{ fontSize: 10, opacity: .7 }}>{m.key}%</span>
            </button>
          )
        })}
        <button onClick={() => { setCustomOn(true); if (!customMargin) setCustomMargin('50') }}
          style={{ flex: 1, padding: '8px 4px', borderRadius: 12, border: customOn ? 'none' : '1.5px solid rgba(74,55,40,.12)',
            background: customOn ? 'var(--color-clay)' : '#fff', color: customOn ? '#fff' : 'var(--color-bark)',
            fontWeight: 800, fontSize: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Icon name="plus" size={11} color={customOn ? '#fff' : 'var(--color-clay)'} stroke={3} />
          Mío
          <span style={{ fontSize: 10, opacity: .7 }}>%</span>
        </button>
      </div>
      {customOn && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <label style={{ fontSize: 12.5, fontWeight: 800 }}>Mi % de ganancia</label>
          <div style={{ flex: 1, position: 'relative' }}>
            <input className="j-input" inputMode="decimal" value={customMargin}
              onChange={e => setCustomMargin(e.target.value.replace(/[^\d.]/g, ''))}
              onFocus={e => e.target.select()}
              placeholder="50" style={{ paddingRight: 32, textAlign: 'right', fontWeight: 800, padding: '10px 32px 10px 12px' }} />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--color-muted)' }}>%</span>
          </div>
        </div>
      )}
      <p style={{ fontSize: 12.5, color: 'var(--color-muted)', margin: '0 0 12px', textAlign: 'center', minHeight: 16 }}>
        {calc.profit > 0
          ? <span>Ganarías <b style={{ color: 'var(--diff-easy)' }}>{fmtMoney(calc.profit, ccy)}</b> por cada jabón.</span>
          : 'Llena los precios para ver tu margen.'}
      </p>
      <JButton block onClick={onSave} icon="save" disabled={disabled}>{saving ? 'Guardando…' : 'Guardar este costeo'}</JButton>
    </div>
  )
}

// ─── Saved confirmation screen ─────────────────────────────────
function CosteoSaved({ recipe, batch, calc, margin, ccy }: {
  recipe: { name: string; gradient?: string }
  batch: number; calc: CalcResult; margin: number; ccy: string
}) {
  const router = useRouter()
  return (
    <div className="app-root" style={{ background: 'linear-gradient(180deg, var(--color-cream), var(--sage-50))' }}>
      <div className="app-scroll" style={{ padding: '0 26px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100%', textAlign: 'center' }}>
        <div className="task-center-inner">
        <div className="pop-in" style={{ width: 88, height: 88, borderRadius: '50%', margin: '0 auto 20px', background: 'var(--color-sage)', display: 'grid', placeItems: 'center' }}>
          <Icon name="check" size={44} color="#fff" stroke={3} />
        </div>
        <h1 className="screen-h1" style={{ fontSize: 28, marginBottom: 8 }}>¡Costeo guardado!</h1>
        <p className="screen-sub" style={{ marginBottom: 22 }}>Ya sabes exactamente cuánto cobrar. 🎯</p>
        <div className="j-card" style={{ padding: 20, textAlign: 'left' }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>{recipe.name}</div>
          {([['Lote', `${batch} jabones`], ['Costo de cada jabón', fmtMoney(calc.costPerUnit, ccy)], ['Costo del lote', fmtMoney(calc.totalBatchCost, ccy)], ['Ganancia', `${margin}%`]] as [string,string][]).map(([k,v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(74,55,40,.07)', fontSize: 14.5 }}>
              <span className="screen-sub" style={{ fontWeight: 700 }}>{k}</span><span style={{ fontWeight: 800 }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, alignItems: 'center' }}>
            <span style={{ fontWeight: 800 }}>Precio de venta por jabón</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--color-clay)' }}>{fmtMoney(calc.price, ccy)}</span>
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <JButton block onClick={() => router.push('/historial')}>Ver historial</JButton>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', marginTop: 14, color: 'var(--color-muted)', fontWeight: 800, fontSize: 14.5 }}>Hacer otra receta</button>
        </div>
        </div>{/* task-center-inner */}
      </div>
    </div>
  )
}

// ─── Main screen ───────────────────────────────────────────────
export function CosteoScreen({ recipe }: { recipe: Recipe }) {
  const router  = useRouter()
  const store   = useStore()
  const batch   = store.batchSize || recipe.baseUnits || 8
  const ccy     = store.currency || 'USD'

  const [prices,      setPrices]      = useState<Record<string, string>>({})
  const [qtys,        setQtys]        = useState<Record<string, string>>(() => Object.fromEntries(recipe.ingredients.map(i => [i.id, String(i.buyQty)])))
  const [qtyUnits,    setQtyUnits]    = useState<Record<string, string>>(() => Object.fromEntries(recipe.ingredients.map(i => [i.id, i.buyUnit])))
  const [extras,      setExtras]      = useState({ empaque: '', etiqueta: '', mano: '' })
  const [showExtras,  setShowExtras]  = useState(false)
  const [margin,      setMargin]      = useState(60)
  const [customOn,    setCustomOn]    = useState(false)
  const [customMargin,setCustomMargin]= useState('')
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)

  const effectiveMargin = customOn ? (parseFloat(customMargin) || 0) : margin

  useEffect(() => {
    void trackEvent('costing_started', { recipeId: recipe.id, isCustom: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scaled = useMemo(() => recipe.ingredients.map(ing => ({
    ...ing,
    used: scaleAmount(ing.baseAmount, recipe.baseUnits, batch),
    usedCost: usedInCostUnit(ing, scaleAmount(ing.baseAmount, recipe.baseUnits, batch)),
  })), [recipe, batch])

  const calc = useMemo<CalcResult>(() => {
    let ingTotal = 0
    const ingredientCosts = scaled.map(ing => {
      const paid  = parseFloat(prices[ing.id]) || 0
      const qty   = parseFloat(qtys[ing.id])   || 0
      const qtyInCost = qty * unitFactor(ing.costUnit, qtyUnits[ing.id] || ing.buyUnit)
      const cost  = ingredientCost(ing.usedCost, qtyInCost, paid)
      ingTotal += cost
      return { id: ing.id, name: ing.name, cost }
    })
    const extraTotal      = (Object.values(extras) as string[]).reduce((s, v) => s + (parseFloat(v) || 0), 0)
    const totalBatchCost  = ingTotal + extraTotal
    const costPerUnit     = batch ? totalBatchCost / batch : 0
    const price           = suggestedPrice(costPerUnit, effectiveMargin)
    const profit          = price - costPerUnit
    const filledCount     = Object.values(prices).filter(v => parseFloat(v) > 0).length
    return { ingredientCosts, extraTotal, totalBatchCost, costPerUnit, price, profit, filledCount }
  }, [scaled, prices, qtys, qtyUnits, extras, effectiveMargin, batch])

  const save = async () => {
    setSaving(true)
    const result = await saveCostingToSupabase({
      recipeId: recipe.id,
      recipeName: recipe.name,
      batchSize: batch,
      currency: ccy,
      totalBatchCost: calc.totalBatchCost,
      costPerUnit: calc.costPerUnit,
      selectedMargin: effectiveMargin,
      suggestedPrice: calc.price,
      isCustom: false,
      gradient: recipe.gradient,
      imageUrl: recipe.imageUrl,
      extraPackaging: parseFloat(extras.empaque)  || 0,
      extraLabel:     parseFloat(extras.etiqueta) || 0,
      extraLabor:     parseFloat(extras.mano)     || 0,
      ingredients: scaled.map(ing => ({
        ingredientId:   ing.id,
        name:           ing.name,
        usedAmount:     ing.used,
        usedUnit:       ing.unit,
        buyQty:         parseFloat(qtys[ing.id]) || ing.buyQty,
        buyUnit:        qtyUnits[ing.id] || ing.buyUnit,
        pricePaid:      parseFloat(prices[ing.id]) || 0,
        costCalculated: calc.ingredientCosts.find(c => c.id === ing.id)?.cost ?? 0,
      })),
    })
    setSaving(false)
    if (result.error) return
    void trackEvent('costing_saved', { recipeId: recipe.id, totalBatchCost: calc.totalBatchCost })
    setSaved(true)
  }

  if (saved) return <CosteoSaved recipe={recipe} batch={batch} calc={calc} margin={effectiveMargin} ccy={ccy} />

  const ccySymbol = currencyByCode(ccy).symbol

  return (
    <div className="app-root costeo-root" style={{ background: 'var(--color-cream)' }}>
      <TopBar title="Calcular precio" />
      <div className="app-scroll" style={{ padding: '108px 22px 320px' }}>
        <p className="screen-sub" style={{ marginBottom: 14, fontSize: 14.5 }}>
          Cuéntame qué compraste y cuánto pagaste. Yo calculo tu precio justo. 💛
        </p>
        <div style={{ marginBottom: 18 }}>
          <CurrencyPicker value={ccy} onChange={store.setCurrency} />
        </div>
        <h3 style={{ fontSize: 17, marginBottom: 4 }}>Tus ingredientes</h3>
        <p className="screen-sub" style={{ fontSize: 12.5, marginBottom: 12 }}>Cambia la cantidad y la unidad según lo que compraste.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {scaled.map(ing => {
            const cost = calc.ingredientCosts.find(c => c.id === ing.id)?.cost ?? 0
            return (
              <div key={ing.id} className="j-card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 22 }}>{ing.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{ing.name}</div>
                    <div className="screen-sub" style={{ fontSize: 12.5 }}>Usas {fmtAmount(ing.used)} {ing.unit === 'drops' ? 'gotas' : ing.unit}</div>
                  </div>
                  {cost > 0 && <span style={{ fontWeight: 900, color: 'var(--color-clay)', fontSize: 15 }}>{fmtMoney(cost, ccy)}</span>}
                </div>
                <label className="screen-sub" style={{ fontSize: 12.5, fontWeight: 700, display: 'block', marginBottom: 7 }}>¿Cuánto pagaste y por cuánto?</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1 }}><MoneyInput symbol={ccySymbol} value={prices[ing.id] || ''} onChange={v => setPrices(p => ({ ...p, [ing.id]: v }))} /></div>
                  <span style={{ fontWeight: 800, color: 'var(--color-muted)', fontSize: 13 }}>por</span>
                  <div style={{ flex: 1.1 }}>
                    <QtyInput value={qtys[ing.id] || ''} unitKey={qtyUnits[ing.id] || ing.buyUnit}
                      onChange={v => setQtys(q => ({ ...q, [ing.id]: v }))}
                      onUnitChange={u => setQtyUnits(q => ({ ...q, [ing.id]: u }))}
                      options={unitOptionsFor(ing.costUnit)} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* extra costs */}
        <button onClick={() => setShowExtras(s => !s)} className="j-card"
          style={{ width: '100%', border: 'none', textAlign: 'left', padding: 16, marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--peach-50)', display: 'grid', placeItems: 'center' }}>
            <Icon name="plus" size={18} color="var(--color-clay)" />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Costos adicionales</div>
            <div className="screen-sub" style={{ fontSize: 12.5 }}>Empaque, etiqueta, tu tiempo (opcional)</div>
          </div>
          <Icon name="chevD" size={20} color="var(--color-muted)" style={{ transform: showExtras ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        </button>
        {showExtras && (
          <div className="j-card pop-in" style={{ padding: 16, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(['empaque','etiqueta','mano'] as const).map(k => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ flex: 1, fontWeight: 700, fontSize: 14.5 }}>{{ empaque: 'Empaque', etiqueta: 'Etiqueta', mano: 'Mano de obra estimada' }[k]}</span>
                <div style={{ width: 130 }}><MoneyInput symbol={ccySymbol} value={extras[k]} onChange={v => setExtras(e => ({ ...e, [k]: v }))} /></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ResultsPanel calc={calc} batch={batch} ccy={ccy}
        margin={margin} setMargin={setMargin}
        customOn={customOn} setCustomOn={setCustomOn}
        customMargin={customMargin} setCustomMargin={setCustomMargin}
        effectiveMargin={effectiveMargin} onSave={save} saving={saving} />
    </div>
  )
}

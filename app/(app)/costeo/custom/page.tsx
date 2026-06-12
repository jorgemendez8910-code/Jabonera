'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/components/app/StoreProvider'
import { TopBar } from '@/components/app/TopBar'
import { JButton } from '@/components/app/JButton'
import { Icon } from '@/components/app/Icon'
import { suggestedPrice, fmtMoney, currencyByCode, MARGINS, ALL_UNITS, CURRENCIES } from '@/lib/pricing'
import type { Margin } from '@/lib/pricing'
import { saveCostingToSupabase } from '@/lib/costings'
import type { CosteoIngredientInput } from '@/lib/costings'
import { trackEvent } from '@/lib/analytics'

const CUSTOM_GRADIENT = 'linear-gradient(135deg, var(--color-clay), var(--color-bark))'

let seq = 0
const nextId = () => `r${++seq}_${Date.now().toString(36)}`

interface Row { id: string; name: string; icon: string; used: string; buyQty: string; unit: string; price: string }
const DEFAULT_ROWS = (): Row[] => [
  { id: nextId(), name: 'Base de glicerina', icon: '🧴', used: '500', buyQty: '1000', unit: 'g',  price: '' },
  { id: nextId(), name: 'Fragancia',          icon: '🌸', used: '8',   buyQty: '30',   unit: 'ml', price: '' },
  { id: nextId(), name: 'Colorante',          icon: '🎨', used: '5',   buyQty: '30',   unit: 'ml', price: '' },
]

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

function RowEditor({ row, onChange, onDelete, ccySymbol }: { row: Row; onChange: (r: Row) => void; onDelete: () => void; ccySymbol: string }) {
  const set = (k: keyof Row, v: string) => onChange({ ...row, [k]: v })
  return (
    <div className="j-card" style={{ padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 22 }}>{row.icon}</span>
        <input className="j-input" value={row.name} placeholder="Nombre del ingrediente"
          onChange={e => set('name', e.target.value)}
          style={{ flex: 1, padding: '10px 12px', fontSize: 14.5 }} />
        <button onClick={onDelete} aria-label="Eliminar" style={{ background: 'none', border: 'none', padding: 6 }}>
          <Icon name="trash" size={18} color="var(--color-muted)" />
        </button>
      </div>
      <label className="screen-sub" style={{ fontSize: 12.5, fontWeight: 700, display: 'block', marginBottom: 6 }}>Usaste</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input className="j-input" inputMode="decimal" value={row.used} placeholder="0"
            onChange={e => set('used', e.target.value.replace(/[^\d.]/g, ''))}
            onFocus={e => e.target.select()}
            style={{ paddingRight: 82, textAlign: 'right', fontWeight: 800 }} />
          <select value={row.unit} onChange={e => set('unit', e.target.value)}
            style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
              border: 'none', background: 'var(--color-cream)', borderRadius: 8, padding: '5px 4px 5px 7px',
              fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 13, color: 'var(--color-bark)', cursor: 'pointer', minWidth: 64 }}>
            {ALL_UNITS.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
        </div>
      </div>
      <label className="screen-sub" style={{ fontSize: 12.5, fontWeight: 700, display: 'block', marginBottom: 6 }}>¿Cuánto pagaste y por cuánto?</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1 }}><MoneyInput symbol={ccySymbol} value={row.price} onChange={v => set('price', v)} /></div>
        <span style={{ fontWeight: 800, color: 'var(--color-muted)', fontSize: 13 }}>por</span>
        <div style={{ flex: 1, position: 'relative' }}>
          <input className="j-input" inputMode="decimal" value={row.buyQty} placeholder="0"
            onChange={e => set('buyQty', e.target.value.replace(/[^\d.]/g, ''))}
            onFocus={e => e.target.select()}
            style={{ paddingRight: 60, textAlign: 'right', fontWeight: 800 }} />
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            fontWeight: 800, fontSize: 13, color: 'var(--color-muted)' }}>
            {ALL_UNITS.find(u => u.key === row.unit)?.label}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function CustomCosteoPage() {
  const router = useRouter()
  const store  = useStore()
  const ccy    = store.currency || 'USD'
  const ccySymbol = currencyByCode(ccy).symbol

  const [customName,   setCustomName]   = useState('')
  const [batch,        setBatch]        = useState(store.batchSize || 8)
  const [rows,         setRows]         = useState<Row[]>(DEFAULT_ROWS)
  const [extras,       setExtras]       = useState({ empaque: '', etiqueta: '', mano: '' })
  const [showExtras,   setShowExtras]   = useState(false)
  const [margin,       setMargin]       = useState(60)
  const [customOn,     setCustomOn]     = useState(false)
  const [customMargin, setCustomMargin] = useState('')
  const [saved,        setSaved]        = useState(false)
  const [saving,       setSaving]       = useState(false)

  useEffect(() => {
    void trackEvent('costing_started', { isCustom: true })
  }, [])

  const effectiveMargin = customOn ? (parseFloat(customMargin) || 0) : margin

  const calc = useMemo(() => {
    let ingTotal = 0
    rows.forEach(r => {
      const used   = parseFloat(r.used)   || 0
      const buyQty = parseFloat(r.buyQty) || 0
      const price  = parseFloat(r.price)  || 0
      if (buyQty && price) ingTotal += (used / buyQty) * price
    })
    const extraTotal     = (Object.values(extras) as string[]).reduce((s, v) => s + (parseFloat(v) || 0), 0)
    const totalBatchCost = ingTotal + extraTotal
    const costPerUnit    = batch ? totalBatchCost / batch : 0
    const price          = suggestedPrice(costPerUnit, effectiveMargin)
    const profit         = price - costPerUnit
    const filledCount    = rows.filter(r => parseFloat(r.price) > 0 && parseFloat(r.buyQty) > 0).length
    return { totalBatchCost, costPerUnit, price, profit, filledCount }
  }, [rows, extras, effectiveMargin, batch])

  const save = async () => {
    setSaving(true)
    const ingredients: CosteoIngredientInput[] = rows
      .filter(r => parseFloat(r.price) > 0 && parseFloat(r.buyQty) > 0)
      .map(r => {
        const used   = parseFloat(r.used)   || 0
        const buyQty = parseFloat(r.buyQty) || 0
        const price  = parseFloat(r.price)  || 0
        return {
          ingredientId: r.id,
          name: r.name || 'Ingrediente',
          usedAmount: used,
          usedUnit: r.unit,
          buyQty,
          buyUnit: r.unit,
          pricePaid: price,
          costCalculated: buyQty ? (used / buyQty) * price : 0,
        }
      })

    const result = await saveCostingToSupabase({
      recipeId: null,
      recipeName: customName.trim() || 'Costeo personalizado',
      batchSize: batch,
      currency: ccy,
      totalBatchCost: calc.totalBatchCost,
      costPerUnit: calc.costPerUnit,
      selectedMargin: effectiveMargin,
      suggestedPrice: calc.price,
      isCustom: true,
      gradient: CUSTOM_GRADIENT,
      extraPackaging: parseFloat(extras.empaque) || 0,
      extraLabel: parseFloat(extras.etiqueta) || 0,
      extraLabor: parseFloat(extras.mano) || 0,
      ingredients,
    })

    setSaving(false)
    if (result.error) return
    void trackEvent('costing_saved', { isCustom: true, recipeId: 'custom' })
    setSaved(true)
  }

  if (saved) {
    return (
      <div className="app-root" style={{ background: 'linear-gradient(180deg, var(--color-cream), var(--sage-50))' }}>
        <div className="app-scroll" style={{ padding: '0 26px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100%', textAlign: 'center' }}>
          <div className="task-center-inner">
          <div className="pop-in" style={{ width: 88, height: 88, borderRadius: '50%', margin: '0 auto 20px', background: 'var(--color-sage)', display: 'grid', placeItems: 'center' }}>
            <Icon name="check" size={44} color="#fff" stroke={3} />
          </div>
          <h1 className="screen-h1" style={{ fontSize: 28, marginBottom: 8 }}>¡Costeo guardado!</h1>
          <p className="screen-sub" style={{ marginBottom: 22 }}>Ya sabes exactamente cuánto cobrar. 🎯</p>
          <div style={{ marginTop: 24 }}>
            <JButton block onClick={() => router.push('/historial')}>Ver historial</JButton>
            <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', marginTop: 14, color: 'var(--color-muted)', fontWeight: 800, fontSize: 14.5 }}>Hacer otra receta</button>
          </div>
          </div>{/* task-center-inner */}
        </div>
      </div>
    )
  }

  return (
    <div className="app-root costeo-root" style={{ background: 'var(--color-cream)' }}>
      <TopBar title="Costeo personalizado" />
      <div className="app-scroll" style={{ padding: '108px 22px 320px' }}>
        <p className="screen-sub" style={{ marginBottom: 14, fontSize: 14.5 }}>
          Agrega tus propios ingredientes con sus cantidades y precios. Yo hago el cálculo. 💛
        </p>

        {/* name */}
        <div className="j-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--peach-50)', display: 'grid', placeItems: 'center', fontSize: 16 }}>✏️</span>
          <input
            className="j-input"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            placeholder="Nombre del costeo"
            style={{ flex: 1, padding: '10px 12px', fontSize: 14.5, fontWeight: 700 }}
          />
        </div>

        {/* currency */}
        <div className="j-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--clay-100)', display: 'grid', placeItems: 'center' }}>
            <Icon name="calc" size={16} color="var(--color-clay)" />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 13.5 }}>Moneda</div>
          </div>
          <select value={ccy} onChange={e => store.setCurrency(e.target.value)}
            style={{ border: '1.5px solid rgba(74,55,40,.14)', background: '#fff', borderRadius: 10, padding: '8px 10px',
              fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 14, color: 'var(--color-bark)', cursor: 'pointer' }}>
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} · {c.code}</option>)}
          </select>
        </div>

        {/* batch */}
        <div className="j-card" style={{ padding: '14px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--peach-50)', display: 'grid', placeItems: 'center', fontSize: 18 }}>🧼</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 13.5 }}>¿Cuántos jabones?</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setBatch(b => Math.max(1, b - 1))} aria-label="Disminuir cantidad"
              style={{ width: 34, height: 34, borderRadius: 10, border: '1.5px solid rgba(74,55,40,.14)', background: '#fff', display: 'grid', placeItems: 'center' }}>
              <Icon name="minus" size={16} color="var(--color-clay)" stroke={2.6} />
            </button>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, minWidth: 32, textAlign: 'center' }}>{batch}</span>
            <button onClick={() => setBatch(b => Math.min(120, b + 1))} aria-label="Aumentar cantidad"
              style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: 'var(--color-clay)', display: 'grid', placeItems: 'center' }}>
              <Icon name="plus" size={16} color="#fff" stroke={2.6} />
            </button>
          </div>
        </div>

        <h3 style={{ fontSize: 17, marginBottom: 12 }}>Tus ingredientes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map(r => (
            <RowEditor key={r.id} row={r} ccySymbol={ccySymbol}
              onChange={updated => setRows(rs => rs.map(x => x.id === r.id ? updated : x))}
              onDelete={() => setRows(rs => rs.filter(x => x.id !== r.id))} />
          ))}
        </div>
        <button onClick={() => setRows(rs => [...rs, { id: nextId(), name: '', icon: '🧪', used: '', buyQty: '', unit: 'g', price: '' }])}
          className="j-card"
          style={{ width: '100%', border: '1.5px dashed rgba(196,132,108,.4)', textAlign: 'center', padding: 14, marginTop: 12,
            background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            color: 'var(--color-clay)', fontWeight: 800, fontSize: 14.5, boxShadow: 'none' }}>
          <Icon name="plus" size={18} color="var(--color-clay)" stroke={2.6} /> Agregar ingrediente
        </button>

        {/* extras */}
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
                <span style={{ flex: 1, fontWeight: 700, fontSize: 14.5 }}>{{ empaque:'Empaque', etiqueta:'Etiqueta', mano:'Mano de obra' }[k]}</span>
                <div style={{ width: 130 }}><MoneyInput symbol={ccySymbol} value={extras[k]} onChange={v => setExtras(e => ({ ...e, [k]: v }))} /></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* results panel */}
      <div className="costeo-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div className="screen-sub" style={{ fontSize: 11.5, fontWeight: 800, lineHeight: 1.2 }}>Costo por jabón</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, marginTop: 2 }}>{fmtMoney(calc.costPerUnit, ccy)}</div>
          </div>
          <div style={{ width: 1, background: 'rgba(74,55,40,.1)' }} />
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div className="screen-sub" style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--color-clay)', lineHeight: 1.2 }}>Vende a</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, color: 'var(--color-clay)', marginTop: 2 }}>{fmtMoney(calc.price, ccy)}</div>
          </div>
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
            Mío <span style={{ fontSize: 10, opacity: .7 }}>%</span>
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
        <JButton block onClick={save} icon="save" disabled={calc.filledCount === 0 || saving}>
          {saving ? 'Guardando…' : 'Guardar este costeo'}
        </JButton>
      </div>
    </div>
  )
}

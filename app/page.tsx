// RSC — static content + small client islands for interactivity
import Image from 'next/image'
import Link from 'next/link'
import { Nav } from '@/components/landing/Nav'
import { CountUp } from '@/components/landing/CountUp'
import { Reveal } from '@/components/landing/Reveal'
import { Logo } from '@/components/app/Logo'
import './landing.css'

// Hoisted static JSX (skill: rendering-hoist-jsx)
const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
)
const ArrowDown = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M6 13l6 6 6-6"/>
  </svg>
)
const Shield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3zM9 12l2 2 4-4"/>
  </svg>
)

export default function LandingPage() {
  return (
    <div className="lp">
      {/* NAV — client island for hamburger */}
      <Nav />

      {/* 1 · HERO */}
      <section className="hero">
        <div className="wrap">
          <Reveal className="in">
            <span className="eyebrow">Para emprendedoras del jabón artesanal</span>
            <h1>Tu receta favorita. Tu <em>primer precio de venta</em>. En minutos.</h1>
            <p className="lead">Jabonera no es otro ebook. Es una herramienta viva que escala tus recetas, te guía paso a paso y te dice exactamente cuánto cobrar.</p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#precio">Quiero empezar <ArrowRight /></a>
              <a className="btn btn-ghost"   href="#como">Ver cómo funciona <ArrowDown /></a>
            </div>
            <div className="hero-trust">
              <div className="avatars">
                <span style={{ background: 'var(--color-sage)' }}>🌿</span>
                <span style={{ background: 'var(--color-blush)' }}>🌸</span>
                <span style={{ background: 'var(--color-honey)' }}>✨</span>
                <span style={{ background: 'var(--color-lavender)' }}>🎉</span>
              </div>
              Hecho con emprendedoras reales de Latinoamérica
            </div>
          </Reveal>
          <div className="hero-device reveal in">
            <div className="float-card float-1">
              <span className="ic" style={{ background: 'var(--clay-100)' }}>💰</span>
              Precio sugerido<br />listo
            </div>
            <div className="float-card float-2">
              <span className="ic" style={{ background: 'var(--sage-50)' }}>✓</span>
              Paso 3 de 8
            </div>
            <Image
              src="/mock/dev01.png"
              alt="Dashboard de la app Jabonera"
              width={300}
              height={580}
              style={{ width: 240, maxWidth: '70vw', height: 'auto' }}
              priority
            />
          </div>
        </div>
      </section>

      {/* 2 · CREDIBILITY */}
      <section className="credbar">
        <div className="wrap">
          <div className="stat">
            <div className="num"><CountUp to={87} />%</div>
            <div className="lbl">ya hacía jabones antes de empezar</div>
          </div>
          <div className="stat">
            <div className="num"><CountUp to={100} />%</div>
            <div className="lbl">quería emprender con su producto</div>
          </div>
          <div className="stat stat-q">
            <div className="num">¿precio?</div>
            <div className="lbl">la pregunta que más cuesta responder al emprender</div>
          </div>
        </div>
      </section>

      {/* 3 · PROBLEM */}
      <section className="pad problem">
        <div className="wrap">
          <Reveal>
            <div className="sec-head">
              <span className="eyebrow">¿Te suena familiar?</span>
              <h2>Sabes hacer jabones. El negocio es otra historia.</h2>
            </div>
          </Reveal>
          <div className="cards-3">
            <Reveal><div className="pain"><div className="emoji">💸</div><h3>&ldquo;Vendo sin saber si gano o pierdo.&rdquo;</h3></div></Reveal>
            <Reveal><div className="pain"><div className="emoji">📦</div><h3>&ldquo;No sé cómo presentar mis jabones.&rdquo;</h3></div></Reveal>
            <Reveal><div className="pain"><div className="emoji">😰</div><h3>&ldquo;Me da miedo poner precio, por si es mucho o muy poco.&rdquo;</h3></div></Reveal>
          </div>
        </div>
      </section>

      {/* 4 · HOW IT WORKS */}
      <section className="pad" id="como">
        <div className="wrap">
          <Reveal>
            <div className="sec-head">
              <span className="eyebrow">Cómo funciona</span>
              <h2>De la receta al precio en tres pasos</h2>
            </div>
          </Reveal>
          <div className="steps">
            <Reveal><div className="step"><div className="circle">🧼<span className="n">1</span></div><h3>Elige tu jabón</h3><p>Ves los ingredientes ajustados a las unidades que quieres hacer, al instante.</p></div></Reveal>
            <Reveal><div className="step"><div className="circle">📖<span className="n">2</span></div><h3>Sigue el proceso guiado</h3><p>Paso a paso, con tips de instructora, como si tuvieras una al lado.</p></div></Reveal>
            <Reveal><div className="step"><div className="circle">💰<span className="n">3</span></div><h3>Calcula tu precio</h3><p>Sabe exactamente cuánto cobrar, con el margen de ganancia que elijas.</p></div></Reveal>
          </div>
        </div>
      </section>

      {/* 5 · FEATURES */}
      <section className="pad problem" id="features" style={{ background: 'var(--peach-50)' }}>
        <div className="wrap">
          <Reveal>
            <div className="sec-head">
              <span className="eyebrow">Todo en un solo lugar</span>
              <h2>Una herramienta, no un documento</h2>
            </div>
          </Reveal>
          <div className="feat-grid">
            <Reveal><div className="feat"><div className="ic" style={{ background: 'var(--sage-50)' }}>📐</div><h3>Recetas escalables</h3><p>No son fijas. Ajusta a 4, 8, 24 o las unidades que necesites.</p></div></Reveal>
            <Reveal><div className="feat"><div className="ic" style={{ background: 'var(--lavender-50)' }}>📖</div><h3>Guía paso a paso interactiva</h3><p>Confirma cada paso y avanza. No es un PDF que se pierde.</p></div></Reveal>
            <Reveal><div className="feat"><div className="ic" style={{ background: 'var(--clay-100)' }}>🧮</div><h3>Calculadora de costos</h3><p>Precio justo en tiempo real según lo que pagaste por tus insumos.</p></div></Reveal>
            <Reveal><div className="feat"><div className="ic" style={{ background: 'var(--honey-50)' }}>🗂️</div><h3>Historial de costeos</h3><p>Guarda cada cálculo y consúltalo cuando quieras volver a producir.</p></div></Reveal>
          </div>
        </div>
      </section>

      {/* 6 · DEMO GALLERY */}
      <section className="pad gallery">
        <div className="wrap">
          <Reveal>
            <div className="sec-head">
              <span className="eyebrow">Por dentro</span>
              <h2>Así se ve trabajar con Jabonera</h2>
            </div>
          </Reveal>
        </div>
        <div className="wrap">
          <div className="gallery-track reveal in">
            {[
              { src: '/mock/dev01.png', cap: 'Tu taller, organizado' },
              { src: '/mock/dev02.png', cap: 'Escala tu receta' },
              { src: '/mock/dev03.png', cap: 'Proceso guiado' },
              { src: '/mock/dev04.png', cap: 'Tu precio, claro' },
            ].map(({ src, cap }) => (
              <div key={src} className="shot">
                <Image src={src} alt={cap} width={220} height={440} style={{ width: '100%', height: 'auto' }} />
                <div className="cap">{cap}</div>
              </div>
            ))}
          </div>
          <p className="gallery-hint">← desliza para ver más →</p>
        </div>
      </section>

      {/* 7 · TESTIMONIALS */}
      <section className="pad">
        <div className="wrap">
          <Reveal>
            <div className="sec-head">
              <span className="eyebrow">Lo que dicen</span>
              <h2>De pasatiempo a negocio real</h2>
            </div>
          </Reveal>
          <div className="testi-grid">
            <Reveal>
              <div className="testi">
                <div className="quote">&ldquo;Por fin sé que estoy ganando. Subí mis precios sin culpa y siguen comprando.&rdquo;</div>
                <div className="who"><div className="av" style={{ background: 'var(--color-blush)' }}>M</div><div><div className="nm">Mariana R.</div><div className="ct">Guadalajara, México</div></div></div>
              </div>
            </Reveal>
            <Reveal>
              <div className="testi">
                <div className="quote">&ldquo;La guía paso a paso me dio la seguridad que me faltaba. Ya no improviso.&rdquo;</div>
                <div className="who"><div className="av" style={{ background: 'var(--color-sage)' }}>C</div><div><div className="nm">Carolina V.</div><div className="ct">Medellín, Colombia</div></div></div>
              </div>
            </Reveal>
            <Reveal>
              <div className="testi">
                <div className="quote">&ldquo;Calculé el precio de mi lote en cinco minutos. Antes lo hacía a ojo y perdía.&rdquo;</div>
                <div className="who"><div className="av" style={{ background: 'var(--color-honey)' }}>L</div><div><div className="nm">Lucía F.</div><div className="ct">Lima, Perú</div></div></div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 8 · COMPARISON */}
      <section className="pad problem" style={{ background: 'var(--lavender-50)' }}>
        <div className="wrap">
          <Reveal>
            <div className="sec-head">
              <span className="eyebrow">La diferencia</span>
              <h2>Jabonera vs. el ebook típico</h2>
            </div>
          </Reveal>
          <Reveal>
            <div className="compare">
              <table>
                <thead><tr><th></th><th>Ebook típico</th><th>Jabonera</th></tr></thead>
                <tbody>
                  <tr><td>Receta lista para usar</td><td className="yes">✓</td><td className="yes">✓</td></tr>
                  <tr><td>Escala a tus unidades</td><td className="no">✕</td><td className="yes">✓</td></tr>
                  <tr><td>Calcula tu precio</td><td className="no">✕</td><td className="yes">✓</td></tr>
                  <tr><td>Guía paso a paso interactiva</td><td className="no">✕</td><td className="yes">✓</td></tr>
                  <tr><td>Se actualiza y crece contigo</td><td className="no">✕</td><td className="yes">✓</td></tr>
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 9 · PRICING */}
      <section className="pad pricing" id="precio">
        <div className="wrap">
          <Reveal>
            <div className="sec-head" style={{ color: '#fff' }}>
              <span className="eyebrow" style={{ color: 'var(--color-honey)' }}>Acceso de por vida</span>
              <h2 style={{ color: '#fff' }}>Una vez. Para siempre.</h2>
            </div>
          </Reveal>
          <Reveal>
            <div className="price-card">
              <div className="amount"><small>$</small>22<span className="was">$44</span></div>
              <div className="once">PAGO ÚNICO · SIN MENSUALIDADES</div>
              <ul className="price-list">
                <li><span className="tick">✓</span> Todas las recetas y categorías</li>
                <li><span className="tick">✓</span> Guía paso a paso interactiva</li>
                <li><span className="tick">✓</span> Calculadora de costos ilimitada</li>
                <li><span className="tick">✓</span> Historial de costeos guardado</li>
                <li><span className="tick">✓</span> Nuevas recetas y mejoras incluidas</li>
              </ul>
              <Link className="btn btn-light" href="/login" style={{ width: '100%', justifyContent: 'center', fontSize: 18 }}>
                Quiero Jabonera →
              </Link>
              <div className="guarantee"><Shield /> Garantía de 7 días o te devolvemos tu dinero</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 10 · FOOTER */}
      <footer className="lp-foot">
        <div className="wrap">
          <div>
            <Logo size={26} color="#fff" mark="#fff" />
            <p className="tag">La herramienta para convertir tus jabones artesanales en un negocio rentable.</p>
          </div>
          <div className="flinks">
            <Link href="/terminos">Términos</Link>
            <Link href="/privacidad">Privacidad</Link>
            <Link href="/contacto">Contacto</Link>
          </div>
          <div className="legal">
            <span>© 2026 Jabonera. Todos los derechos reservados.</span>
            <span>Vendido a través de Hotmart</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

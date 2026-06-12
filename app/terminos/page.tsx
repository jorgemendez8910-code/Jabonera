import Link from 'next/link'
import { Logo } from '@/components/app/Logo'
import '../landing.css'
import './legal.css'

export const metadata = {
  title: 'Términos y Condiciones — Jabonera',
  description: 'Términos y condiciones de uso del servicio Jabonera.',
}

export default function TerminosPage() {
  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh' }}>
      {/* minimal nav */}
      <nav className="lp-nav">
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/"><Logo size={26} /></Link>
          <Link href="/login" className="btn btn-primary" style={{ fontSize: 14, padding: '10px 20px' }}>Iniciar sesión</Link>
        </div>
      </nav>

      <main className="wrap legal-body">
        <p className="legal-date">Última actualización: junio de 2026</p>
        <h1>Términos y Condiciones</h1>
        <p>Estos Términos y Condiciones («Términos») regulan el acceso y uso de <strong>Jabonera</strong> («el Servicio», «la Plataforma»), operado por el equipo de Jabonera. Al acceder o utilizar el Servicio, aceptas quedar vinculado por estos Términos.</p>

        <h2>1. Descripción del Servicio</h2>
        <p>Jabonera es una plataforma digital de apoyo para emprendedoras de jabones artesanales que ofrece recetas guiadas, calculadora de costos y seguimiento de producción. El acceso se adquiere como una licencia de uso de por vida a través de <strong>Hotmart</strong>, plataforma de procesamiento de pagos.</p>

        <h2>2. Acceso y Cuenta</h2>
        <ul>
          <li>El acceso es personal e intransferible. No puedes compartir tus credenciales con terceros.</li>
          <li>Eres responsable de mantener la confidencialidad de tu contraseña.</li>
          <li>Debes notificarnos de inmediato si sospechas acceso no autorizado a tu cuenta.</li>
          <li>La licencia de acceso es de por vida para el comprador original.</li>
        </ul>

        <h2>3. Uso Aceptable</h2>
        <p>Te comprometes a no:</p>
        <ul>
          <li>Usar el Servicio para fines ilegales o no autorizados.</li>
          <li>Intentar acceder a áreas restringidas de la plataforma.</li>
          <li>Reproducir, distribuir o vender el contenido del Servicio sin autorización escrita.</li>
          <li>Usar herramientas automatizadas (bots, scrapers) para extraer contenido.</li>
        </ul>

        <h2>4. Propiedad Intelectual</h2>
        <p>Todo el contenido de Jabonera —incluyendo recetas, textos, imágenes, diseño y código— es propiedad exclusiva de Jabonera o sus licenciantes y está protegido por las leyes de propiedad intelectual aplicables. Se te otorga una licencia de uso personal, no exclusiva y no transferible.</p>

        <h2>5. Pagos y Garantía de Reembolso</h2>
        <ul>
          <li>Los pagos se procesan exclusivamente a través de <strong>Hotmart</strong>. Jabonera no almacena datos de tarjetas de crédito.</li>
          <li>Ofrecemos una <strong>garantía de 7 días</strong>. Si no estás satisfecha, puedes solicitar el reembolso completo dentro de los 7 días posteriores a la compra directamente en Hotmart.</li>
          <li>Pasados los 7 días, los pagos no son reembolsables.</li>
        </ul>

        <h2>6. Disponibilidad del Servicio</h2>
        <p>Nos esforzamos por mantener el Servicio disponible de forma continua, pero no garantizamos disponibilidad ininterrumpida. Podemos realizar mantenimientos programados o no programados sin previo aviso. No somos responsables de pérdidas derivadas de interrupciones del servicio.</p>

        <h2>7. Limitación de Responsabilidad</h2>
        <p>Jabonera proporciona el contenido «tal como está» con fines informativos y educativos. No nos responsabilizamos por:</p>
        <ul>
          <li>Resultados comerciales derivados del uso de las recetas o cálculos.</li>
          <li>Daños directos, indirectos o incidentales relacionados con el uso del Servicio.</li>
          <li>Exactitud de los cálculos de costos (dependen de los datos que el usuario ingresa).</li>
        </ul>

        <h2>8. Modificaciones</h2>
        <p>Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los cambios entrarán en vigor al publicarse en esta página. El uso continuado del Servicio después de la publicación de cambios constituye aceptación de los nuevos Términos.</p>

        <h2>9. Terminación</h2>
        <p>Podemos suspender o cancelar tu acceso si violas estos Términos, sin previo aviso y sin responsabilidad de nuestra parte.</p>

        <h2>10. Ley Aplicable</h2>
        <p>Estos Términos se rigen por las leyes aplicables al lugar de residencia del usuario. Cualquier disputa se resolverá preferentemente mediante mediación amistosa antes de acudir a instancias legales.</p>

        <h2>11. Contacto</h2>
        <p>Para cualquier consulta sobre estos Términos, contáctanos vía <a href="/contacto">WhatsApp</a>.</p>
      </main>

      <footer className="lp-foot" style={{ marginTop: 60 }}>
        <div className="wrap">
          <div>
            <Logo size={24} color="#fff" mark="#fff" />
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

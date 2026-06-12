import Link from 'next/link'
import { Logo } from '@/components/app/Logo'
import '../landing.css'
import '../terminos/legal.css'

export const metadata = {
  title: 'Política de Privacidad — Jabonera',
  description: 'Política de privacidad y tratamiento de datos personales de Jabonera.',
}

export default function PrivacidadPage() {
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
        <h1>Política de Privacidad</h1>
        <p>En <strong>Jabonera</strong> nos comprometemos a proteger tu información personal. Esta Política describe qué datos recopilamos, cómo los usamos y los derechos que tienes sobre ellos, de conformidad con las leyes de protección de datos aplicables en América Latina, incluyendo la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México) y normativas equivalentes de la región.</p>

        <h2>1. Responsable del Tratamiento</h2>
        <p>El responsable del tratamiento de tus datos personales es el equipo de <strong>Jabonera</strong>. Puedes contactarnos para ejercer tus derechos a través de <a href="/contacto">WhatsApp</a>.</p>

        <h2>2. Datos que Recopilamos</h2>
        <p>Recopilamos los siguientes datos personales:</p>
        <ul>
          <li><strong>Datos de registro:</strong> nombre completo y dirección de correo electrónico.</li>
          <li><strong>Datos de uso:</strong> recetas vistas, pasos completados, costeos guardados y recetas marcadas como favoritas.</li>
          <li><strong>Datos de pago:</strong> procesados íntegramente por <strong>Hotmart</strong>. Jabonera no almacena ni tiene acceso a datos de tarjetas de crédito u otros instrumentos de pago.</li>
          <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador y dispositivo (recopilados automáticamente para la operación del servicio).</li>
        </ul>

        <h2>3. Finalidad del Tratamiento</h2>
        <p>Utilizamos tus datos para:</p>
        <ul>
          <li>Crear y gestionar tu cuenta de acceso al Servicio.</li>
          <li>Personalizar tu experiencia (nombre de bienvenida, historial de costeos).</li>
          <li>Enviar comunicaciones relacionadas con el Servicio (actualizaciones, nuevas recetas).</li>
          <li>Mejorar la plataforma mediante análisis de uso agregado y anonimizado.</li>
          <li>Cumplir con obligaciones legales aplicables.</li>
        </ul>

        <h2>4. Base Legal del Tratamiento</h2>
        <p>El tratamiento de tus datos se basa en:</p>
        <ul>
          <li><strong>Consentimiento:</strong> al registrarte, aceptas esta Política de Privacidad.</li>
          <li><strong>Ejecución del contrato:</strong> necesitamos tus datos para prestarte el Servicio.</li>
          <li><strong>Interés legítimo:</strong> para mejorar la plataforma y garantizar su seguridad.</li>
        </ul>

        <h2>5. Compartición con Terceros</h2>
        <p>No vendemos ni cedemos tus datos personales a terceros con fines comerciales. Compartimos datos únicamente con:</p>
        <ul>
          <li><strong>Hotmart:</strong> para el procesamiento de pagos y gestión de la compra.</li>
          <li><strong>Supabase:</strong> proveedor de base de datos y autenticación, que actúa como encargado del tratamiento bajo nuestras instrucciones y con medidas de seguridad adecuadas.</li>
          <li><strong>Autoridades competentes:</strong> cuando sea requerido por ley.</li>
        </ul>

        <h2>6. Transferencias Internacionales</h2>
        <p>Tus datos pueden ser almacenados en servidores ubicados fuera de tu país de residencia (principalmente en Estados Unidos). En todos los casos, exigimos a nuestros proveedores que apliquen medidas de seguridad equivalentes a las requeridas por la normativa de protección de datos latinoamericana.</p>

        <h2>7. Retención de Datos</h2>
        <p>Conservamos tus datos mientras mantengas una cuenta activa o sea necesario para prestarte el Servicio. Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento contactándonos.</p>

        <h2>8. Tus Derechos (Derechos ARCO)</h2>
        <p>Tienes derecho a:</p>
        <ul>
          <li><strong>Acceso:</strong> solicitar información sobre los datos que tenemos sobre ti.</li>
          <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
          <li><strong>Cancelación:</strong> solicitar la eliminación de tus datos.</li>
          <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos para determinadas finalidades.</li>
        </ul>
        <p>Para ejercer estos derechos, contáctanos vía <a href="/contacto">WhatsApp</a>. Responderemos en un plazo máximo de 20 días hábiles.</p>

        <h2>9. Seguridad</h2>
        <p>Implementamos medidas técnicas y organizativas para proteger tus datos, incluyendo cifrado en tránsito (HTTPS), autenticación segura gestionada por Supabase y control de acceso por roles. Sin embargo, ningún sistema es 100% seguro; en caso de brecha de seguridad que afecte tus datos, te notificaremos oportunamente.</p>

        <h2>10. Cookies y Tecnologías Similares</h2>
        <p>Utilizamos cookies estrictamente necesarias para mantener tu sesión de usuario. No utilizamos cookies de seguimiento publicitario ni compartimos tu actividad de navegación con redes publicitarias.</p>

        <h2>11. Menores de Edad</h2>
        <p>El Servicio no está dirigido a menores de 18 años. No recopilamos intencionalmente datos de menores. Si detectamos que hemos recopilado datos de un menor, los eliminaremos de inmediato.</p>

        <h2>12. Cambios a esta Política</h2>
        <p>Podemos actualizar esta Política en cualquier momento. Notificaremos los cambios significativos por correo electrónico o mediante un aviso visible en la plataforma. El uso continuado del Servicio tras la notificación implica tu aceptación.</p>

        <h2>13. Contacto</h2>
        <p>Para cualquier consulta, solicitud o reclamación relacionada con el tratamiento de tus datos personales, contáctanos vía <a href="/contacto">WhatsApp</a>.</p>
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

import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Nunito } from 'next/font/google'
import './globals.css'

// next/font — zero layout shift, auto-subset (skill: font.md)
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display-loaded',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-body-loaded',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s · Jabonera',
    default: 'Jabonera — De tu receta a tu precio de venta, en minutos',
  },
  description: 'Jabonera es una herramienta viva que escala tus recetas de jabón artesanal, te guía paso a paso y te dice exactamente cuánto cobrar.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Jabonera',
  },
}

export const viewport: Viewport = {
  themeColor: '#C4846C',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${nunito.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body>
        {children}
        {/* Register service worker — deferred so it never blocks render */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').catch(() => {});
            });
          }
        `}} />
      </body>
    </html>
  )
}

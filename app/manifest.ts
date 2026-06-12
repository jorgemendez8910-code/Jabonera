import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Jabonera',
    short_name: 'Jabonera',
    description: 'De tu receta a tu precio de venta, en minutos',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#FDF6EE',
    theme_color: '#C4846C',
    orientation: 'portrait',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    categories: ['productivity', 'lifestyle'],
    lang: 'es',
  }
}

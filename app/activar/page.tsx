import { Suspense } from 'react'
import { ActivarScreen } from './ActivarScreen'

// useSearchParams() en el componente cliente requiere un Suspense boundary
// en Next.js 15 para que el static shell se pueda pre-renderizar.
export default function ActivarPage() {
  return (
    <Suspense>
      <ActivarScreen />
    </Suspense>
  )
}

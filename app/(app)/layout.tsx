import { StoreProvider } from '@/components/app/StoreProvider'
import { getUserProfile } from '@/lib/data'
import '@/app/app.css'

// Server layout — fetches the profile, wraps client StoreProvider (skill: rsc-boundaries)
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getUserProfile()

  return (
    <StoreProvider initialCurrency={profile?.currency_preference ?? 'USD'}>
      <div className="app-shell">{children}</div>
    </StoreProvider>
  )
}

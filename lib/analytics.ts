'use server'

import { createClient } from '@/lib/supabase/server'

export type FeatureEventName =
  | 'recipe_viewed'
  | 'batch_size_changed'
  | 'step_confirmed'
  | 'costing_started'
  | 'costing_saved'
  | 'support_link_clicked'

// Best-effort product analytics — never throws, never blocks the UI.
// Anonymous calls (e.g. the support link on /login) are silently skipped:
// feature_events tracks signed-in usage, not pre-auth traffic.
export async function trackEvent(event: FeatureEventName, metadata: Record<string, unknown> = {}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('feature_events').insert({
    user_id: user.id,
    event_name: event,
    metadata,
  })
}

'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') {
  posthog.init('phc_uWwnNzHnni8BnvQgHaWDMtQf9kMoNb6EuLE4HaNaqCLo', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
  })
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}

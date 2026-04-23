import { Redirect, Slot } from 'expo-router'
import { SessionRouteLoader } from '@/components/session-route-loader'
import { useSession } from '@/providers/session-provider'

export default function ProtectedLayout() {
  const { isRouteReady, needsOnboarding, session } = useSession()

  if (!isRouteReady) {
    return <SessionRouteLoader />
  }

  if (session == null) {
    return <Redirect href="/sign-in" />
  }

  if (needsOnboarding) {
    return <Redirect href="/onboarding" />
  }

  return <Slot />
}

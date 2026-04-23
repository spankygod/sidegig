import { Redirect, Slot } from 'expo-router'
import { SessionRouteLoader } from '@/components/session-route-loader'
import { authenticatedHomeHref } from '@/lib/route-paths'
import { useSession } from '@/providers/session-provider'

export default function OnboardingLayout() {
  const { isRouteReady, needsOnboarding, session } = useSession()

  if (!isRouteReady) {
    return <SessionRouteLoader />
  }

  if (session == null) {
    return <Redirect href="/sign-in" />
  }

  if (!needsOnboarding) {
    return <Redirect href={authenticatedHomeHref} />
  }

  return <Slot />
}

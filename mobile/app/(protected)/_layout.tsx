import { Redirect, Stack } from 'expo-router'
import { palette, resolvePaletteMode } from '@/constants/palette'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { SessionRouteLoader } from '@/components/session-route-loader'
import { useSession } from '@/providers/session-provider'

export default function ProtectedLayout() {
  const { isRouteReady, needsOnboarding, session } = useSession()
  const colorScheme = useColorScheme()
  const mode = resolvePaletteMode(colorScheme)
  const colors = palette[mode]

  if (!isRouteReady) {
    return <SessionRouteLoader />
  }

  if (session == null) {
    return <Redirect href="/sign-in" />
  }

  if (needsOnboarding) {
    return <Redirect href="/onboarding" />
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background
        }
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="gigs/[gigId]"
        options={{
          headerShown: false,
          presentation: 'containedTransparentModal',
          animation: 'slide_from_bottom',
          gestureEnabled: false,
          contentStyle: {
            backgroundColor: 'transparent'
          }
        }}
      />
    </Stack>
  )
}

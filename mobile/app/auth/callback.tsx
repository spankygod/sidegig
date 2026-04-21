import { Redirect } from 'expo-router'
import { ActivityIndicator, Text, View } from 'react-native'
import { palette } from '@/constants/palette'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useSession } from '@/providers/session-provider'
import { authCallbackScreenStyles as styles } from '@/styles/screens/auth-callback-screen'

export default function AuthCallbackScreen() {
  const colorScheme = useColorScheme()
  const mode = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = palette[mode]
  const { error, isReady, session } = useSession()

  if (isReady && session != null) {
    return <Redirect href="/(tabs)" />
  }

  if (isReady && error != null) {
    return <Redirect href="/sign-in" />
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.accent} size="large" />
      <Text selectable style={[styles.title, { color: colors.text }]}>
        Finishing sign-in
      </Text>
      <Text selectable style={[styles.description, { color: colors.textMuted }]}>
        Your Google session is being connected to the app.
      </Text>
    </View>
  )
}

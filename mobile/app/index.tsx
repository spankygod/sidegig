import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { palette } from '@/constants/palette'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useSession } from '@/providers/session-provider'
import { indexScreenStyles as styles } from '@/styles/screens/index-screen'

export default function IndexScreen() {
  const colorScheme = useColorScheme()
  const mode = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = palette[mode]
  const { isReady, session } = useSession()

  if (!isReady) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    )
  }

  if (session == null) {
    return <Redirect href="/sign-in" />
  }

  return <Redirect href="/(tabs)" />
}

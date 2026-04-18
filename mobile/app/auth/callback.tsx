import { Redirect } from 'expo-router'
import { ActivityIndicator, Text, View } from 'react-native'
import { palette } from '@/constants/palette'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useSession } from '@/providers/session-provider'

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
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
        backgroundColor: colors.background
      }}
    >
      <ActivityIndicator color={colors.accent} size="large" />
      <Text
        selectable
        style={{
          color: colors.text,
          fontSize: 18,
          fontWeight: '700',
          textAlign: 'center'
        }}
      >
        Finishing sign-in
      </Text>
      <Text
        selectable
        style={{
          color: colors.textMuted,
          fontSize: 15,
          lineHeight: 22,
          textAlign: 'center'
        }}
      >
        Your Google session is being connected to the app.
      </Text>
    </View>
  )
}

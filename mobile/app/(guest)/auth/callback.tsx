import { useRouter } from 'expo-router'
import { ActivityIndicator, Text, View } from 'react-native'
import { PrimaryButton } from '@/components/primary-button'
import { palette, resolvePaletteMode } from '@/constants/palette'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useSession } from '@/providers/session-provider'
import { authCallbackScreenStyles as styles } from '@/styles/screens/auth-callback-screen'

export default function AuthCallbackScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const mode = resolvePaletteMode(colorScheme)
  const colors = palette[mode]
  const { clearError, error } = useSession()
  const isResolvingSignIn = error == null

  let title = 'Finishing sign-in'
  let description = 'Your Google session is being connected to the app.'

  if (!isResolvingSignIn) {
    title = 'Sign-in failed'
    description = error
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {isResolvingSignIn && <ActivityIndicator color={colors.accent} size="large" />}
      <Text selectable style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      <Text selectable style={[styles.description, { color: colors.textMuted }]}>
        {description}
      </Text>
      {!isResolvingSignIn && (
        <PrimaryButton
          mode={mode}
          onPress={() => {
            clearError()
            router.replace('/sign-in')
          }}
          variant="secondary"
        >
          Back to sign in
        </PrimaryButton>
      )}
    </View>
  )
}

import { ScrollView, Text, View } from 'react-native'
import { AppSurface } from '@/components/app-surface'
import { PrimaryButton } from '@/components/primary-button'
import { palette } from '@/constants/palette'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useSession } from '@/providers/session-provider'
import { profileScreenStyles as styles } from '@/styles/screens/profile-screen'

function formatNullableValue(value: string | null | undefined): string {
  if (value == null || value.trim() === '') {
    return 'Not set yet'
  }

  return value
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme()
  const mode = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = palette[mode]
  const { authUser, error, profile, refreshAppData, signOut } = useSession()

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.contentContainer}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <AppSurface mode={mode}>
        <Text selectable style={[styles.heroTitle, { color: colors.text }]}>
          {profile?.displayName ?? 'Your profile'}
        </Text>
        <Text selectable style={[styles.heroBody, { color: colors.textMuted }]}>
          {authUser?.email ?? 'Google account connected'}
        </Text>
      </AppSurface>

      {error == null
        ? null
        : (
          <AppSurface mode={mode}>
            <Text selectable style={[styles.errorText, { color: colors.danger }]}>
              {error}
            </Text>
          </AppSurface>
          )}

      <AppSurface mode={mode}>
        <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>
          Account details
        </Text>
        <View style={styles.detailStack}>
          {[
            ['Display name', formatNullableValue(profile?.displayName)],
            ['City', formatNullableValue(profile?.city)],
            ['Barangay', formatNullableValue(profile?.barangay)],
            ['Bio', formatNullableValue(profile?.bio)],
            ['User ID', formatNullableValue(profile?.id)]
          ].map(([label, value]) => (
            <View key={label} style={styles.detailItem}>
              <Text selectable style={[styles.detailLabel, { color: colors.textMuted }]}>
                {label}
              </Text>
              <Text selectable style={[styles.detailValue, { color: colors.text }]}>
                {value}
              </Text>
            </View>
          ))}
        </View>
      </AppSurface>

      <View style={styles.statsRow}>
        {[
          ['Rating', profile?.stats.rating ?? 0],
          ['Reviews', profile?.stats.reviewCount ?? 0],
          ['Completed', profile?.stats.jobsCompleted ?? 0]
        ].map(([label, value]) => (
          <View
            key={label}
            style={[styles.statCard, { borderColor: colors.border, backgroundColor: colors.surface }]}
          >
            <Text selectable style={[styles.statLabel, { color: colors.textMuted }]}>
              {label}
            </Text>
            <Text selectable style={[styles.statValue, { color: colors.text }]}>
              {String(value)}
            </Text>
          </View>
        ))}
      </View>

      <PrimaryButton mode={mode} onPress={() => { void refreshAppData() }} variant="secondary">
        Refresh profile
      </PrimaryButton>
      <PrimaryButton mode={mode} onPress={() => { void signOut() }}>
        Sign out
      </PrimaryButton>
    </ScrollView>
  )
}

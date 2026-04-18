import { ScrollView, Text, View } from 'react-native'
import { AppSurface } from '@/components/app-surface'
import { PrimaryButton } from '@/components/primary-button'
import { palette } from '@/constants/palette'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useSession } from '@/providers/session-provider'

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
      contentContainerStyle={{
        padding: 20,
        gap: 16
      }}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <AppSurface mode={mode}>
        <Text
          selectable
          style={{
            color: colors.text,
            fontSize: 26,
            fontWeight: '800',
            lineHeight: 32
          }}
        >
          {profile?.displayName ?? 'Your profile'}
        </Text>
        <Text
          selectable
          style={{
            color: colors.textMuted,
            fontSize: 15,
            lineHeight: 22
          }}
        >
          {authUser?.email ?? 'Google account connected'}
        </Text>
      </AppSurface>

      {error == null
        ? null
        : (
          <AppSurface mode={mode}>
            <Text
              selectable
              style={{
                color: colors.danger,
                fontSize: 15,
                fontWeight: '700'
              }}
            >
              {error}
            </Text>
          </AppSurface>
          )}

      <AppSurface mode={mode}>
        <Text
          selectable
          style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: '700'
          }}
        >
          Account details
        </Text>
        <View style={{ gap: 10 }}>
          {[
            ['Display name', formatNullableValue(profile?.displayName)],
            ['City', formatNullableValue(profile?.city)],
            ['Barangay', formatNullableValue(profile?.barangay)],
            ['Bio', formatNullableValue(profile?.bio)],
            ['User ID', formatNullableValue(profile?.id)]
          ].map(([label, value]) => (
            <View key={label} style={{ gap: 4 }}>
              <Text
                selectable
                style={{
                  color: colors.textMuted,
                  fontSize: 13,
                  fontWeight: '600'
                }}
              >
                {label}
              </Text>
              <Text
                selectable
                style={{
                  color: colors.text,
                  fontSize: 15,
                  lineHeight: 21
                }}
              >
                {value}
              </Text>
            </View>
          ))}
        </View>
      </AppSurface>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {[
          ['Rating', profile?.stats.rating ?? 0],
          ['Reviews', profile?.stats.reviewCount ?? 0],
          ['Completed', profile?.stats.jobsCompleted ?? 0]
        ].map(([label, value]) => (
          <View
            key={label}
            style={{
              flex: 1,
              borderRadius: 8,
              borderCurve: 'continuous',
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              padding: 16,
              gap: 8
            }}
          >
            <Text
              selectable
              style={{
                color: colors.textMuted,
                fontSize: 13,
                fontWeight: '600'
              }}
            >
              {label}
            </Text>
            <Text
              selectable
              style={{
                color: colors.text,
                fontSize: 22,
                fontWeight: '800',
                fontVariant: ['tabular-nums']
              }}
            >
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

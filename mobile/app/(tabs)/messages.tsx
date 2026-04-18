import { useRouter } from 'expo-router'
import { ScrollView, Text, View } from 'react-native'
import { AppSurface } from '@/components/app-surface'
import { PrimaryButton } from '@/components/primary-button'
import { palette } from '@/constants/palette'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useSession } from '@/providers/session-provider'

export default function MessagesScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const mode = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = palette[mode]
  const { myGigs, profile } = useSession()

  const firstName = profile?.displayName.split(' ')[0] ?? 'there'

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
            fontSize: 28,
            fontWeight: '800',
            lineHeight: 34
          }}
        >
          Messages
        </Text>
        <Text
          selectable
          style={{
            color: colors.textMuted,
            fontSize: 15,
            lineHeight: 22
          }}
        >
          Keep candidate replies, booking updates, and hiring follow-ups in one place.
        </Text>
      </AppSurface>

      <AppSurface mode={mode}>
        <Text
          selectable
          style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: '700'
          }}
        >
          Inbox is next
        </Text>
        <Text
          selectable
          style={{
            color: colors.textMuted,
            fontSize: 15,
            lineHeight: 22
          }}
        >
          {firstName}, message threads are not wired yet. The next pass should connect applicant conversations to your published gigs and surface unread counts here.
        </Text>
      </AppSurface>

      <View
        style={{
          flexDirection: 'row',
          gap: 12
        }}
      >
        {[
          ['Published gigs', myGigs.filter((gig) => gig.status === 'published').length],
          ['Total applicants', myGigs.reduce((total, gig) => total + gig.applicationCount, 0)]
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

      <PrimaryButton mode={mode} onPress={() => { router.navigate('/gigs') }} variant="secondary">
        Review gigs first
      </PrimaryButton>
    </ScrollView>
  )
}

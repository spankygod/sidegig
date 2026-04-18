import { useRouter } from 'expo-router'
import { ScrollView, Text, View } from 'react-native'
import { AppSurface } from '@/components/app-surface'
import { PrimaryButton } from '@/components/primary-button'
import { StatusBadge } from '@/components/status-badge'
import { palette } from '@/constants/palette'
import { useColorScheme } from '@/hooks/use-color-scheme'
import {
  formatDurationBucket,
  formatGigCategory,
  formatGigTimestamp,
  formatPhpCurrency
} from '@/lib/raket-types'
import { useSession } from '@/providers/session-provider'

function getStatusTone(status: string): 'accent' | 'success' | 'warning' {
  if (status === 'published' || status === 'completed') {
    return 'success'
  }

  if (status === 'draft' || status === 'in_progress') {
    return 'accent'
  }

  return 'warning'
}

export default function GigsScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const mode = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = palette[mode]
  const { authUser, error, isRefreshing, myGigs, profile, refreshAppData } = useSession()

  const publishedCount = myGigs.filter((gig) => gig.status === 'published').length
  const draftCount = myGigs.filter((gig) => gig.status === 'draft').length
  const openApplications = myGigs.reduce((total, gig) => total + gig.applicationCount, 0)
  const firstName = profile?.displayName.split(' ')[0] ?? authUser?.email?.split('@')[0] ?? 'there'

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
            color: colors.textMuted,
            fontSize: 14,
            fontWeight: '600'
          }}
        >
          Welcome back
        </Text>
        <Text
          selectable
          style={{
            color: colors.text,
            fontSize: 28,
            fontWeight: '800',
            lineHeight: 34
          }}
        >
          {firstName}, your hiring board is ready.
        </Text>
        <Text
          selectable
          style={{
            color: colors.textMuted,
            fontSize: 15,
            lineHeight: 22
          }}
        >
          Track drafts, keep published jobs moving, and post the next role when you are ready.
        </Text>
      </AppSurface>

      <View
        style={{
          flexDirection: 'row',
          gap: 12
        }}
      >
        {[
          { label: 'Published', value: publishedCount },
          { label: 'Drafts', value: draftCount },
          { label: 'Applicants', value: openApplications }
        ].map((item) => (
          <View
            key={item.label}
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
              {item.label}
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
              {item.value}
            </Text>
          </View>
        ))}
      </View>

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
            <PrimaryButton mode={mode} onPress={() => { void refreshAppData() }} variant="secondary">
              Refresh account
            </PrimaryButton>
          </AppSurface>
          )}

      <PrimaryButton mode={mode} onPress={() => { router.navigate('/(tabs)') }} variant="secondary">
        Post another job
      </PrimaryButton>

      <View style={{ gap: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <Text
            selectable
            style={{
              color: colors.text,
              fontSize: 20,
              fontWeight: '800'
            }}
          >
            Active and recent gigs
          </Text>
          <PrimaryButton mode={mode} onPress={() => { void refreshAppData() }} variant="secondary">
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </PrimaryButton>
        </View>

        {myGigs.length === 0
          ? (
            <AppSurface mode={mode}>
              <Text
                selectable
                style={{
                  color: colors.text,
                  fontSize: 16,
                  fontWeight: '700'
                }}
              >
                No gigs yet
              </Text>
              <Text
                selectable
                style={{
                  color: colors.textMuted,
                  fontSize: 15,
                  lineHeight: 22
                }}
              >
                Start with one job post. It will appear here as soon as it is saved.
              </Text>
            </AppSurface>
            )
          : myGigs.map((gig) => (
            <AppSurface key={gig.id} mode={mode}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12
                }}
              >
                <View style={{ flex: 1, gap: 6 }}>
                  <Text
                    selectable
                    style={{
                      color: colors.text,
                      fontSize: 18,
                      fontWeight: '800',
                      lineHeight: 24
                    }}
                  >
                    {gig.title}
                  </Text>
                  <Text
                    selectable
                    style={{
                      color: colors.textMuted,
                      fontSize: 14,
                      lineHeight: 20
                    }}
                  >
                    {formatGigCategory(gig.category)} · {formatDurationBucket(gig.durationBucket)}
                  </Text>
                </View>
                <StatusBadge label={gig.status} mode={mode} tone={getStatusTone(gig.status)} />
              </View>

              <Text
                selectable
                style={{
                  color: colors.text,
                  fontSize: 17,
                  fontWeight: '700'
                }}
              >
                {formatPhpCurrency(gig.priceAmount)}
              </Text>

              <Text
                selectable
                style={{
                  color: colors.textMuted,
                  fontSize: 15,
                  lineHeight: 22
                }}
              >
                {gig.location.barangay}, {gig.location.city}
              </Text>

              <Text
                selectable
                style={{
                  color: colors.text,
                  fontSize: 15,
                  lineHeight: 22
                }}
              >
                {gig.scheduleSummary}
              </Text>

              <Text
                selectable
                style={{
                  color: colors.textMuted,
                  fontSize: 13,
                  lineHeight: 18
                }}
              >
                {gig.applicationCount} applicants · Updated {formatGigTimestamp(gig.updatedAt)}
              </Text>
            </AppSurface>
            ))}
      </View>
    </ScrollView>
  )
}

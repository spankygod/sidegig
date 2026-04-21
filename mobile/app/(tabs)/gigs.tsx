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
import { gigsScreenStyles as styles } from '@/styles/screens/gigs-screen'

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
      contentContainerStyle={styles.contentContainer}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <AppSurface mode={mode}>
        <Text selectable style={[styles.heroEyebrow, { color: colors.textMuted }]}>
          Welcome back
        </Text>
        <Text selectable style={[styles.heroTitle, { color: colors.text }]}>
          {firstName}, your hiring board is ready.
        </Text>
        <Text selectable style={[styles.heroBody, { color: colors.textMuted }]}>
          Track drafts, keep published jobs moving, and post the next role when you are ready.
        </Text>
      </AppSurface>

      <View style={styles.metricsRow}>
        {[
          { label: 'Published', value: publishedCount },
          { label: 'Drafts', value: draftCount },
          { label: 'Applicants', value: openApplications }
        ].map((item) => (
          <View
            key={item.label}
            style={[styles.metricCard, { borderColor: colors.border, backgroundColor: colors.surface }]}
          >
            <Text selectable style={[styles.metricLabel, { color: colors.textMuted }]}>
              {item.label}
            </Text>
            <Text selectable style={[styles.metricValue, { color: colors.text }]}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>

      {error == null
        ? null
        : (
          <AppSurface mode={mode}>
            <Text selectable style={[styles.errorText, { color: colors.danger }]}>
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

      <View style={styles.listSection}>
        <View style={styles.listHeader}>
          <Text selectable style={[styles.listTitle, { color: colors.text }]}>
            Active and recent gigs
          </Text>
          <PrimaryButton mode={mode} onPress={() => { void refreshAppData() }} variant="secondary">
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </PrimaryButton>
        </View>

        {myGigs.length === 0
          ? (
            <AppSurface mode={mode}>
              <Text selectable style={[styles.emptyTitle, { color: colors.text }]}>
                No gigs yet
              </Text>
              <Text selectable style={[styles.emptyBody, { color: colors.textMuted }]}>
                Start with one job post. It will appear here as soon as it is saved.
              </Text>
            </AppSurface>
            )
          : myGigs.map((gig) => (
            <AppSurface key={gig.id} mode={mode}>
              <View style={styles.gigHeader}>
                <View style={styles.gigCopy}>
                  <Text selectable style={[styles.gigTitle, { color: colors.text }]}>
                    {gig.title}
                  </Text>
                  <Text selectable style={[styles.gigMeta, { color: colors.textMuted }]}>
                    {formatGigCategory(gig.category)} · {formatDurationBucket(gig.durationBucket)}
                  </Text>
                </View>
                <StatusBadge label={gig.status} mode={mode} tone={getStatusTone(gig.status)} />
              </View>

              <Text selectable style={[styles.gigPrice, { color: colors.text }]}>
                {formatPhpCurrency(gig.priceAmount)}
              </Text>

              <Text selectable style={[styles.gigBody, { color: colors.textMuted }]}>
                {gig.location.barangay}, {gig.location.city}
              </Text>

              <Text selectable style={[styles.gigBody, { color: colors.text }]}>
                {gig.scheduleSummary}
              </Text>

              <Text selectable style={[styles.gigFootnote, { color: colors.textMuted }]}>
                {gig.applicationCount} applicants · Updated {formatGigTimestamp(gig.updatedAt)}
              </Text>
            </AppSurface>
            ))}
      </View>
    </ScrollView>
  )
}

import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { PaletteMode } from '@/constants/palette'
import { palette } from '@/constants/palette'
import {
  formatGigCategory,
  formatGigTimestamp,
  formatPhpCurrency,
  type GigCategory,
  type OwnedGig,
  type UserProfile
} from '@/lib/raket-types'

type FindGigHomeViewProps = {
  discoveryGigs: OwnedGig[]
  discoveryPage: number
  discoveryPageCount: number
  draftCount: number
  error: string | null
  firstName: string
  initials: string
  locationLabel: string
  mode?: PaletteMode
  myGigs: OwnedGig[]
  onActivateCreate: () => void
  onNextDiscoveryPage: () => void
  onOpenGigs: () => void
  onOpenProfile: () => void
  onPreviousDiscoveryPage: () => void
  profile: UserProfile | null
  profileStrengthLabel: string
  publishedCount: number
  recentGigs: OwnedGig[]
  searchQuery: string
  totalApplicants: number
  totalBudget: number
}

type CategoryHighlight = {
  category: GigCategory
  label: string
}

const categoryHighlights: CategoryHighlight[] = [
  {
    category: 'errands_personal_assistance',
    label: 'Errands'
  },
  {
    category: 'cleaning_home_help',
    label: 'Cleaning'
  },
  {
    category: 'graphic_design_creative',
    label: 'Creative'
  }
]

export function FindGigHomeView({
  discoveryGigs,
  discoveryPage,
  discoveryPageCount,
  draftCount,
  error,
  firstName,
  initials,
  locationLabel,
  mode,
  myGigs,
  onActivateCreate,
  onNextDiscoveryPage,
  onOpenGigs,
  onOpenProfile,
  onPreviousDiscoveryPage,
  profile,
  profileStrengthLabel,
  publishedCount,
  recentGigs,
  searchQuery,
  totalApplicants,
  totalBudget
}: FindGigHomeViewProps) {
  const colors = palette[mode ?? 'light']

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>Job category</Text>
        <Text selectable style={[styles.sectionMeta, { color: colors.textMuted }]}>Quick browse</Text>
      </View>

      <View style={styles.categoryRow}>
        {categoryHighlights.map((item) => (
          <Pressable
            key={item.category}
            accessibilityRole="button"
            onPress={onOpenGigs}
            style={({ pressed }) => [styles.categoryCard, pressed ? styles.pressed : null]}
          >
            <View style={styles.categoryIconBubble}>
              <Ionicons color="#11131a" name={categoryIconName(item.category)} size={18} />
            </View>
            <Text selectable style={styles.categoryLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>Discovery</Text>
        <Text selectable style={[styles.sectionMeta, { color: colors.textMuted }]}>
          {filteredResultsLabel(discoveryGigs.length, searchQuery)}
        </Text>
      </View>

      {discoveryGigs.length === 0
        ? (
          <View style={styles.emptyStateCard}>
            <Text selectable style={[styles.emptyStateTitle, { color: colors.text }]}>No jobs found</Text>
            <Text selectable style={[styles.emptyStateBody, { color: colors.textMuted }]}>
              {searchQuery.trim() === ''
                ? 'Publish a job to start populating Discovery on this screen.'
                : 'Try a different keyword or clear the search bar to see more jobs.'}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={onActivateCreate}
              style={({ pressed }) => [styles.emptyStateButton, pressed ? styles.pressed : null]}
            >
              <Text selectable style={styles.emptyStateButtonText}>Create a gig</Text>
            </Pressable>
          </View>
          )
        : (
          <View style={styles.discoveryList}>
            {discoveryGigs.map((gig) => (
              <Pressable
                key={gig.id}
                accessibilityRole="button"
                onPress={onOpenGigs}
                style={({ pressed }) => [styles.discoveryCard, pressed ? styles.pressed : null]}
              >
                <View style={styles.discoveryCardTopRow}>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text selectable style={[styles.discoveryCardTitle, { color: colors.text }]}>{gig.title}</Text>
                    <Text selectable style={[styles.discoveryCardMeta, { color: colors.textMuted }]}>
                      {formatGigCategory(gig.category)} · {gig.location.city}
                    </Text>
                  </View>
                  <View style={styles.discoveryArrowWrap}>
                    <Ionicons color="#11131a" name="arrow-forward" size={16} />
                  </View>
                </View>

                <Text numberOfLines={2} selectable style={[styles.discoveryDescription, { color: colors.textMuted }]}>
                  {gig.description}
                </Text>

                <View style={styles.discoveryFooter}>
                  <View style={styles.feedPillPrimary}>
                    <Text selectable style={styles.feedPillPrimaryText}>{gig.applicationCount} applicants</Text>
                  </View>
                  <Text selectable style={[styles.discoveryBudget, { color: colors.text }]}>
                    {formatPhpCurrency(gig.priceAmount)}
                  </Text>
                </View>
              </Pressable>
            ))}

            <View style={styles.discoveryPagination}>
              <Pressable
                accessibilityRole="button"
                disabled={discoveryPage === 0}
                onPress={onPreviousDiscoveryPage}
                style={({ pressed }) => [
                  styles.paginationButton,
                  discoveryPage === 0 ? styles.paginationButtonDisabled : null,
                  pressed ? styles.pressed : null
                ]}
              >
                <Text selectable style={styles.paginationButtonText}>Previous</Text>
              </Pressable>
              <Text selectable style={[styles.paginationText, { color: colors.textMuted }]}>
                Page {discoveryPage + 1} of {discoveryPageCount}
              </Text>
              <Pressable
                accessibilityRole="button"
                disabled={discoveryPage >= discoveryPageCount - 1}
                onPress={onNextDiscoveryPage}
                style={({ pressed }) => [
                  styles.paginationButton,
                  discoveryPage >= discoveryPageCount - 1 ? styles.paginationButtonDisabled : null,
                  pressed ? styles.pressed : null
                ]}
              >
                <Text selectable style={styles.paginationButtonText}>Next</Text>
              </Pressable>
            </View>
          </View>
          )}

      <View style={styles.metricsStrip}>
        {[
          { label: 'Published', value: publishedCount },
          { label: 'Drafts', value: draftCount },
          { label: 'Applicants', value: totalApplicants }
        ].map((item) => (
          <View key={item.label} style={styles.metricColumn}>
            <Text selectable style={[styles.metricValue, { color: colors.text }]}>{item.value}</Text>
            <Text selectable style={[styles.metricLabel, { color: colors.textMuted }]}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileTopRow}>
          <View style={styles.profileAvatar}>
            <Text selectable style={styles.profileAvatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text selectable style={[styles.profileTitle, { color: colors.text }]}>
              {profile?.displayName ?? `${firstName} hiring profile`}
            </Text>
            <Text selectable style={[styles.profileSubtitle, { color: colors.textMuted }]}>
              {profile?.bio?.trim() !== '' ? profile?.bio : 'Tighten your profile so applicants know what kind of work you post.'}
            </Text>
          </View>
        </View>

        <View style={styles.profileStatsRow}>
          <View style={styles.profileStatItem}>
            <Text selectable style={[styles.profileStatValue, { color: colors.text }]}>{profile?.stats.jobsCompleted ?? 0}</Text>
            <Text selectable style={[styles.profileStatLabel, { color: colors.textMuted }]}>Completed</Text>
          </View>
          <View style={styles.profileStatItem}>
            <Text selectable style={[styles.profileStatValue, { color: colors.text }]}>{profile?.stats.reviewCount ?? 0}</Text>
            <Text selectable style={[styles.profileStatLabel, { color: colors.textMuted }]}>Reviews</Text>
          </View>
          <View style={styles.profileStatItem}>
            <Text selectable style={[styles.profileStatValue, { color: colors.text }]}>
              {totalBudget > 0 ? formatPhpCurrency(totalBudget) : 'PHP 0'}
            </Text>
            <Text selectable style={[styles.profileStatLabel, { color: colors.textMuted }]}>Budget</Text>
          </View>
        </View>

        <View style={styles.profileFooterRow}>
          <View style={styles.profileStrengthPill}>
            <Text selectable style={styles.profileStrengthText}>{profileStrengthLabel}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={onOpenProfile}
            style={({ pressed }) => [styles.profileAction, pressed ? styles.pressed : null]}
          >
            <Text selectable style={styles.profileActionText}>Open profile</Text>
            <Ionicons color="#ffffff" name="arrow-forward" size={16} />
          </Pressable>
        </View>
      </View>

      {error == null
        ? null
        : (
          <View style={styles.errorCard}>
            <Ionicons color="#7c2d12" name="alert-circle" size={18} />
            <Text selectable style={styles.errorText}>{error}</Text>
          </View>
          )}

      <View style={styles.sectionHeader}>
        <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>Live activity</Text>
        <Pressable accessibilityRole="button" onPress={onOpenGigs}>
          <Text selectable style={[styles.inlineAction, { color: colors.textMuted }]}>See all</Text>
        </Pressable>
      </View>

      {recentGigs.length === 0
        ? (
          <View style={styles.emptyStateCard}>
            <Text selectable style={[styles.emptyStateTitle, { color: colors.text }]}>No gigs live yet</Text>
            <Text selectable style={[styles.emptyStateBody, { color: colors.textMuted }]}>Start with one sharp post, then use the feed to track applicants and updates as they arrive.</Text>
            <Pressable
              accessibilityRole="button"
              onPress={onActivateCreate}
              style={({ pressed }) => [styles.emptyStateButton, pressed ? styles.pressed : null]}
            >
              <Text selectable style={styles.emptyStateButtonText}>Create first job</Text>
            </Pressable>
          </View>
          )
        : recentGigs.map((gig) => (
          <Pressable
            key={gig.id}
            accessibilityRole="button"
            onPress={onOpenGigs}
            style={({ pressed }) => [styles.feedCard, pressed ? styles.pressed : null]}
          >
            <View style={styles.feedCardTopRow}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text selectable style={[styles.feedCardTitle, { color: colors.text }]}>{gig.title}</Text>
                <Text selectable style={[styles.feedCardMeta, { color: colors.textMuted }]}>
                  {formatGigCategory(gig.category)} · {gig.location.city}
                </Text>
              </View>
              <View style={styles.feedCardArrowWrap}>
                <Ionicons color="#11131a" name="arrow-forward" size={16} />
              </View>
            </View>

            <View style={styles.feedPillRow}>
              <View style={styles.feedPillPrimary}>
                <Text selectable style={styles.feedPillPrimaryText}>{gig.status === 'published' ? 'User invited' : 'Draft ready'}</Text>
              </View>
              <View style={styles.feedPillSecondary}>
                <Text selectable style={styles.feedPillSecondaryText}>{gig.applicationCount} applicants</Text>
              </View>
            </View>

            <View style={styles.feedCardFooter}>
              <View style={{ gap: 4 }}>
                <Text selectable style={[styles.feedCardPrice, { color: colors.text }]}>{formatPhpCurrency(gig.priceAmount)}</Text>
                <Text selectable style={[styles.feedCardTime, { color: colors.textMuted }]}>{formatGigTimestamp(gig.updatedAt)}</Text>
              </View>
              <Text selectable style={[styles.feedCardSchedule, { color: colors.textMuted }]}>{gig.scheduleSummary}</Text>
            </View>
          </Pressable>
          ))}
    </>
  )
}

function filteredResultsLabel(discoveryCount: number, searchQuery: string): string {
  if (searchQuery.trim() !== '') {
    return `${discoveryCount} results`
  }

  return '5 per page'
}

function categoryIconName(category: GigCategory): keyof typeof Ionicons.glyphMap {
  switch (category) {
    case 'errands_personal_assistance':
      return 'walk-outline'
    case 'cleaning_home_help':
      return 'sparkles-outline'
    case 'moving_help':
      return 'cube-outline'
    case 'construction_helper':
      return 'hammer-outline'
    case 'tutoring_academic_support':
      return 'school-outline'
    case 'graphic_design_creative':
      return 'color-palette-outline'
    case 'photo_video_support':
      return 'camera-outline'
    case 'virtual_assistance_admin':
      return 'desktop-outline'
    case 'event_staffing':
      return 'people-outline'
  }
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  sectionMeta: {
    fontSize: 12,
    fontWeight: '600'
  },
  inlineAction: {
    fontSize: 13,
    fontWeight: '700'
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 12
  },
  categoryCard: {
    flex: 1,
    minHeight: 92,
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e6e8df'
  },
  categoryIconBubble: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#f4f4f1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  categoryLabel: {
    color: '#11131a',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    textAlign: 'center'
  },
  discoveryList: {
    gap: 12
  },
  discoveryCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e6e8df',
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 12
  },
  discoveryCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  discoveryCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 23,
    letterSpacing: -0.3
  },
  discoveryCardMeta: {
    fontSize: 13,
    lineHeight: 18
  },
  discoveryDescription: {
    fontSize: 14,
    lineHeight: 20
  },
  discoveryArrowWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#f4f4f1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  discoveryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  discoveryBudget: {
    fontSize: 17,
    fontWeight: '800'
  },
  discoveryPagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  paginationButton: {
    minHeight: 38,
    minWidth: 84,
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f4f1'
  },
  paginationButtonDisabled: {
    opacity: 0.45
  },
  paginationButtonText: {
    color: '#11131a',
    fontSize: 13,
    fontWeight: '700'
  },
  paginationText: {
    fontSize: 13,
    fontWeight: '600'
  },
  metricsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    gap: 12
  },
  metricColumn: {
    flex: 1,
    gap: 6
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '600'
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    gap: 18,
    borderWidth: 1,
    borderColor: '#e6e8df',
    shadowColor: '#0f1115',
    shadowOffset: {
      width: 0,
      height: 12
    },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#11131a',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileAvatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800'
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4
  },
  profileSubtitle: {
    fontSize: 14,
    lineHeight: 20
  },
  profileStatsRow: {
    flexDirection: 'row',
    gap: 12
  },
  profileStatItem: {
    flex: 1,
    gap: 4
  },
  profileStatValue: {
    fontSize: 18,
    fontWeight: '800'
  },
  profileStatLabel: {
    fontSize: 12,
    fontWeight: '600'
  },
  profileFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  profileStrengthPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f4f4f1'
  },
  profileStrengthText: {
    color: '#505866',
    fontSize: 12,
    fontWeight: '700'
  },
  profileAction: {
    minHeight: 42,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: '#185f37',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  profileActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  },
  errorCard: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#f8f8f6',
    borderWidth: 1,
    borderColor: '#e6e8df',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  errorText: {
    flex: 1,
    color: '#11131a',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600'
  },
  emptyStateCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e6e8df',
    backgroundColor: '#ffffff',
    padding: 18,
    gap: 14
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  emptyStateBody: {
    fontSize: 15,
    lineHeight: 22
  },
  emptyStateButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: '#11131a',
    justifyContent: 'center'
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  },
  feedCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e6e8df',
    backgroundColor: '#ffffff',
    padding: 18,
    gap: 16
  },
  feedCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  feedCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 25,
    letterSpacing: -0.5
  },
  feedCardMeta: {
    fontSize: 14,
    lineHeight: 20
  },
  feedCardArrowWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#f4f4f1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  feedPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
  },
  feedPillPrimary: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#185f37'
  },
  feedPillPrimaryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  feedPillSecondary: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f4f4f1'
  },
  feedPillSecondaryText: {
    color: '#58616f',
    fontSize: 12,
    fontWeight: '700'
  },
  feedCardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12
  },
  feedCardPrice: {
    fontSize: 20,
    fontWeight: '800'
  },
  feedCardTime: {
    fontSize: 12,
    fontWeight: '600'
  },
  feedCardSchedule: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18
  },
  pressed: {
    opacity: 0.88
  }
})

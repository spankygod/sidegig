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
  type PublicGig,
  type UserProfile
} from '@/lib/raket-types'

type FindGigHomeViewProps = {
  discoveryError: string | null
  discoveryGigs: PublicGig[]
  discoveryHasMore: boolean
  discoveryPage: number
  discoveryPageCount: number
  discoveryTotalCount: number
  draftCount: number
  error: string | null
  isDiscoveryLoading: boolean
  locationLabel: string
  localitySummary: string
  mode?: PaletteMode
  onChangeCategory: (category: GigCategory | 'all') => void
  onActivateCreate: () => void
  onOpenDiscoveryGig: (gigId: string) => void
  onNextDiscoveryPage: () => void
  onOpenGigs: () => void
  onOpenProfile: () => void
  onPreviousDiscoveryPage: () => void
  profile: UserProfile | null
  publishedCount: number
  recentGigs: OwnedGig[]
  selectedCategory: GigCategory | 'all'
  searchQuery: string
  totalApplicants: number
  totalBudget: number
}

type CategoryHighlight = {
  category: GigCategory | 'all'
  label: string
}

const categoryHighlights: CategoryHighlight[] = [
  {
    category: 'all',
    label: 'All'
  },
  {
    category: 'errands_personal_assistance',
    label: 'Errands'
  },
  {
    category: 'cleaning_home_help',
    label: 'Cleaning'
  },
  {
    category: 'moving_help',
    label: 'Moving'
  },
  {
    category: 'construction_helper',
    label: 'Construction'
  },
  {
    category: 'tutoring_academic_support',
    label: 'Tutoring'
  },
  {
    category: 'graphic_design_creative',
    label: 'Creative'
  },
  {
    category: 'photo_video_support',
    label: 'Photo'
  },
  {
    category: 'virtual_assistance_admin',
    label: 'Admin'
  },
  {
    category: 'event_staffing',
    label: 'Events'
  }
]

export function FindGigHomeView({
  discoveryError,
  discoveryGigs,
  discoveryHasMore,
  discoveryPage,
  discoveryPageCount,
  discoveryTotalCount,
  draftCount,
  error,
  isDiscoveryLoading,
  locationLabel,
  localitySummary,
  mode,
  onChangeCategory,
  onActivateCreate,
  onOpenDiscoveryGig,
  onNextDiscoveryPage,
  onOpenGigs,
  onOpenProfile,
  onPreviousDiscoveryPage,
  profile,
  publishedCount,
  recentGigs,
  selectedCategory,
  searchQuery,
  totalApplicants,
  totalBudget
}: FindGigHomeViewProps) {
  const colors = palette[mode ?? 'light']
  const initials = profile?.displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'RK'

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>Job category</Text>
        <Text selectable style={[styles.sectionMeta, { color: colors.textMuted }]}>Marketplace filters</Text>
      </View>

      <View style={styles.categoryRow}>
        {categoryHighlights.map((item) => (
          <Pressable
            key={item.category}
            accessibilityRole="button"
            onPress={() => { onChangeCategory(item.category) }}
            style={({ pressed }) => [
              styles.categoryCard,
              {
                backgroundColor: selectedCategory === item.category ? '#185f37' : '#ffffff',
                borderColor: selectedCategory === item.category ? '#185f37' : '#e6e8df'
              },
              pressed ? styles.pressed : null
            ]}
          >
            <View style={styles.categoryIconBubble}>
              <Ionicons
                color={selectedCategory === item.category ? '#ffffff' : '#11131a'}
                name={categoryIconName(item.category)}
                size={18}
              />
            </View>
            <Text
              selectable
              style={[
                styles.categoryLabel,
                { color: selectedCategory === item.category ? '#ffffff' : '#11131a' }
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>Discovery</Text>
        <Text selectable style={[styles.sectionMeta, { color: colors.textMuted }]}>
          {filteredResultsLabel(discoveryTotalCount, searchQuery, locationLabel)}
        </Text>
      </View>

      <View
        style={[
          styles.localityBanner,
          {
            borderColor: colors.border,
            backgroundColor: colors.surface
          }
        ]}
      >
        <Ionicons color={colors.textMuted} name="locate-outline" size={16} />
        <Text selectable style={[styles.localityBannerText, { color: colors.textMuted }]}>
          {localitySummary}
        </Text>
      </View>

      {isDiscoveryLoading && discoveryGigs.length === 0
        ? (
          <View style={styles.emptyStateCard}>
            <Text selectable style={[styles.emptyStateTitle, { color: colors.text }]}>Finding gigs</Text>
            <Text selectable style={[styles.emptyStateBody, { color: colors.textMuted }]}>
              Loading published jobs for your marketplace feed.
            </Text>
          </View>
          )
        : discoveryGigs.length === 0
        ? (
          <View style={styles.emptyStateCard}>
            <Text selectable style={[styles.emptyStateTitle, { color: colors.text }]}>No jobs found</Text>
            <Text selectable style={[styles.emptyStateBody, { color: colors.textMuted }]}>
              {searchQuery.trim() === ''
                ? `No published gigs matched ${locationLabel.toLowerCase()}.`
                : 'Try a different keyword or clear the search bar to see more jobs.'}
            </Text>
          </View>
          )
        : (
          <View style={styles.discoveryList}>
            {discoveryGigs.map((gig) => (
              <Pressable
                key={gig.id}
                accessibilityRole="button"
                onPress={() => { onOpenDiscoveryGig(gig.id) }}
                style={({ pressed }) => [styles.discoveryCard, pressed ? styles.pressed : null]}
              >
                <View style={styles.discoveryCardTopRow}>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text selectable style={[styles.discoveryCardTitle, { color: colors.text }]}>{gig.title}</Text>
                    <Text selectable style={[styles.discoveryCardMeta, { color: colors.textMuted }]}>
                      {formatGigCategory(gig.category)} · {gig.location.city}
                    </Text>
                    <Text selectable style={[styles.discoveryTrustLine, { color: colors.textMuted }]}>
                      {gig.poster.displayName} · {gig.poster.reviewCount} reviews · {gig.poster.responseRate}% response
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
                  <View style={styles.discoveryPillRow}>
                    <View style={styles.feedPillPrimary}>
                      <Text selectable style={styles.feedPillPrimaryText}>
                        {gig.distanceKm == null ? gig.location.barangay : `${gig.distanceKm.toFixed(1)} km away`}
                      </Text>
                    </View>
                    <View style={styles.feedPillSecondary}>
                      <Text selectable style={styles.feedPillSecondaryText}>
                        {gig.poster.gigsPosted} posted · {gig.poster.hiresCompleted} completed
                      </Text>
                    </View>
                  </View>
                  <Text selectable style={[styles.discoveryBudget, { color: colors.text }]}>
                    {formatPhpCurrency(gig.priceAmount)}
                  </Text>
                </View>
              </Pressable>
            ))}

            {discoveryTotalCount > 0
              ? (
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
                    disabled={!discoveryHasMore}
                    onPress={onNextDiscoveryPage}
                    style={({ pressed }) => [
                      styles.paginationButton,
                      !discoveryHasMore ? styles.paginationButtonDisabled : null,
                      pressed ? styles.pressed : null
                    ]}
                  >
                    <Text selectable style={styles.paginationButtonText}>Next</Text>
                  </Pressable>
                </View>
                )
              : null}
          </View>
          )}

      {discoveryError == null
        ? null
        : (
          <View style={styles.errorCard}>
            <Ionicons color="#7c2d12" name="alert-circle" size={18} />
            <Text selectable style={styles.errorText}>{discoveryError}</Text>
          </View>
          )}

      <View style={styles.sectionHeader}>
        <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>Poster tools</Text>
        <Pressable accessibilityRole="button" onPress={onOpenProfile}>
          <Text selectable style={[styles.inlineAction, { color: colors.textMuted }]}>Open profile</Text>
        </Pressable>
      </View>

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

      <View style={styles.profileCardCompact}>
        <View style={styles.profileTopRow}>
          <View style={styles.profileAvatar}>
            <Text selectable style={styles.profileAvatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text selectable style={[styles.profileTitle, { color: colors.text }]}>
              {profile?.displayName ?? 'Set up your profile'}
            </Text>
            <Text selectable style={[styles.profileSubtitle, { color: colors.textMuted }]}>
              {profile?.bio?.trim() !== '' ? profile?.bio : 'Add a tighter bio and location so workers trust your gigs faster.'}
            </Text>
          </View>
        </View>

        <View style={styles.profileStatsRow}>
          <View style={styles.profileStatItem}>
            <Text selectable style={[styles.profileStatValue, { color: colors.text }]}>{profile?.stats.reviewCount ?? 0}</Text>
            <Text selectable style={[styles.profileStatLabel, { color: colors.textMuted }]}>Reviews</Text>
          </View>
          <View style={styles.profileStatItem}>
            <Text selectable style={[styles.profileStatValue, { color: colors.text }]}>{profile?.stats.responseRate ?? 0}%</Text>
            <Text selectable style={[styles.profileStatLabel, { color: colors.textMuted }]}>Response</Text>
          </View>
          <View style={styles.profileStatItem}>
            <Text selectable style={[styles.profileStatValue, { color: colors.text }]}>
              {totalBudget > 0 ? formatPhpCurrency(totalBudget) : 'PHP 0'}
            </Text>
            <Text selectable style={[styles.profileStatLabel, { color: colors.textMuted }]}>Budget</Text>
          </View>
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
        <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>Recent posts</Text>
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
            style={({ pressed }) => [styles.feedCardCompact, pressed ? styles.pressed : null]}
          >
            <View style={styles.feedCardTopRow}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text selectable style={[styles.feedCardTitleCompact, { color: colors.text }]}>{gig.title}</Text>
                <Text selectable style={[styles.feedCardMeta, { color: colors.textMuted }]}>
                  {formatGigCategory(gig.category)} · {gig.location.city}
                </Text>
              </View>
              <View style={styles.feedCardArrowWrap}>
                <Ionicons color="#11131a" name="arrow-forward" size={16} />
              </View>
            </View>

            <View style={styles.feedCardFooter}>
              <View style={{ gap: 4 }}>
                <Text selectable style={[styles.feedCardPrice, { color: colors.text }]}>{formatPhpCurrency(gig.priceAmount)}</Text>
                <Text selectable style={[styles.feedCardTime, { color: colors.textMuted }]}>{formatGigTimestamp(gig.updatedAt)}</Text>
              </View>
              <Text selectable style={[styles.feedCardSchedule, { color: colors.textMuted }]}>{gig.applicationCount} applicants</Text>
            </View>
          </Pressable>
          ))}
    </>
  )
}

function filteredResultsLabel(discoveryCount: number, searchQuery: string, locationLabel: string): string {
  if (searchQuery.trim() !== '') {
    return `${discoveryCount} results`
  }

  return locationLabel === 'the marketplace' ? 'Marketplace-wide' : `Near ${locationLabel}`
}

function categoryIconName(category: GigCategory | 'all'): keyof typeof Ionicons.glyphMap {
  if (category === 'all') {
    return 'apps-outline'
  }

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
    gap: 12,
    flexWrap: 'wrap'
  },
  categoryCard: {
    minHeight: 86,
    minWidth: '30%',
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
  localityBanner: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  localityBannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600'
  },
  categoryLabel: {
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
  discoveryTrustLine: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600'
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
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12
  },
  discoveryPillRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
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
  profileCardCompact: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#e6e8df'
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
  feedCardCompact: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e6e8df',
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 12
  },
  feedCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  feedCardTitleCompact: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
    letterSpacing: -0.3
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

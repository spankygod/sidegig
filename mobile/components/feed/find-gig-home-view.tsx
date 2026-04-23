import { Ionicons } from '@expo/vector-icons'
import { FlatList, Pressable, Text, View, useWindowDimensions } from 'react-native'
import type { PaletteMode } from '@/constants/palette'
import { palette } from '@/constants/palette'
import { layout } from '@/constants/theme'
import {
  formatGigCategory,
  formatGigTimestamp,
  formatPhpAmount,
  type OwnedGig,
  type PublicGig,
  type UserProfile
} from '@/lib/raket-types'
import { findGigHomeViewStyles as styles } from '@/styles/components/find-gig-home-view'

type FindGigHomeViewProps = {
  discoveryError: string | null
  discoveryGigs: PublicGig[]
  discoveryPage: number
  discoveryPageCount: number
  draftCount: number
  error: string | null
  isDiscoveryLoading: boolean
  mode?: PaletteMode
  onActivateCreate: () => void
  onOpenDiscoveryGig: (gigId: string) => void
  onOpenGigs: () => void
  onOpenProfile: () => void
  profile: UserProfile | null
  publishedCount: number
  recentGigs: OwnedGig[]
  searchQuery: string
  totalApplicants: number
  totalBudget: number
}

type DiscoveryGigCarouselCardProps = {
  cardWidth: number
  gig: PublicGig
  index: number
  onOpenGig: (gigId: string) => void
}

const discoveryCarouselTones = [
  {
    backgroundColor: '#1f8a63',
    titleColor: '#ffffff',
    metaColor: 'rgba(236, 255, 248, 0.84)',
    pillColor: 'rgba(233, 255, 246, 0.22)',
    pillTextColor: '#ffffff',
    secondaryPillColor: 'rgba(7, 24, 18, 0.16)',
    iconWrapColor: 'rgba(233, 255, 246, 0.18)',
    iconColor: '#ffffff'
  },
  {
    backgroundColor: '#fff0de',
    titleColor: '#17211d',
    metaColor: '#5b695f',
    pillColor: '#ffffff',
    pillTextColor: '#17211d',
    secondaryPillColor: 'rgba(255, 255, 255, 0.74)',
    iconWrapColor: '#ffffff',
    iconColor: '#17211d'
  },
  {
    backgroundColor: '#17211d',
    titleColor: '#ffffff',
    metaColor: 'rgba(235, 241, 237, 0.76)',
    pillColor: 'rgba(255, 255, 255, 0.14)',
    pillTextColor: '#ffffff',
    secondaryPillColor: 'rgba(255, 255, 255, 0.08)',
    iconWrapColor: 'rgba(255, 255, 255, 0.1)',
    iconColor: '#ffffff'
  }
] as const

function getDiscoveryEmptyStateBody(searchQuery: string): string {
  if (searchQuery.trim() === '') {
    return 'No published gigs are available right now.'
  }

  return 'Try a different keyword or clear the search bar to see more jobs.'
}

function getDistanceLabel(gig: PublicGig): string {
  if (gig.distanceKm == null) {
    return gig.location.barangay
  }

  return `${gig.distanceKm.toFixed(1)} km away`
}

function getCarouselTone(index: number) {
  return discoveryCarouselTones[index % discoveryCarouselTones.length]
}

function DiscoveryGigCarouselCard({ cardWidth, gig, index, onOpenGig }: DiscoveryGigCarouselCardProps) {
  const tone = getCarouselTone(index)

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => { onOpenGig(gig.id) }}
      style={({ pressed }) => [
        styles.discoveryCarouselCard,
        {
          width: cardWidth,
          backgroundColor: tone.backgroundColor
        },
        pressed && styles.pressed
      ]}
    >
      <View style={styles.discoveryCardTopRow}>
        <View style={[styles.carouselCategoryPill, { backgroundColor: tone.pillColor }]}>
          <Text style={[styles.carouselCategoryText, { color: tone.pillTextColor }]}>
            {formatGigCategory(gig.category)}
          </Text>
        </View>
        <View style={[styles.discoveryArrowWrap, { backgroundColor: tone.iconWrapColor }]}>
          <Ionicons color={tone.iconColor} name="arrow-forward" size={16} />
        </View>
      </View>

      <View style={styles.carouselContent}>
        <Text numberOfLines={2} style={[styles.discoveryCardTitle, { color: tone.titleColor }]}>
          {gig.title}
        </Text>
        <Text style={[styles.discoveryCardMeta, { color: tone.metaColor }]}>
          {gig.location.city} · {gig.poster.displayName}
        </Text>
      </View>

      <View style={styles.carouselMetricsRow}>
        <View style={styles.carouselMetric}>
          <Text style={[styles.carouselMetricValue, { color: tone.titleColor }]}>
            {formatPhpAmount(gig.priceAmount)}
          </Text>
          <Text style={[styles.carouselMetricLabel, { color: tone.metaColor }]}>
            Budget
          </Text>
        </View>
        <View style={styles.carouselMetric}>
          <Text style={[styles.carouselMetricValue, { color: tone.titleColor }]}>
            {gig.poster.responseRate}%
          </Text>
          <Text style={[styles.carouselMetricLabel, { color: tone.metaColor }]}>
            Response
          </Text>
        </View>
        <View style={styles.carouselMetric}>
          <Text style={[styles.carouselMetricValue, { color: tone.titleColor }]}>
            {gig.poster.reviewCount}
          </Text>
          <Text style={[styles.carouselMetricLabel, { color: tone.metaColor }]}>
            Reviews
          </Text>
        </View>
      </View>

      <View style={styles.discoveryFooter}>
        <View style={styles.discoveryPillRow}>
          <View style={[styles.feedPillPrimary, { backgroundColor: tone.pillColor }]}>
            <Text style={[styles.feedPillPrimaryText, { color: tone.pillTextColor }]}>
              {getDistanceLabel(gig)}
            </Text>
          </View>
          <View style={[styles.feedPillSecondary, { backgroundColor: tone.secondaryPillColor }]}>
            <Text style={[styles.feedPillSecondaryText, { color: tone.metaColor }]}>
              {gig.poster.hiresCompleted} completed hires
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

export function FindGigHomeView({
  discoveryError,
  discoveryGigs,
  discoveryPage,
  discoveryPageCount,
  draftCount,
  error,
  isDiscoveryLoading,
  mode,
  onActivateCreate,
  onOpenDiscoveryGig,
  onOpenGigs,
  onOpenProfile,
  profile,
  publishedCount,
  recentGigs,
  searchQuery,
  totalApplicants,
  totalBudget
}: FindGigHomeViewProps) {
  const { width } = useWindowDimensions()
  const colors = palette[mode ?? 'light']
  const cardWidth = Math.min(width - (layout.screenPadding * 2) - 28, 320)
  const carouselSnapWidth = cardWidth + 14
  const discoveryEmptyStateBody = getDiscoveryEmptyStateBody(searchQuery)
  const initials = profile?.displayName?.trim()
    ? profile.displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
    : 'RK'

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>Jobs for you</Text>
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
                {discoveryEmptyStateBody}
              </Text>
            </View>
            )
          : (
            <>
              <FlatList
                data={discoveryGigs}
                contentContainerStyle={styles.discoveryCarousel}
                decelerationRate="fast"
                directionalLockEnabled
                disableIntervalMomentum
                getItemLayout={(_, index) => ({
                  index,
                  length: carouselSnapWidth,
                  offset: carouselSnapWidth * index
                })}
                horizontal
                initialNumToRender={3}
                ItemSeparatorComponent={() => <View style={styles.discoveryCarouselSeparator} />}
                keyExtractor={(gig) => gig.id}
                maxToRenderPerBatch={4}
                nestedScrollEnabled
                overScrollMode="never"
                removeClippedSubviews
                renderItem={({ item, index }) => (
                  <DiscoveryGigCarouselCard
                    cardWidth={cardWidth}
                    gig={item}
                    index={index}
                    onOpenGig={onOpenDiscoveryGig}
                  />
                )}
                showsHorizontalScrollIndicator={false}
                snapToAlignment="start"
                snapToInterval={carouselSnapWidth}
                windowSize={5}
              />

              <Text selectable style={[styles.paginationText, { color: colors.textMuted }]}>
                Page {discoveryPage + 1} of {discoveryPageCount}
              </Text>
            </>
            )}

      {discoveryError == null
        ? null
        : (
          <View style={[styles.errorCard, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            <Ionicons color={colors.warning} name="alert-circle" size={18} />
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

      <View style={[styles.profileCardCompact, { backgroundColor: colors.surface }]}>
        <View style={styles.profileTopRow}>
          <View style={[styles.profileAvatar, { backgroundColor: colors.text }]}>
            <Text selectable style={styles.profileAvatarText}>{initials}</Text>
          </View>
          <View style={styles.profileCopy}>
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
              {totalBudget > 0 ? formatPhpAmount(totalBudget) : '₱0'}
            </Text>
            <Text selectable style={[styles.profileStatLabel, { color: colors.textMuted }]}>Budget</Text>
          </View>
        </View>
      </View>

      {error == null
        ? null
        : (
          <View style={[styles.errorCard, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            <Ionicons color={colors.warning} name="alert-circle" size={18} />
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
              <View style={styles.feedCardCopy}>
                <Text selectable style={[styles.feedCardTitleCompact, { color: colors.text }]}>{gig.title}</Text>
                <Text selectable style={[styles.feedCardMeta, { color: colors.textMuted }]}>
                  {formatGigCategory(gig.category)} · {gig.location.city}
                </Text>
              </View>
              <View style={[styles.feedCardArrowWrap, { backgroundColor: colors.surfaceMuted }]}>
                <Ionicons color={colors.text} name="arrow-forward" size={16} />
              </View>
            </View>

            <View style={styles.feedCardFooter}>
              <View style={styles.feedCardPriceGroup}>
                <Text selectable style={[styles.feedCardPrice, { color: colors.text }]}>{formatPhpAmount(gig.priceAmount)}</Text>
                <Text selectable style={[styles.feedCardTime, { color: colors.textMuted }]}>{formatGigTimestamp(gig.updatedAt)}</Text>
              </View>
              <Text selectable style={[styles.feedCardSchedule, { color: colors.textMuted }]}>{gig.applicationCount} applicants</Text>
            </View>
          </Pressable>
        ))}
    </>
  )
}

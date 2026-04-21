import { Ionicons } from '@expo/vector-icons'
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native'
import type { PaletteMode } from '@/constants/palette'
import { palette } from '@/constants/palette'
import { layout } from '@/constants/theme'
import {
  formatGigCategory,
  formatGigTimestamp,
  formatPhpCurrency,
  type GigCategory,
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
  onOpenGigs: () => void
  onOpenProfile: () => void
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
  onOpenGigs,
  onOpenProfile,
  profile,
  publishedCount,
  recentGigs,
  selectedCategory,
  searchQuery,
  totalApplicants,
  totalBudget
}: FindGigHomeViewProps) {
  const { width } = useWindowDimensions()
  const colors = palette[mode ?? 'light']
  const cardWidth = Math.min(width - (layout.screenPadding * 2) - 28, 320)
  const carouselSnapWidth = cardWidth + 14
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
        <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>Job categories</Text>
        <Text selectable style={[styles.sectionMeta, { color: colors.textMuted }]}>Single-tap filters</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.categoryRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {categoryHighlights.map((item) => (
          <Pressable
            key={item.category}
            accessibilityRole="button"
            onPress={() => { onChangeCategory(item.category) }}
            style={({ pressed }) => [
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === item.category ? colors.accent : colors.surface,
                borderColor: selectedCategory === item.category ? colors.accent : colors.border
              },
              pressed ? styles.pressed : null
            ]}
          >
            <Text
              selectable
              style={[
                styles.categoryLabel,
                { color: selectedCategory === item.category ? '#ffffff' : colors.text }
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleGroup}>
          <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>Jobs for you</Text>
          <Text selectable style={[styles.sectionMeta, { color: colors.textMuted }]}>
            {filteredResultsLabel(discoveryTotalCount, searchQuery, locationLabel)}
          </Text>
        </View>
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
            <>
              <ScrollView
                contentContainerStyle={styles.discoveryCarousel}
                decelerationRate="fast"
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToAlignment="start"
                snapToInterval={carouselSnapWidth}
              >
                {discoveryGigs.map((gig, index) => {
                  const tone = getCarouselTone(index)

                  return (
                    <Pressable
                      key={gig.id}
                      accessibilityRole="button"
                      onPress={() => { onOpenDiscoveryGig(gig.id) }}
                      style={({ pressed }) => [
                        styles.discoveryCarouselCard,
                        {
                          width: cardWidth,
                          backgroundColor: tone.backgroundColor
                        },
                        pressed ? styles.pressed : null
                      ]}
                    >
                      <View style={styles.discoveryCardTopRow}>
                        <View style={[styles.carouselCategoryPill, { backgroundColor: tone.pillColor }]}>
                          <Text selectable style={[styles.carouselCategoryText, { color: tone.pillTextColor }]}>
                            {formatGigCategory(gig.category)}
                          </Text>
                        </View>
                        <View style={[styles.discoveryArrowWrap, { backgroundColor: tone.iconWrapColor }]}>
                          <Ionicons color={tone.iconColor} name="arrow-forward" size={16} />
                        </View>
                      </View>

                      <View style={styles.carouselContent}>
                        <Text numberOfLines={2} selectable style={[styles.discoveryCardTitle, { color: tone.titleColor }]}>
                          {gig.title}
                        </Text>
                        <Text selectable style={[styles.discoveryCardMeta, { color: tone.metaColor }]}>
                          {gig.location.city} · {gig.poster.displayName}
                        </Text>
                      </View>

                      <View style={styles.carouselMetricsRow}>
                        <View style={styles.carouselMetric}>
                          <Text selectable style={[styles.carouselMetricValue, { color: tone.titleColor }]}>
                            {formatPhpCurrency(gig.priceAmount)}
                          </Text>
                          <Text selectable style={[styles.carouselMetricLabel, { color: tone.metaColor }]}>
                            Budget
                          </Text>
                        </View>
                        <View style={styles.carouselMetric}>
                          <Text selectable style={[styles.carouselMetricValue, { color: tone.titleColor }]}>
                            {gig.poster.responseRate}%
                          </Text>
                          <Text selectable style={[styles.carouselMetricLabel, { color: tone.metaColor }]}>
                            Response
                          </Text>
                        </View>
                        <View style={styles.carouselMetric}>
                          <Text selectable style={[styles.carouselMetricValue, { color: tone.titleColor }]}>
                            {gig.poster.reviewCount}
                          </Text>
                          <Text selectable style={[styles.carouselMetricLabel, { color: tone.metaColor }]}>
                            Reviews
                          </Text>
                        </View>
                      </View>

                      <View style={styles.discoveryFooter}>
                        <View style={styles.discoveryPillRow}>
                          <View style={[styles.feedPillPrimary, { backgroundColor: tone.pillColor }]}>
                            <Text selectable style={[styles.feedPillPrimaryText, { color: tone.pillTextColor }]}>
                              {gig.distanceKm == null ? gig.location.barangay : `${gig.distanceKm.toFixed(1)} km away`}
                            </Text>
                          </View>
                          <View style={[styles.feedPillSecondary, { backgroundColor: tone.secondaryPillColor }]}>
                            <Text selectable style={[styles.feedPillSecondaryText, { color: tone.metaColor }]}>
                              {gig.poster.hiresCompleted} completed hires
                            </Text>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  )
                })}
              </ScrollView>

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
              {totalBudget > 0 ? formatPhpCurrency(totalBudget) : 'PHP 0'}
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

function getCarouselTone(index: number) {
  const tones = [
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

  return tones[index % tones.length]
}

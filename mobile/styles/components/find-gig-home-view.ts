import { StyleSheet } from 'react-native'
import { palette } from '@/constants/palette'
import { layout } from '@/constants/theme'
import { textStyles } from '@/constants/typography'

export const findGigHomeViewStyles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  sectionTitleGroup: {
    flex: 1,
    gap: 2
  },
  sectionTitle: {
    fontSize: 18,
    ...textStyles.title,
    letterSpacing: -0.3
  },
  sectionMeta: {
    fontSize: 12,
    ...textStyles.label
  },
  inlineAction: {
    fontSize: 13,
    ...textStyles.label
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 6
  },
  categoryChip: {
    minHeight: 42,
    borderRadius: layout.radius.pill,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  categoryLabel: {
    fontSize: 14,
    ...textStyles.label,
    letterSpacing: -0.2
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
    fontFamily: textStyles.label.fontFamily
  },
  discoveryCarousel: {
    paddingRight: 6
  },
  discoveryCarouselSeparator: {
    width: 14
  },
  discoveryCarouselCard: {
    borderRadius: 28,
    padding: 18,
    gap: 16
  },
  discoveryCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  carouselCategoryPill: {
    minHeight: 32,
    borderRadius: layout.radius.pill,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  carouselCategoryText: {
    fontSize: 12,
    ...textStyles.label
  },
  carouselContent: {
    gap: 8
  },
  discoveryCardTitle: {
    fontSize: 24,
    ...textStyles.title,
    lineHeight: 29,
    letterSpacing: -0.7
  },
  discoveryCardMeta: {
    fontSize: 14,
    lineHeight: 19,
    ...textStyles.bodyStrong
  },
  discoveryArrowWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  carouselMetricsRow: {
    flexDirection: 'row',
    gap: 10
  },
  carouselMetric: {
    flex: 1,
    gap: 4
  },
  carouselMetricValue: {
    fontSize: 17,
    ...textStyles.title,
    letterSpacing: -0.4
  },
  carouselMetricLabel: {
    fontSize: 12,
    ...textStyles.label
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
  paginationText: {
    fontSize: 13,
    ...textStyles.label,
    paddingHorizontal: 4
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
    ...textStyles.numeric,
    letterSpacing: -0.6
  },
  metricLabel: {
    fontSize: 13,
    ...textStyles.label
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
    ...textStyles.title
  },
  profileCopy: {
    flex: 1,
    gap: 4
  },
  profileTitle: {
    fontSize: 20,
    ...textStyles.title,
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
    borderRadius: layout.radius.xl,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  profileStatItem: {
    flex: 1,
    gap: 4
  },
  profileStatValue: {
    fontSize: 18,
    ...textStyles.title
  },
  profileStatLabel: {
    fontSize: 12,
    ...textStyles.label
  },
  errorCard: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    ...textStyles.bodyStrong,
    color: palette.light.text
  },
  emptyStateCard: {
    borderRadius: layout.radius.xxl,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#ffffff',
    padding: 18,
    gap: 14
  },
  emptyStateTitle: {
    fontSize: 22,
    ...textStyles.title,
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
    backgroundColor: palette.light.text,
    justifyContent: 'center'
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    ...textStyles.button
  },
  feedCardCompact: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 12
  },
  feedCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  feedCardCopy: {
    flex: 1,
    gap: 6
  },
  feedCardTitleCompact: {
    fontSize: 17,
    ...textStyles.title,
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
    alignItems: 'center',
    justifyContent: 'center'
  },
  feedPillPrimary: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  feedPillPrimaryText: {
    fontSize: 12,
    ...textStyles.label
  },
  feedPillSecondary: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  feedPillSecondaryText: {
    fontSize: 12,
    ...textStyles.label
  },
  feedCardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12
  },
  feedCardPriceGroup: {
    gap: 4
  },
  feedCardPrice: {
    fontSize: 20,
    ...textStyles.title
  },
  feedCardTime: {
    fontSize: 12,
    ...textStyles.label
  },
  feedCardSchedule: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    ...textStyles.label,
    lineHeight: 18
  },
  pressed: {
    opacity: 0.88
  }
})

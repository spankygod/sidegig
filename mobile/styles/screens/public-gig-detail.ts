import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'
import { textStyles } from '@/constants/typography'

export const publicGigDetailStyles = StyleSheet.create({
  screen: {
    flex: 1
  },
  headerBar: {
    borderBottomWidth: 1
  },
  headerRow: {
    minHeight: layout.inputHeight + layout.spacing.xxs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingBottom: layout.spacing.md
  },
  headerIconButton: {
    width: layout.iconButtonSize,
    height: layout.iconButtonSize,
    borderRadius: layout.radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 17,
    ...textStyles.title
  },
  headerIconSpacer: {
    width: layout.iconButtonSize - layout.spacing.xxs,
    height: layout.iconButtonSize - layout.spacing.xxs
  },
  scrollArea: {
    flex: 1
  },
  contentContainer: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: layout.sectionGap,
    paddingBottom: layout.sectionGap,
    gap: layout.sectionGap
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stateContent: {
    gap: layout.spacing.lg,
    alignItems: 'center'
  },
  stateTitle: {
    fontSize: 18,
    ...textStyles.title
  },
  errorTitle: {
    fontSize: 15,
    lineHeight: 22,
    ...textStyles.title
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.spacing.lg
  },
  heroCopy: {
    flex: 1,
    gap: layout.spacing.xxs
  },
  posterBadge: {
    width: layout.size.avatarLg,
    height: layout.size.avatarLg,
    borderRadius: layout.radius.lg,
    alignItems: 'center',
    justifyContent: 'center'
  },
  posterBadgeText: {
    fontSize: 18,
    ...textStyles.title
  },
  heroEyebrow: {
    fontSize: 12,
    ...textStyles.label,
    textTransform: 'uppercase',
    letterSpacing: 0.4
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 31,
    letterSpacing: -0.7,
    ...textStyles.headline
  },
  heroMeta: {
    fontSize: 14,
    lineHeight: 19,
    ...textStyles.bodyStrong
  },
  metricRow: {
    flexDirection: 'row',
    gap: layout.spacing.sm
  },
  metricColumn: {
    flex: 1,
    gap: layout.spacing.xxs
  },
  metricValue: {
    fontSize: 16,
    lineHeight: 21,
    ...textStyles.title
  },
  metricLabel: {
    fontSize: 12,
    ...textStyles.label
  },
  tagRow: {
    flexDirection: 'row',
    gap: layout.spacing.xs,
    flexWrap: 'wrap'
  },
  inlineTag: {
    minHeight: layout.size.chipHeight,
    borderRadius: layout.radius.pill,
    paddingHorizontal: layout.spacing.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  inlineTagText: {
    fontSize: 12,
    ...textStyles.label
  },
  sectionTitle: {
    fontSize: 20,
    letterSpacing: -0.4,
    ...textStyles.title
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21
  },
  detailStack: {
    gap: layout.spacing.md
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: layout.spacing.sm
  },
  bulletIcon: {
    width: layout.size.badgeSm,
    height: layout.size.badgeSm,
    borderRadius: layout.size.badgeSm / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    ...textStyles.bodyStrong
  },
  infoPanel: {
    borderRadius: layout.radius.xl,
    padding: layout.spacing.lg,
    gap: layout.spacing.xs
  },
  infoPanelTitle: {
    fontSize: 14,
    ...textStyles.title
  },
  infoPanelMeta: {
    fontSize: 12,
    ...textStyles.label
  },
  posterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.spacing.lg
  },
  posterCopy: {
    flex: 1,
    gap: layout.spacing.xxs
  },
  posterAvatar: {
    width: layout.size.avatarMd,
    height: layout.size.avatarMd,
    borderRadius: layout.radius.lg,
    alignItems: 'center',
    justifyContent: 'center'
  },
  posterAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    ...textStyles.title
  },
  posterName: {
    fontSize: 18,
    ...textStyles.title
  },
  posterSubline: {
    fontSize: 14,
    lineHeight: 20
  },
  posterMetricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: layout.spacing.sm
  },
  posterMetricCard: {
    width: '48%',
    borderRadius: layout.radius.lg,
    borderWidth: 1,
    padding: layout.spacing.lg,
    gap: layout.spacing.xxs
  },
  posterMetricValue: {
    fontSize: 18,
    ...textStyles.title
  },
  posterMetricLabel: {
    fontSize: 12,
    ...textStyles.label
  },
  feedbackCard: {
    borderRadius: layout.radius.lg,
    borderWidth: 1,
    padding: layout.spacing.lg
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 20,
    ...textStyles.bodyStrong
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: layout.spacing.lg,
    borderTopWidth: 1
  },
  pressed: {
    opacity: 0.88
  }
})

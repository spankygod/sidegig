import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'
import { textStyles } from '@/constants/typography'

export const publicGigDetailStyles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject
  },
  screen: {
    flex: 1
  },
  sheet: {
    flex: 0,
    width: '100%',
    height: '80%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden'
  },
  headerBar: {
    borderBottomWidth: 1
  },
  headerHandleWrap: {
    alignItems: 'center',
    paddingBottom: layout.spacing.xs
  },
  headerHandle: {
    width: 38,
    height: 5,
    borderRadius: layout.radius.pill
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
    width: 34,
    height: 34,
    borderRadius: 17,
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
    paddingBottom: layout.sectionGap * 2
  },
  centeredState: {
    minHeight: 360,
    paddingHorizontal: layout.screenPadding,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stateContent: {
    gap: layout.spacing.lg,
    alignItems: 'center',
    width: '100%'
  },
  stateTitle: {
    fontSize: 18,
    ...textStyles.title
  },
  errorTitle: {
    fontSize: 15,
    lineHeight: 22,
    ...textStyles.title,
    textAlign: 'center'
  },
  heroSection: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: layout.sectionGap + layout.spacing.xs,
    paddingBottom: layout.sectionGap,
    gap: layout.spacing.xl
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
  metricStrip: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  metricRow: {
    flexDirection: 'row',
    gap: layout.spacing.sm
  },
  metricColumn: {
    flex: 1,
    gap: layout.spacing.xxs,
    paddingRight: layout.spacing.md
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
  section: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: layout.sectionGap,
    paddingBottom: layout.sectionGap,
    gap: layout.spacing.lg,
    borderTopWidth: 1
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
  metaList: {
    gap: 0
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: layout.spacing.md,
    paddingVertical: layout.spacing.md
  },
  metaIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center'
  },
  metaCopy: {
    flex: 1,
    gap: 3
  },
  metaLabel: {
    fontSize: 12,
    ...textStyles.label
  },
  metaValue: {
    fontSize: 15,
    lineHeight: 21,
    ...textStyles.bodyStrong
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
  posterMetricList: {
    gap: 0
  },
  posterMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: layout.spacing.md,
    paddingVertical: layout.spacing.md
  },
  posterMetricValue: {
    fontSize: 18,
    ...textStyles.title,
    textAlign: 'right'
  },
  posterMetricLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    ...textStyles.bodyStrong
  },
  feedbackBanner: {
    borderRadius: layout.radius.lg,
    borderWidth: 1,
    paddingHorizontal: layout.spacing.lg,
    paddingVertical: layout.spacing.md
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

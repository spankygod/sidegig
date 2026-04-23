import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'
import { textStyles } from '@/constants/typography'

export const profileScreenStyles = StyleSheet.create({
  screen: {
    flex: 1
  },
  contentContainer: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 14,
    paddingBottom: layout.screenBottomPadding,
    gap: layout.sectionGap
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: layout.radius.xxl,
    borderCurve: 'continuous',
    padding: 20,
    gap: 16,
    boxShadow: '0 14px 34px rgba(10, 20, 15, 0.07)'
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: 'hidden'
  },
  avatarFallback: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarFallbackText: {
    fontSize: 26,
    ...textStyles.title
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    gap: 6
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: layout.radius.pill,
    borderCurve: 'continuous',
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  statusPillText: {
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    ...textStyles.label
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    ...textStyles.headline
  },
  heroBody: {
    fontSize: 14,
    lineHeight: 20,
    ...textStyles.bodyStrong
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 22,
    ...textStyles.body
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: layout.radius.pill,
    borderCurve: 'continuous',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  metaPillText: {
    fontSize: 13,
    ...textStyles.bodyStrong
  },
  messageCard: {
    borderWidth: 1,
    borderRadius: layout.radius.lg,
    borderCurve: 'continuous',
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
    ...textStyles.bodyStrong
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    ...textStyles.bodyStrong
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 144,
    borderWidth: 1,
    borderRadius: layout.radius.xl,
    borderCurve: 'continuous',
    padding: 16,
    gap: 8,
    boxShadow: '0 12px 24px rgba(10, 20, 15, 0.05)'
  },
  statLabel: {
    fontSize: 13,
    ...textStyles.label
  },
  statValue: {
    fontSize: 24,
    fontVariant: ['tabular-nums'],
    ...textStyles.numeric
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: layout.radius.xl,
    borderCurve: 'continuous',
    padding: 18,
    gap: 16
  },
  sectionTitle: {
    fontSize: 17,
    ...textStyles.title
  },
  detailStack: {
    gap: 0
  },
  detailItem: {
    gap: 4,
    paddingVertical: 12
  },
  detailSeparator: {
    height: StyleSheet.hairlineWidth
  },
  detailLabel: {
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    ...textStyles.label
  },
  detailValue: {
    fontSize: 15,
    lineHeight: 22,
    ...textStyles.bodyStrong
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  skillPill: {
    borderWidth: 1,
    borderRadius: layout.radius.pill,
    borderCurve: 'continuous',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  skillPillText: {
    fontSize: 13,
    ...textStyles.label
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    ...textStyles.body
  },
  form: {
    gap: 16
  },
  suggestedSkillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12
  },
  actionButton: {
    flex: 1
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: layout.radius.xl,
    borderCurve: 'continuous',
    padding: 20,
    gap: 10
  },
  emptyTitle: {
    fontSize: 22,
    lineHeight: 28,
    ...textStyles.title
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
    ...textStyles.body
  }
})

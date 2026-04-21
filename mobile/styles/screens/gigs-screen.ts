import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'
import { textStyles } from '@/constants/typography'

export const gigsScreenStyles = StyleSheet.create({
  screen: {
    flex: 1
  },
  contentContainer: {
    padding: layout.screenPadding,
    gap: layout.sectionGap
  },
  heroEyebrow: {
    fontSize: 14,
    ...textStyles.label
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    ...textStyles.headline
  },
  heroBody: {
    fontSize: 15,
    lineHeight: 22
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12
  },
  metricCard: {
    flex: 1,
    borderRadius: layout.radius.sm,
    borderCurve: 'continuous',
    borderWidth: 1,
    padding: 16,
    gap: layout.spacing.xs
  },
  metricLabel: {
    fontSize: 13,
    ...textStyles.label
  },
  metricValue: {
    fontSize: 22,
    fontVariant: ['tabular-nums'],
    ...textStyles.numeric
  },
  errorText: {
    fontSize: 15,
    ...textStyles.title
  },
  listSection: {
    gap: 12
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  listTitle: {
    fontSize: 20,
    ...textStyles.title
  },
  emptyTitle: {
    fontSize: 16,
    ...textStyles.title
  },
  emptyBody: {
    fontSize: 15,
    lineHeight: 22
  },
  gigHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12
  },
  gigCopy: {
    flex: 1,
    gap: 6
  },
  gigTitle: {
    fontSize: 18,
    lineHeight: 24,
    ...textStyles.title
  },
  gigMeta: {
    fontSize: 14,
    lineHeight: 20
  },
  gigPrice: {
    fontSize: 17,
    ...textStyles.title
  },
  gigBody: {
    fontSize: 15,
    lineHeight: 22
  },
  gigFootnote: {
    fontSize: 13,
    lineHeight: 18
  }
})

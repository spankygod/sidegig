import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'
import { textStyles } from '@/constants/typography'

export const profileScreenStyles = StyleSheet.create({
  screen: {
    flex: 1
  },
  contentContainer: {
    padding: layout.screenPadding,
    gap: layout.sectionGap
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 32,
    ...textStyles.headline
  },
  heroBody: {
    fontSize: 15,
    lineHeight: 22
  },
  errorText: {
    fontSize: 15,
    ...textStyles.title
  },
  sectionTitle: {
    fontSize: 16,
    ...textStyles.title
  },
  detailStack: {
    gap: 10
  },
  detailItem: {
    gap: 4
  },
  detailLabel: {
    fontSize: 13,
    ...textStyles.label
  },
  detailValue: {
    fontSize: 15,
    lineHeight: 21
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12
  },
  statCard: {
    flex: 1,
    borderRadius: layout.radius.sm,
    borderCurve: 'continuous',
    borderWidth: 1,
    padding: 16,
    gap: layout.spacing.xs
  },
  statLabel: {
    fontSize: 13,
    ...textStyles.label
  },
  statValue: {
    fontSize: 22,
    fontVariant: ['tabular-nums'],
    ...textStyles.numeric
  }
})

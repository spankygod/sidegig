import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'
import { textStyles } from '@/constants/typography'

export const feedHomeHeaderStyles = StyleSheet.create({
  heroBlock: {
    gap: 10
  },
  appBar: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  appBarTitle: {
    fontSize: 13,
    ...textStyles.label,
    letterSpacing: 0.2,
    textTransform: 'capitalize'
  },
  heroTitle: {
    fontSize: 28,
    ...textStyles.headline,
    lineHeight: 32,
    letterSpacing: -0.8
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    ...textStyles.bodyStrong
  },
  iconPill: {
    width: layout.iconButtonSize,
    height: layout.iconButtonSize,
    borderRadius: layout.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8
  },
  searchField: {
    flex: 1,
    minHeight: layout.inputHeight,
    borderRadius: layout.radius.lg,
    paddingHorizontal: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    fontSize: 14,
    ...textStyles.bodyStrong,
    paddingVertical: 0
  },
  clearSearchButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchAction: {
    width: layout.inputHeight,
    height: layout.inputHeight,
    borderRadius: layout.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  segmentWrap: {
    flexDirection: 'row',
    gap: 0,
    padding: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  segmentItem: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0
  },
  segmentItemText: {
    fontSize: 14,
    ...textStyles.label
  },
  segmentItemActiveText: {
    fontSize: 14,
    ...textStyles.label
  },
  pressed: {
    opacity: 0.88
  }
})

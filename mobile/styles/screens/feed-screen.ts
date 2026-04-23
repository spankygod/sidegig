import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'
import { textStyles } from '@/constants/typography'

export const feedScreenStyles = StyleSheet.create({
  screen: {
    flex: 1
  },
  contentContainer: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: layout.screenBottomPadding,
    gap: layout.sectionGap
  },
  screenHeader: {
    paddingBottom: 4
  },
  screenTitle: {
    fontSize: 30,
    lineHeight: 36,
    ...textStyles.headline
  }
})

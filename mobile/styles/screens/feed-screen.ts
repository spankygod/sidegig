import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'

export const feedScreenStyles = StyleSheet.create({
  screen: {
    flex: 1
  },
  contentContainer: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: layout.screenBottomPadding,
    gap: layout.sectionGap
  }
})

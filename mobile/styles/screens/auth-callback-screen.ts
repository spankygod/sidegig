import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'
import { textStyles } from '@/constants/typography'

export const authCallbackScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: layout.spacing.md,
    padding: 24
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    ...textStyles.title
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center'
  }
})

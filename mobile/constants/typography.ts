import type { TextStyle } from 'react-native'

export const appTypography = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  bold: 'Inter_700Bold'
} as const

export const textStyles = {
  body: {
    fontFamily: appTypography.regular
  },
  bodyStrong: {
    fontFamily: appTypography.medium
  },
  label: {
    fontFamily: appTypography.medium
  },
  title: {
    fontFamily: appTypography.bold
  },
  headline: {
    fontFamily: appTypography.bold
  },
  numeric: {
    fontFamily: appTypography.bold
  },
  button: {
    fontFamily: appTypography.medium
  }
} satisfies Record<string, TextStyle>

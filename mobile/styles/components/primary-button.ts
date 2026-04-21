import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'
import { textStyles } from '@/constants/typography'

type PrimaryButtonColors = {
  accent: string
  border: string
  surface: string
  text: string
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: layout.radius.sm,
    borderCurve: 'continuous',
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  text: {
    fontSize: 16,
    ...textStyles.title
  }
})

export function buildPrimaryButtonStyle(
  colors: PrimaryButtonColors,
  options: {
    isDisabled: boolean
    isSecondary: boolean
    pressed: boolean
  }
) {
  const { isDisabled, isSecondary, pressed } = options

  return [
    styles.button,
    {
      backgroundColor: isSecondary ? colors.surface : colors.accent,
      borderColor: isSecondary ? colors.border : colors.accent,
      opacity: isDisabled ? 0.55 : pressed ? 0.9 : 1,
      boxShadow: pressed
        ? '0 4px 14px rgba(15, 118, 110, 0.15)'
        : '0 8px 20px rgba(15, 118, 110, 0.12)'
    }
  ] as const
}

export function buildPrimaryButtonTextStyle(colors: PrimaryButtonColors, isSecondary: boolean) {
  return [
    styles.text,
    {
      color: isSecondary ? colors.text : '#ffffff'
    }
  ] as const
}

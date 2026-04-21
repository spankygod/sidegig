import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'
import { textStyles } from '@/constants/typography'

type TextFieldColors = {
  accent: string
  border: string
  surfaceMuted: string
  text: string
  textMuted: string
}

export const textFieldStyles = StyleSheet.create({
  wrapper: {
    gap: layout.spacing.xs
  },
  label: {
    fontSize: 14,
    ...textStyles.label
  },
  input: {
    borderRadius: layout.radius.sm,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15
  },
  multilineInput: {
    textAlignVertical: 'top'
  }
})

export function buildTextFieldLabelStyle(colors: TextFieldColors) {
  return [
    textFieldStyles.label,
    {
      color: colors.text
    }
  ] as const
}

export function buildTextFieldInputStyle(colors: TextFieldColors, multiline: boolean) {
  return [
    textFieldStyles.input,
    {
      minHeight: multiline ? 120 : layout.inputHeight + 2,
      borderColor: colors.border,
      backgroundColor: colors.surfaceMuted,
      color: colors.text,
      paddingVertical: multiline ? 14 : 12
    },
    multiline ? textFieldStyles.multilineInput : null
  ] as const
}

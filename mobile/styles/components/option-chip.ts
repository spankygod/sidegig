import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'
import { textStyles } from '@/constants/typography'

type OptionChipColors = {
  accent: string
  accentSoft: string
  border: string
  surface: string
  text: string
}

export const optionChipStyles = StyleSheet.create({
  chip: {
    borderRadius: layout.radius.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  label: {
    fontSize: 14,
    ...textStyles.label
  }
})

export function buildOptionChipStyle(
  colors: OptionChipColors,
  selected: boolean,
  pressed: boolean
): StyleProp<ViewStyle> {
  return [
    optionChipStyles.chip,
    {
      borderColor: selected ? colors.accent : colors.border,
      backgroundColor: selected ? colors.accentSoft : colors.surface,
      opacity: pressed ? 0.85 : 1
    }
  ]
}

export function buildOptionChipLabelStyle(colors: OptionChipColors, selected: boolean): StyleProp<TextStyle> {
  return [
    optionChipStyles.label,
    {
      color: selected ? colors.accent : colors.text
    }
  ]
}

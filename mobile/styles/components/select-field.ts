import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'
import { textStyles } from '@/constants/typography'

type SelectFieldColors = {
  accent: string
  accentSoft: string
  border: string
  surfaceMuted: string
  text: string
  textMuted: string
}

export const selectFieldStyles = StyleSheet.create({
  wrapper: {
    gap: layout.spacing.xs
  },
  label: {
    fontSize: 14,
    ...textStyles.label
  },
  trigger: {
    minHeight: layout.inputHeight + 2,
    borderRadius: layout.radius.sm,
    borderCurve: 'continuous',
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 14
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  value: {
    flex: 1,
    fontSize: 15,
    ...textStyles.bodyStrong
  }
})

export function buildSelectFieldLabelStyle(colors: SelectFieldColors): StyleProp<TextStyle> {
  return [
    selectFieldStyles.label,
    {
      color: colors.text
    }
  ]
}

export function buildSelectFieldTriggerStyle(
  colors: SelectFieldColors,
  options: {
    disabled: boolean
    pressed: boolean
  }
): StyleProp<ViewStyle> {
  return [
    selectFieldStyles.trigger,
    {
      borderColor: options.pressed ? colors.textMuted : colors.border,
      backgroundColor: options.pressed ? colors.accentSoft : colors.surfaceMuted,
      opacity: options.disabled ? 0.55 : 1
    }
  ]
}

export function buildSelectFieldValueStyle(
  colors: SelectFieldColors,
  options: {
    disabled: boolean
    hasValue: boolean
  }
): StyleProp<TextStyle> {
  return [
    selectFieldStyles.value,
    {
      color: options.hasValue
        ? (options.disabled ? colors.textMuted : colors.text)
        : colors.textMuted
    }
  ]
}

export function buildSelectFieldIndicatorColor(
  colors: SelectFieldColors,
  options: {
    disabled: boolean
    pressed: boolean
  }
) {
  return options.disabled
    ? colors.textMuted
    : options.pressed
      ? colors.accent
      : colors.textMuted
}

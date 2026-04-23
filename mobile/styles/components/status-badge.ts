import { StyleSheet } from 'react-native'
import { textStyles } from '@/constants/typography'
import type { PaletteMode } from '@/constants/palette'

type StatusBadgeColors = {
  accent: string
  accentSoft: string
  success: string
  warning: string
}

export const statusBadgeStyles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  text: {
    fontSize: 12,
    textTransform: 'uppercase',
    ...textStyles.title
  }
})

export function buildStatusBadgeTone(mode: PaletteMode | undefined, colors: StatusBadgeColors, tone: 'accent' | 'success' | 'warning') {
  return {
    accent: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accent,
      textColor: colors.accent
    },
    success: {
      backgroundColor: mode === 'dark' ? '#1f3b2d' : '#e7f7ee',
      borderColor: colors.success,
      textColor: colors.success
    },
    warning: {
      backgroundColor: mode === 'dark' ? '#3a2818' : '#fff0e5',
      borderColor: colors.warning,
      textColor: colors.warning
    }
  }[tone]
}

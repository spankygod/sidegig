import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'
import { textStyles } from '@/constants/typography'

type LabeledSwitchColors = {
  text: string
  textMuted: string
}

export const labeledSwitchStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: layout.sectionGap
  },
  copy: {
    flex: 1,
    gap: layout.spacing.xxs
  },
  label: {
    fontSize: 15,
    ...textStyles.label
  },
  description: {
    fontSize: 13,
    lineHeight: 18
  }
})

export function buildLabeledSwitchLabelStyle(colors: LabeledSwitchColors) {
  return [
    labeledSwitchStyles.label,
    { color: colors.text }
  ] as const
}

export function buildLabeledSwitchDescriptionStyle(colors: LabeledSwitchColors) {
  return [
    labeledSwitchStyles.description,
    { color: colors.textMuted }
  ] as const
}

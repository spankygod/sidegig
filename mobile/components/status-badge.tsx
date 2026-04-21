import { Text, View } from 'react-native'
import { palette, type PaletteMode } from '@/constants/palette'
import { buildStatusBadgeTone, statusBadgeStyles } from '@/styles/components/status-badge'

type StatusBadgeProps = {
  label: string
  mode?: PaletteMode
  tone?: 'accent' | 'success' | 'warning'
}

export function StatusBadge({ label, mode, tone = 'accent' }: StatusBadgeProps) {
  const colors = palette[mode ?? 'light']
  const toneStyles = buildStatusBadgeTone(mode, colors, tone)

  return (
    <View
      style={[
        statusBadgeStyles.container,
        {
          borderColor: toneStyles.borderColor,
          backgroundColor: toneStyles.backgroundColor
        }
      ]}
    >
      <Text selectable style={[statusBadgeStyles.text, { color: toneStyles.textColor }]}>
        {label}
      </Text>
    </View>
  )
}

import { Pressable, Text } from 'react-native'
import { palette, type PaletteMode } from '@/constants/palette'
import { buildOptionChipLabelStyle, buildOptionChipStyle } from '@/styles/components/option-chip'

type OptionChipProps = {
  label: string
  mode?: PaletteMode
  onPress: () => void
  selected: boolean
}

export function OptionChip({ label, mode, onPress, selected }: OptionChipProps) {
  const colors = palette[mode ?? 'light']

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => buildOptionChipStyle(colors, selected, pressed)}
    >
      <Text selectable style={buildOptionChipLabelStyle(colors, selected)}>
        {label}
      </Text>
    </Pressable>
  )
}

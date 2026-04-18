import { Pressable, Text } from 'react-native'
import { palette, type PaletteMode } from '@/constants/palette'

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
      style={({ pressed }) => ({
        borderRadius: 999,
        borderWidth: 1,
        borderColor: selected ? colors.accent : colors.border,
        backgroundColor: selected ? colors.accentSoft : colors.surface,
        paddingHorizontal: 14,
        paddingVertical: 10,
        opacity: pressed ? 0.85 : 1
      })}
    >
      <Text
        selectable
        style={{
          color: selected ? colors.accent : colors.text,
          fontSize: 14,
          fontWeight: '600'
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

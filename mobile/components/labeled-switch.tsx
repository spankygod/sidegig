import { Switch, Text, View } from 'react-native'
import { palette, type PaletteMode } from '@/constants/palette'

type LabeledSwitchProps = {
  description?: string
  label: string
  mode?: PaletteMode
  onValueChange: (nextValue: boolean) => void
  value: boolean
}

export function LabeledSwitch({
  description,
  label,
  mode,
  onValueChange,
  value
}: LabeledSwitchProps) {
  const colors = palette[mode ?? 'light']

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}
    >
      <View style={{ flex: 1, gap: 4 }}>
        <Text
          selectable
          style={{
            color: colors.text,
            fontSize: 15,
            fontWeight: '600'
          }}
        >
          {label}
        </Text>
        {description == null
          ? null
          : (
            <Text
              selectable
              style={{
                color: colors.textMuted,
                fontSize: 13,
                lineHeight: 18
              }}
            >
              {description}
            </Text>
            )}
      </View>
      <Switch
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.accent }}
        value={value}
      />
    </View>
  )
}

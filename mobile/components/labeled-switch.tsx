import { Switch, Text, View } from 'react-native'
import { palette, type PaletteMode } from '@/constants/palette'
import {
  buildLabeledSwitchDescriptionStyle,
  buildLabeledSwitchLabelStyle,
  labeledSwitchStyles
} from '@/styles/components/labeled-switch'

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
    <View style={labeledSwitchStyles.row}>
      <View style={labeledSwitchStyles.copy}>
        <Text selectable style={buildLabeledSwitchLabelStyle(colors)}>
          {label}
        </Text>
        {description == null
          ? null
          : (
            <Text selectable style={buildLabeledSwitchDescriptionStyle(colors)}>
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

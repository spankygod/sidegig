import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Pressable, Text, View } from 'react-native'
import { palette, type PaletteMode } from '@/constants/palette'
import { buildSelectFieldIndicatorColor, buildSelectFieldLabelStyle, buildSelectFieldTriggerStyle, buildSelectFieldValueStyle, selectFieldStyles } from '@/styles/components/select-field'

type SelectFieldProps = {
  disabled?: boolean
  label: string
  mode?: PaletteMode
  onPress: () => void
  placeholder: string
  value: string | null
}

export function SelectField({
  disabled = false,
  label,
  mode,
  onPress,
  placeholder,
  value
}: SelectFieldProps) {
  const colors = palette[mode ?? 'light']
  const hasValue = value != null && value.trim() !== ''

  return (
    <View style={selectFieldStyles.wrapper}>
      <Text selectable style={buildSelectFieldLabelStyle(colors)}>
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => {
          if (!disabled) {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          }
        }}
        style={({ pressed }) => buildSelectFieldTriggerStyle(colors, { disabled, pressed })}
      >
        {({ pressed }) => (
          <View style={selectFieldStyles.triggerContent}>
            <Text selectable style={buildSelectFieldValueStyle(colors, { disabled, hasValue })}>
              {hasValue ? value : placeholder}
            </Text>
            <Ionicons
              color={buildSelectFieldIndicatorColor(colors, { disabled, pressed })}
              name="chevron-down"
              size={18}
            />
          </View>
        )}
      </Pressable>
    </View>
  )
}

import { Text, TextInput, type TextInputProps, View } from 'react-native'
import { palette, type PaletteMode } from '@/constants/palette'

type TextFieldProps = TextInputProps & {
  label: string
  mode?: PaletteMode
}

export function TextField({ label, mode, ...inputProps }: TextFieldProps) {
  const colors = palette[mode ?? 'light']
  const multiline = inputProps.multiline === true

  return (
    <View style={{ gap: 8 }}>
      <Text
        selectable
        style={{
          color: colors.text,
          fontSize: 14,
          fontWeight: '600'
        }}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.accent}
        {...inputProps}
        style={[
          {
            minHeight: multiline ? 120 : 52,
            borderRadius: 8,
            borderCurve: 'continuous',
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surfaceMuted,
            color: colors.text,
            paddingHorizontal: 14,
            paddingVertical: multiline ? 14 : 12,
            fontSize: 15
          },
          multiline ? { textAlignVertical: 'top' } : null,
          inputProps.style
        ]}
      />
    </View>
  )
}

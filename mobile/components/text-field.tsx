import { Text, type TextInputProps, View } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import { palette, type PaletteMode } from '@/constants/palette'
import { buildTextFieldInputStyle, buildTextFieldLabelStyle, textFieldStyles } from '@/styles/components/text-field'

type TextFieldProps = TextInputProps & {
  label: string
  mode?: PaletteMode
}

export function TextField({ label, mode, ...inputProps }: TextFieldProps) {
  const colors = palette[mode ?? 'light']
  const multiline = inputProps.multiline === true

  return (
    <View style={textFieldStyles.wrapper}>
      <Text selectable style={buildTextFieldLabelStyle(colors)}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.accent}
        {...inputProps}
        style={[
          buildTextFieldInputStyle(colors, multiline),
          inputProps.style
        ]}
      />
    </View>
  )
}

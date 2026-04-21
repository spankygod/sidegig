import type { PropsWithChildren } from 'react'
import { ActivityIndicator, Pressable, Text } from 'react-native'
import { palette, type PaletteMode } from '@/constants/palette'
import { buildPrimaryButtonStyle, buildPrimaryButtonTextStyle } from '@/styles/components/primary-button'

type PrimaryButtonProps = PropsWithChildren<{
  disabled?: boolean
  loading?: boolean
  mode?: PaletteMode
  onPress: () => void
  variant?: 'solid' | 'secondary'
}>

export function PrimaryButton({
  children,
  disabled = false,
  loading = false,
  mode,
  onPress,
  variant = 'solid'
}: PrimaryButtonProps) {
  const colors = palette[mode ?? 'light']
  const isDisabled = disabled || loading
  const isSecondary = variant === 'secondary'

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => buildPrimaryButtonStyle(colors, { isDisabled, isSecondary, pressed })}
    >
      {loading
        ? <ActivityIndicator color={isSecondary ? colors.text : '#ffffff'} />
        : typeof children === 'string' || typeof children === 'number'
          ? (
            <Text selectable style={buildPrimaryButtonTextStyle(colors, isSecondary)}>
              {children}
            </Text>
            )
          : children}
    </Pressable>
  )
}

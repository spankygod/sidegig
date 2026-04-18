import type { PropsWithChildren } from 'react'
import { ActivityIndicator, Pressable, Text } from 'react-native'
import { palette, type PaletteMode } from '@/constants/palette'

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
      style={({ pressed }) => ({
        minHeight: 52,
        borderRadius: 8,
        borderCurve: 'continuous',
        paddingHorizontal: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isSecondary ? colors.surface : colors.accent,
        borderWidth: 1,
        borderColor: isSecondary ? colors.border : colors.accent,
        opacity: isDisabled ? 0.55 : pressed ? 0.9 : 1,
        boxShadow: pressed
          ? '0 4px 14px rgba(15, 118, 110, 0.15)'
          : '0 8px 20px rgba(15, 118, 110, 0.12)'
      })}
    >
      {loading
        ? <ActivityIndicator color={isSecondary ? colors.text : '#ffffff'} />
        : typeof children === 'string' || typeof children === 'number'
          ? (
            <Text
              selectable
              style={{
                color: isSecondary ? colors.text : '#ffffff',
                fontSize: 16,
                fontWeight: '700'
              }}
            >
              {children}
            </Text>
            )
          : children}
    </Pressable>
  )
}

import { Text, View } from 'react-native'
import { palette, type PaletteMode } from '@/constants/palette'

type StatusBadgeProps = {
  label: string
  mode?: PaletteMode
  tone?: 'accent' | 'success' | 'warning'
}

export function StatusBadge({ label, mode, tone = 'accent' }: StatusBadgeProps) {
  const colors = palette[mode ?? 'light']

  const styles = {
    accent: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accent,
      textColor: colors.accent
    },
    success: {
      backgroundColor: mode === 'dark' ? '#1f3b2d' : '#e7f7ee',
      borderColor: colors.success,
      textColor: colors.success
    },
    warning: {
      backgroundColor: mode === 'dark' ? '#3a2818' : '#fff0e5',
      borderColor: colors.warning,
      textColor: colors.warning
    }
  }[tone]

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: styles.borderColor,
        backgroundColor: styles.backgroundColor,
        paddingHorizontal: 10,
        paddingVertical: 5
      }}
    >
      <Text
        selectable
        style={{
          color: styles.textColor,
          fontSize: 12,
          fontWeight: '700',
          textTransform: 'uppercase'
        }}
      >
        {label}
      </Text>
    </View>
  )
}

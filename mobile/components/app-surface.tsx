import type { PropsWithChildren } from 'react'
import { View } from 'react-native'
import { palette, type PaletteMode } from '@/constants/palette'

type AppSurfaceProps = PropsWithChildren<{
  mode?: PaletteMode
  padding?: number
}>

export function AppSurface({ children, mode, padding = 18 }: AppSurfaceProps) {
  const colors = palette[mode ?? 'light']

  return (
    <View
      style={{
        borderRadius: 8,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        padding,
        gap: 12,
        boxShadow: '0 10px 30px rgba(10, 20, 15, 0.06)'
      }}
    >
      {children}
    </View>
  )
}

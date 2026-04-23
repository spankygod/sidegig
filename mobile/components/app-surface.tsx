import type { PropsWithChildren } from 'react'
import { View } from 'react-native'
import { palette, type PaletteMode } from '@/constants/palette'
import { buildAppSurfaceStyle } from '@/styles/components/app-surface'

type AppSurfaceProps = PropsWithChildren<{
  mode?: PaletteMode
  padding?: number
}>

export function AppSurface({ children, mode, padding = 18 }: AppSurfaceProps) {
  const colors = palette[mode ?? 'light']

  return (
    <View style={buildAppSurfaceStyle(colors, padding)}>
      {children}
    </View>
  )
}

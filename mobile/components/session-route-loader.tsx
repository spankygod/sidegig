import { ActivityIndicator, View } from 'react-native'
import { palette, resolvePaletteMode } from '@/constants/palette'
import { useColorScheme } from '@/hooks/use-color-scheme'

export function SessionRouteLoader() {
  const colorScheme = useColorScheme()
  const mode = resolvePaletteMode(colorScheme)
  const colors = palette[mode]

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background
      }}
    >
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  )
}

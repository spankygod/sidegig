import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'

type AppSurfaceColors = {
  border: string
  surface: string
}

const styles = StyleSheet.create({
  container: {
    borderRadius: layout.radius.sm,
    borderCurve: 'continuous',
    borderWidth: 1,
    gap: layout.spacing.md,
    boxShadow: '0 10px 30px rgba(10, 20, 15, 0.06)'
  }
})

export function buildAppSurfaceStyle(colors: AppSurfaceColors, padding: number) {
  return [
    styles.container,
    {
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding
    }
  ] as const
}

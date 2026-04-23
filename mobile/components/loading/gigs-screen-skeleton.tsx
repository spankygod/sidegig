import { StyleSheet, View } from 'react-native'
import { AppSurface } from '@/components/app-surface'
import { SkeletonBlock } from '@/components/loading/skeleton-block'
import { type PaletteMode, palette } from '@/constants/palette'
import { gigsScreenStyles as styles } from '@/styles/screens/gigs-screen'

type GigsScreenSkeletonProps = {
  mode?: PaletteMode
}

export function GigsScreenSkeleton({ mode }: GigsScreenSkeletonProps) {
  const colors = palette[mode ?? 'light']

  return (
    <>
      <AppSurface mode={mode}>
        <SkeletonBlock height={14} mode={mode} radius={7} width={96} />
        <SkeletonBlock height={34} mode={mode} radius={17} width="68%" />
        <SkeletonBlock height={18} mode={mode} radius={9} width="88%" />
        <SkeletonBlock height={18} mode={mode} radius={9} width="74%" />
      </AppSurface>

      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <SkeletonBlock height={14} mode={mode} radius={7} width="58%" />
          <SkeletonBlock height={26} mode={mode} radius={13} width="44%" />
        </View>
        <View style={[styles.metricCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <SkeletonBlock height={14} mode={mode} radius={7} width="54%" />
          <SkeletonBlock height={26} mode={mode} radius={13} width="40%" />
        </View>
        <View style={[styles.metricCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <SkeletonBlock height={14} mode={mode} radius={7} width="60%" />
          <SkeletonBlock height={26} mode={mode} radius={13} width="48%" />
        </View>
      </View>

      <SkeletonBlock height={50} mode={mode} radius={8} />
      <SkeletonBlock height={50} mode={mode} radius={8} />

      <View style={styles.listSection}>
        <View style={styles.listHeader}>
          <SkeletonBlock height={22} mode={mode} radius={11} width={168} />
          <SkeletonBlock height={40} mode={mode} radius={8} width={108} />
        </View>

        <AppSurface mode={mode}>
          <View style={styles.gigHeader}>
            <View style={localStyles.fill}>
              <SkeletonBlock height={22} mode={mode} radius={11} width="64%" />
              <SkeletonBlock height={16} mode={mode} radius={8} style={localStyles.rowGap} width="52%" />
            </View>
            <SkeletonBlock height={28} mode={mode} radius={14} width={84} />
          </View>

          <SkeletonBlock height={18} mode={mode} radius={9} width={112} />
          <SkeletonBlock height={16} mode={mode} radius={8} width="50%" />
          <SkeletonBlock height={16} mode={mode} radius={8} width="60%" />
          <SkeletonBlock height={14} mode={mode} radius={7} width="42%" />
        </AppSurface>

        <AppSurface mode={mode}>
          <View style={styles.gigHeader}>
            <View style={localStyles.fill}>
              <SkeletonBlock height={22} mode={mode} radius={11} width="58%" />
              <SkeletonBlock height={16} mode={mode} radius={8} style={localStyles.rowGap} width="48%" />
            </View>
            <SkeletonBlock height={28} mode={mode} radius={14} width={72} />
          </View>

          <SkeletonBlock height={18} mode={mode} radius={9} width={98} />
          <SkeletonBlock height={16} mode={mode} radius={8} width="46%" />
          <SkeletonBlock height={16} mode={mode} radius={8} width="56%" />
          <SkeletonBlock height={14} mode={mode} radius={7} width="38%" />
        </AppSurface>
      </View>
    </>
  )
}

const localStyles = StyleSheet.create({
  fill: {
    flex: 1
  },
  rowGap: {
    marginTop: 8
  }
})

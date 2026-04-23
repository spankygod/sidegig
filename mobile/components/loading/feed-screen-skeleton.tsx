import { View, StyleSheet } from 'react-native'
import { AppSurface } from '@/components/app-surface'
import { SkeletonBlock } from '@/components/loading/skeleton-block'
import { type PaletteMode, palette } from '@/constants/palette'
import { layout } from '@/constants/theme'
import { feedHomeHeaderStyles as headerStyles } from '@/styles/components/feed-home-header'

type FeedScreenSkeletonProps = {
  mode?: PaletteMode
}

export function FeedScreenSkeleton({ mode }: FeedScreenSkeletonProps) {
  const colors = palette[mode ?? 'light']

  return (
    <>
      <View style={headerStyles.heroBlock}>
        <View style={headerStyles.appBar}>
          <SkeletonBlock height={14} mode={mode} radius={7} width={92} />
          <SkeletonBlock height={40} mode={mode} radius={12} width={40} />
        </View>

        <SkeletonBlock height={32} mode={mode} radius={16} width="72%" />
        <SkeletonBlock height={18} mode={mode} radius={9} width="88%" />
        <SkeletonBlock height={18} mode={mode} radius={9} width="64%" />

        <View style={headerStyles.searchRow}>
          <SkeletonBlock height={layout.inputHeight} mode={mode} radius={layout.radius.lg} style={styles.fill} />
          <SkeletonBlock height={layout.inputHeight} mode={mode} radius={layout.radius.lg} width={layout.inputHeight} />
        </View>
      </View>

      <View
        style={[
          headerStyles.segmentWrap,
          {
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.border
          }
        ]}
      >
        <SkeletonBlock height={42} mode={mode} radius={14} style={styles.fill} />
        <SkeletonBlock height={42} mode={mode} radius={14} style={styles.fill} />
      </View>

      <AppSurface mode={mode}>
        <SkeletonBlock height={18} mode={mode} radius={9} width={120} />
        <SkeletonBlock height={22} mode={mode} radius={11} width="56%" />
        <SkeletonBlock height={16} mode={mode} radius={8} width="92%" />
        <SkeletonBlock height={16} mode={mode} radius={8} width="84%" />

        <View style={styles.metricRow}>
          <SkeletonBlock height={58} mode={mode} radius={18} style={styles.metricCard} />
          <SkeletonBlock height={58} mode={mode} radius={18} style={styles.metricCard} />
          <SkeletonBlock height={58} mode={mode} radius={18} style={styles.metricCard} />
        </View>
      </AppSurface>

      <View style={styles.sectionHeader}>
        <SkeletonBlock height={18} mode={mode} radius={9} width={116} />
        <SkeletonBlock height={16} mode={mode} radius={8} width={68} />
      </View>

      <AppSurface mode={mode}>
        <View style={styles.recentCardHeader}>
          <View style={styles.fill}>
            <SkeletonBlock height={20} mode={mode} radius={10} width="62%" />
            <SkeletonBlock height={16} mode={mode} radius={8} style={styles.topGap} width="44%" />
          </View>
          <SkeletonBlock height={36} mode={mode} radius={12} width={36} />
        </View>
        <View style={styles.bottomRow}>
          <SkeletonBlock height={18} mode={mode} radius={9} width={92} />
          <SkeletonBlock height={16} mode={mode} radius={8} width={74} />
        </View>
      </AppSurface>

      <AppSurface mode={mode}>
        <View style={styles.recentCardHeader}>
          <View style={styles.fill}>
            <SkeletonBlock height={20} mode={mode} radius={10} width="58%" />
            <SkeletonBlock height={16} mode={mode} radius={8} style={styles.topGap} width="40%" />
          </View>
          <SkeletonBlock height={36} mode={mode} radius={12} width={36} />
        </View>
        <View style={styles.bottomRow}>
          <SkeletonBlock height={18} mode={mode} radius={9} width={88} />
          <SkeletonBlock height={16} mode={mode} radius={8} width={78} />
        </View>
      </AppSurface>
    </>
  )
}

const styles = StyleSheet.create({
  fill: {
    flex: 1
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10
  },
  metricCard: {
    flex: 1
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  recentCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  topGap: {
    marginTop: 8
  }
})

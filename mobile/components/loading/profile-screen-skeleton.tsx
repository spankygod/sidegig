import { View } from 'react-native'
import { AppSurface } from '@/components/app-surface'
import { SkeletonBlock } from '@/components/loading/skeleton-block'
import { type PaletteMode, palette } from '@/constants/palette'
import { profileScreenStyles as styles } from '@/styles/screens/profile-screen'

type ProfileScreenSkeletonProps = {
  mode?: PaletteMode
}

export function ProfileScreenSkeleton({ mode }: ProfileScreenSkeletonProps) {
  const colors = palette[mode ?? 'light']

  return (
    <>
      <AppSurface mode={mode}>
        <SkeletonBlock height={32} mode={mode} radius={16} width="58%" />
        <SkeletonBlock height={18} mode={mode} radius={9} width="44%" />
      </AppSurface>

      <AppSurface mode={mode}>
        <SkeletonBlock height={18} mode={mode} radius={9} width={128} />

        <View style={styles.detailStack}>
          <View style={styles.detailItem}>
            <SkeletonBlock height={14} mode={mode} radius={7} width={86} />
            <SkeletonBlock height={18} mode={mode} radius={9} width="52%" />
          </View>
          <View style={styles.detailItem}>
            <SkeletonBlock height={14} mode={mode} radius={7} width={64} />
            <SkeletonBlock height={18} mode={mode} radius={9} width="42%" />
          </View>
          <View style={styles.detailItem}>
            <SkeletonBlock height={14} mode={mode} radius={7} width={52} />
            <SkeletonBlock height={18} mode={mode} radius={9} width="48%" />
          </View>
          <View style={styles.detailItem}>
            <SkeletonBlock height={14} mode={mode} radius={7} width={72} />
            <SkeletonBlock height={18} mode={mode} radius={9} width="78%" />
          </View>
        </View>
      </AppSurface>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <SkeletonBlock height={14} mode={mode} radius={7} width="54%" />
          <SkeletonBlock height={26} mode={mode} radius={13} width="38%" />
        </View>
        <View style={[styles.statCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <SkeletonBlock height={14} mode={mode} radius={7} width="58%" />
          <SkeletonBlock height={26} mode={mode} radius={13} width="44%" />
        </View>
        <View style={[styles.statCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <SkeletonBlock height={14} mode={mode} radius={7} width="62%" />
          <SkeletonBlock height={26} mode={mode} radius={13} width="40%" />
        </View>
      </View>

      <SkeletonBlock height={50} mode={mode} radius={8} />
      <SkeletonBlock height={50} mode={mode} radius={8} />
    </>
  )
}

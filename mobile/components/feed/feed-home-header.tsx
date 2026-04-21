import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { palette, type PaletteMode } from '@/constants/palette'
import { layout } from '@/constants/theme'
import { textStyles } from '@/constants/typography'

export type FeedHomeTab = 'find' | 'create'

type FeedHomeHeaderProps = {
  activeTab: FeedHomeTab
  isRefreshing: boolean
  mode?: PaletteMode
  onChangeSearchQuery: (value: string) => void
  onRefresh: () => void
  onSelectTab: (tab: FeedHomeTab) => void
  searchQuery: string
}

export function FeedHomeHeader({
  activeTab,
  isRefreshing,
  mode,
  onChangeSearchQuery,
  onRefresh,
  onSelectTab,
  searchQuery
}: FeedHomeHeaderProps) {
  const colors = palette[mode ?? 'light']
  const placeholderColor = colors.textMuted

  return (
    <>
      <View style={styles.heroBlock}>
        <View style={styles.appBar}>
          <Text selectable style={[styles.appBarTitle, { color: colors.textMuted }]}>
            Discover jobs
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onRefresh}
            style={({ pressed }) => [
              styles.iconPill,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.border
              },
              pressed ? styles.pressed : null
            ]}
          >
            <Ionicons color={colors.text} name={isRefreshing ? 'sync' : 'refresh-outline'} size={18} />
          </Pressable>
        </View>

        <Text selectable style={[styles.heroTitle, { color: colors.text }]}>
          Search jobs around you.
        </Text>

        <Text selectable style={[styles.heroSubtitle, { color: colors.textMuted }]}>
          Browse nearby roles, filter fast, and jump into the ones that fit.
        </Text>

        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchField,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border
              }
            ]}
          >
            <Ionicons color={placeholderColor} name="search-outline" size={18} />
            <TextInput
              onChangeText={onChangeSearchQuery}
              placeholder="Search job"
              placeholderTextColor={placeholderColor}
              selectionColor={colors.accent}
              style={[styles.searchInput, { color: colors.text }]}
              value={searchQuery}
            />
            {searchQuery.trim() === ''
              ? null
              : (
                <Pressable
                  accessibilityLabel="Clear search"
                  accessibilityRole="button"
                  onPress={() => { onChangeSearchQuery('') }}
                  style={({ pressed }) => [styles.clearSearchButton, pressed ? styles.pressed : null]}
                >
                  <Ionicons color={placeholderColor} name="close" size={16} />
                </Pressable>
                )}
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={onRefresh}
            style={({ pressed }) => [
              styles.searchAction,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.border
              },
              pressed ? styles.pressed : null
            ]}
          >
            <Ionicons color={colors.text} name="funnel-outline" size={18} />
          </Pressable>
        </View>
      </View>

      <View
        style={[
          styles.segmentWrap,
          {
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.border
          }
        ]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => { onSelectTab('find') }}
          style={({ pressed }) => [
            styles.segmentItem,
            activeTab === 'find' ? { backgroundColor: colors.accent } : null,
            pressed ? styles.pressed : null
          ]}
        >
          <Text
            selectable
            style={[
              activeTab === 'find' ? styles.segmentItemActiveText : styles.segmentItemText,
              { color: activeTab === 'find' ? '#ffffff' : colors.text }
            ]}
          >
            Find a gig
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => { onSelectTab('create') }}
          style={({ pressed }) => [
            styles.segmentItem,
            activeTab === 'create' ? { backgroundColor: colors.accent } : null,
            pressed ? styles.pressed : null
          ]}
        >
          <Text
            selectable
            style={[
              activeTab === 'create' ? styles.segmentItemActiveText : styles.segmentItemText,
              { color: activeTab === 'create' ? '#ffffff' : colors.text }
            ]}
          >
            Create a gig
          </Text>
        </Pressable>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  heroBlock: {
    gap: 10
  },
  appBar: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  appBarTitle: {
    fontSize: 13,
    ...textStyles.label,
    letterSpacing: 0.2,
    textTransform: 'capitalize'
  },
  heroTitle: {
    fontSize: 28,
    ...textStyles.headline,
    lineHeight: 32,
    letterSpacing: -0.8
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    ...textStyles.bodyStrong
  },
  iconPill: {
    width: layout.iconButtonSize,
    height: layout.iconButtonSize,
    borderRadius: layout.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8
  },
  searchField: {
    flex: 1,
    minHeight: layout.inputHeight,
    borderRadius: layout.radius.lg,
    paddingHorizontal: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    fontSize: 14,
    ...textStyles.bodyStrong,
    paddingVertical: 0
  },
  clearSearchButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchAction: {
    width: layout.inputHeight,
    height: layout.inputHeight,
    borderRadius: layout.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  segmentWrap: {
    flexDirection: 'row',
    gap: 0,
    padding: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  segmentItem: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0
  },
  segmentItemText: {
    fontSize: 14,
    ...textStyles.label
  },
  segmentItemActiveText: {
    fontSize: 14,
    ...textStyles.label
  },
  pressed: {
    opacity: 0.88
  }
})

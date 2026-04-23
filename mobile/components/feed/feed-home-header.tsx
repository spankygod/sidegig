import { Ionicons } from '@expo/vector-icons'
import { Pressable, Text, TextInput, View } from 'react-native'
import { palette, type PaletteMode } from '@/constants/palette'
import { feedHomeHeaderStyles as styles } from '@/styles/components/feed-home-header'

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
          <Text selectable numberOfLines={1} style={[styles.appBarHeadline, { color: colors.text }]}>
            Gigs around you.
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

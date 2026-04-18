import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { palette, type PaletteMode } from '@/constants/palette'

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

  return (
    <>
      <View style={styles.heroBlock}>
        <View style={styles.appBar}>
          <Text selectable style={[styles.appBarTitle, { color: colors.textMuted }]}>
            Home
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onRefresh}
            style={({ pressed }) => [styles.iconPill, pressed ? styles.pressed : null]}
          >
            <Ionicons color="#11131a" name={isRefreshing ? 'sync' : 'options-outline'} size={18} />
          </Pressable>
        </View>

        <Text selectable style={[styles.heroTitle, { color: colors.text }]}>
          {activeTab === 'find' ? 'Find the right local help fast.' : 'Create a gig workers can act on.'}
        </Text>

        {activeTab === 'find'
          ? (
            <View style={styles.searchRow}>
              <View style={styles.searchField}>
                <Ionicons color="#6d7484" name="search-outline" size={18} />
                <TextInput
                  onChangeText={onChangeSearchQuery}
                  placeholder="Search errands, cleaning, moving..."
                  placeholderTextColor="#6d7484"
                  selectionColor={colors.accent}
                  style={styles.searchInput}
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
                      <Ionicons color="#6d7484" name="close" size={16} />
                    </Pressable>
                    )}
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => { onSelectTab('create') }}
                style={({ pressed }) => [styles.searchAction, pressed ? styles.pressed : null]}
              >
                <Ionicons color="#ffffff" name="add" size={18} />
              </Pressable>
            </View>
            )
          : (
            <View style={styles.createModeHint}>
              <Text selectable style={styles.createModeHintText}>
                Use the form below to publish or save a draft without leaving Home.
              </Text>
            </View>
            )}
      </View>

      <View style={styles.segmentWrap}>
        <Pressable
          accessibilityRole="button"
          onPress={() => { onSelectTab('find') }}
          style={({ pressed }) => [
            styles.segmentItem,
            activeTab === 'find' ? styles.segmentItemActive : null,
            pressed ? styles.pressed : null
          ]}
        >
          <Text selectable style={activeTab === 'find' ? styles.segmentItemActiveText : styles.segmentItemText}>
            Find a gig
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => { onSelectTab('create') }}
          style={({ pressed }) => [
            styles.segmentItem,
            activeTab === 'create' ? styles.segmentItemActive : null,
            pressed ? styles.pressed : null
          ]}
        >
          <Text selectable style={activeTab === 'create' ? styles.segmentItemActiveText : styles.segmentItemText}>
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
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'capitalize'
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
    letterSpacing: -0.8
  },
  iconPill: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f4f4f1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ecece7'
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8
  },
  searchField: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dfe3db',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    color: '#11131a',
    fontSize: 14,
    fontWeight: '500',
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
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#185f37',
    alignItems: 'center',
    justifyContent: 'center'
  },
  createModeHint: {
    minHeight: 50,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#dfe3db',
    backgroundColor: '#f8faf8',
    justifyContent: 'center'
  },
  createModeHintText: {
    color: '#4d5b55',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500'
  },
  segmentWrap: {
    flexDirection: 'row',
    gap: 0,
    padding: 4,
    borderRadius: 18,
    backgroundColor: '#f4f4f1',
    borderWidth: 1,
    borderColor: '#ecece7'
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
  segmentItemActive: {
    backgroundColor: '#185f37'
  },
  segmentItemText: {
    color: '#11131a',
    fontSize: 14,
    fontWeight: '700'
  },
  segmentItemActiveText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  pressed: {
    opacity: 0.88
  }
})

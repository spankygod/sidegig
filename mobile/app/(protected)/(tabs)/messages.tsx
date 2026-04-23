import { Ionicons } from '@expo/vector-icons'
import { ScrollView, Text, View } from 'react-native'
import { palette } from '@/constants/palette'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { messagesScreenStyles as styles } from '@/styles/screens/messages-screen'

type PaletteColors = (typeof palette)[keyof typeof palette]

const featuredReply = {
  name: 'Tae Min',
  note: 'seems to be waiting for a reply to your message since 1 month ago',
  accent: '#d8ddd5'
} as const

const mockThreads = [
  {
    id: 'thread-1',
    name: 'Leader-nim',
    preview: 'Time is running!',
    timeLabel: '1m',
    unreadCount: 4,
    accent: '#d5d9cf',
    status: 'priority'
  },
  {
    id: 'thread-2',
    name: 'Se Hun Oh',
    preview: "Just stop, I'm already late!!",
    timeLabel: '3m',
    unreadCount: 0,
    accent: '#c6d5df',
    status: 'sent'
  },
  {
    id: 'thread-3',
    name: 'Jong Dae Hyung',
    preview: 'Typing...',
    timeLabel: '12m',
    unreadCount: 0,
    accent: '#d4c7bc',
    status: 'typing'
  },
  {
    id: 'thread-4',
    name: 'Yixing Gege',
    preview: 'Voice message',
    timeLabel: '2h',
    unreadCount: 0,
    accent: '#d34d3d',
    status: 'voice'
  },
  {
    id: 'thread-5',
    name: 'Yeollie Hyung',
    preview: "I'll send the rest later",
    timeLabel: '3h',
    unreadCount: 1,
    accent: '#b3b9c8',
    status: 'sent'
  },
  {
    id: 'thread-6',
    name: 'Baek Hyunn',
    preview: 'Photo',
    timeLabel: 'Mon',
    unreadCount: 3,
    accent: '#b7c8c1',
    status: 'photo'
  },
  {
    id: 'thread-7',
    name: 'Min Seok Hyung',
    preview: 'ok hhhhh already on my bag!',
    timeLabel: '1 week',
    unreadCount: 0,
    accent: '#dcc7ce',
    status: 'sent'
  }
] as const

function getPreviewColor(status: (typeof mockThreads)[number]['status'], colors: PaletteColors) {
  if (status === 'typing') {
    return '#6c63ff'
  }

  return colors.textMuted
}

function renderPreviewPrefix(status: (typeof mockThreads)[number]['status'], colors: PaletteColors) {
  if (status === 'voice') {
    return (
      <View style={styles.previewPrefixRow}>
        <Ionicons color={colors.textMuted} name="mic" size={12} />
        <Text selectable style={[styles.previewPrefixText, { color: colors.textMuted }]}>
          Voice message
        </Text>
      </View>
    )
  }

  if (status === 'photo') {
    return (
      <View style={styles.previewPrefixRow}>
        <Ionicons color={colors.textMuted} name="image-outline" size={12} />
        <Text selectable style={[styles.previewPrefixText, { color: colors.textMuted }]}>
          Photo
        </Text>
      </View>
    )
  }

  return null
}

export default function MessagesScreen() {
  const colorScheme = useColorScheme()
  const mode = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = palette[mode]

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.contentContainer}
        style={styles.scrollArea}
      >
        <View style={styles.heroBlock}>
          <Text selectable style={[styles.eyebrow, { color: colors.textMuted }]}>
            Messages
          </Text>
          <Text selectable style={[styles.title, { color: colors.text }]}>
            Messages
          </Text>
          <Text selectable style={[styles.body, { color: colors.textMuted }]}>
            Keep client and helper conversations moving without losing track of replies.
          </Text>
        </View>

        <View style={[styles.tabsRow, { borderBottomColor: colors.border }]}>
          <View style={styles.activeTab}>
            <View style={styles.tabLabelRow}>
              <Ionicons color={colors.text} name="chatbubble-ellipses" size={15} />
              <Text selectable style={[styles.activeTabLabel, { color: colors.text }]}>
                Chats
              </Text>
            </View>
            <View style={[styles.activeTabIndicator, { backgroundColor: colors.text }]} />
          </View>

          <View style={styles.tabLabelRowCompact}>
            <Ionicons color={colors.textMuted} name="call-outline" size={15} />
            <Text selectable style={[styles.inactiveTabLabel, { color: colors.textMuted }]}>
              Call
            </Text>
          </View>
        </View>

        <View style={[styles.searchBar, { backgroundColor: colors.surfaceMuted }]}>
          <Ionicons color={colors.textMuted} name="search-outline" size={16} />
          <Text selectable style={[styles.searchText, { color: colors.textMuted }]}>
            Search messages
          </Text>
          <Ionicons color={colors.textMuted} name="options-outline" size={16} />
        </View>

        <View style={[styles.featuredCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.featuredAvatar, { backgroundColor: featuredReply.accent }]}>
            <Text selectable style={styles.featuredAvatarText}>
              TM
            </Text>
          </View>
          <View style={styles.featuredCopy}>
            <Text selectable style={[styles.featuredMessage, { color: colors.text }]}>
              <Text style={styles.featuredMessageStrong}>{featuredReply.name}</Text>
              <Text> {featuredReply.note} </Text>
              <Text style={{ color: colors.warning }}>🥺</Text>
            </Text>
            <View style={styles.featuredReplyAccent}>
              <Text selectable style={styles.featuredReplyText}>
                Reply Now
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.threadList}>
          {mockThreads.map((thread) => (
            <View key={thread.id} style={styles.threadRow}>
              <View style={[styles.threadAvatar, { backgroundColor: thread.accent }]}>
                <Text selectable style={styles.threadAvatarText}>
                  {thread.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)}
                </Text>
              </View>

              <View style={styles.threadCopy}>
                <View style={styles.threadHeader}>
                  <Text selectable numberOfLines={1} style={[styles.threadName, { color: colors.text }]}>
                    {thread.name}
                  </Text>
                  {thread.status === 'priority'
                    ? (
                      <Text selectable style={styles.threadPin}>
                        📌
                      </Text>
                      )
                    : null}
                </View>

                {renderPreviewPrefix(thread.status, colors) ?? (
                  <Text
                    selectable
                    numberOfLines={1}
                    style={[styles.previewText, { color: getPreviewColor(thread.status, colors) }]}
                  >
                    {thread.status === 'sent' ? '✓✓ ' : ''}
                    {thread.preview}
                  </Text>
                )}
              </View>

              <View style={styles.threadMeta}>
                <Text selectable style={[styles.timeLabel, { color: colors.textMuted }]}>
                  {thread.timeLabel}
                </Text>
                {thread.unreadCount > 0
                  ? (
                    <View style={styles.unreadBadge}>
                      <Text selectable style={styles.unreadBadgeText}>
                        {String(thread.unreadCount)}
                      </Text>
                    </View>
                    )
                  : null}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

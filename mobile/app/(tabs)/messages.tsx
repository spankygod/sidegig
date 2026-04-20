import { Ionicons } from '@expo/vector-icons'
import { ScrollView, Text, View } from 'react-native'
import { palette } from '@/constants/palette'
import { useColorScheme } from '@/hooks/use-color-scheme'

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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Ionicons color={colors.textMuted} name="mic" size={12} />
        <Text
          selectable
          style={{
            color: colors.textMuted,
            fontSize: 13,
            lineHeight: 18
          }}
        >
          Voice message
        </Text>
      </View>
    )
  }

  if (status === 'photo') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Ionicons color={colors.textMuted} name="image-outline" size={12} />
        <Text
          selectable
          style={{
            color: colors.textMuted,
            fontSize: 13,
            lineHeight: 18
          }}
        >
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 112,
          gap: 16
        }}
        style={{ flex: 1 }}
      >
        <View
          style={{
            gap: 10
          }}
        >
          <Text
            selectable
            style={{
              color: colors.textMuted,
              fontSize: 13,
              fontWeight: '700',
              letterSpacing: 0.2
            }}
          >
            Messages
          </Text>
          <Text
            selectable
            style={{
              color: colors.text,
              fontSize: 28,
              fontWeight: '800',
              lineHeight: 34
            }}
          >
            Messages
          </Text>
          <Text
            selectable
            style={{
              color: colors.textMuted,
              fontSize: 15,
              lineHeight: 22
            }}
          >
            Keep client and helper conversations moving without losing track of replies.
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingBottom: 10
          }}
        >
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons color={colors.text} name="chatbubble-ellipses" size={15} />
              <Text
                selectable
                style={{
                  color: colors.text,
                  fontSize: 15,
                  fontWeight: '800'
                }}
              >
                Chats
              </Text>
            </View>
            <View
              style={{
                height: 2,
                width: 108,
                borderRadius: 999,
                backgroundColor: colors.text
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 2 }}>
            <Ionicons color={colors.textMuted} name="call-outline" size={15} />
            <Text
              selectable
              style={{
                color: colors.textMuted,
                fontSize: 15,
                fontWeight: '600'
              }}
            >
              Call
            </Text>
          </View>
        </View>

        <View
          style={{
            minHeight: 42,
            borderRadius: 999,
            backgroundColor: colors.surfaceMuted,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10
          }}
        >
          <Ionicons color={colors.textMuted} name="search-outline" size={16} />
          <Text
            selectable
            style={{
              flex: 1,
              color: colors.textMuted,
              fontSize: 14,
              fontWeight: '500'
            }}
          >
            Search messages
          </Text>
          <Ionicons color={colors.textMuted} name="options-outline" size={16} />
        </View>

        <View
          style={{
            borderRadius: 16,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 14,
            paddingVertical: 11,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: featuredReply.accent,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text
              selectable
              style={{
                color: '#4f6158',
                fontSize: 13,
                fontWeight: '800'
              }}
            >
              TM
            </Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text
              selectable
              style={{
                color: colors.text,
                fontSize: 13,
                lineHeight: 19
              }}
            >
              <Text style={{ fontWeight: '800' }}>{featuredReply.name}</Text>
              <Text> {featuredReply.note} </Text>
              <Text style={{ color: colors.warning }}>🥺</Text>
            </Text>
            <View
              style={{
                alignSelf: 'flex-start',
                borderRadius: 999,
                borderWidth: 1,
                borderColor: '#e3dff8',
                backgroundColor: '#f7f4ff',
                paddingHorizontal: 10,
                paddingVertical: 5
              }}
            >
              <Text
                selectable
                style={{
                  color: '#7b61ff',
                  fontSize: 12,
                  fontWeight: '700'
                }}
              >
                Reply Now
              </Text>
            </View>
          </View>
        </View>

        <View style={{ gap: 2 }}>
          {mockThreads.map((thread) => (
            <View
              key={thread.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 11,
                paddingVertical: 8
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: thread.accent,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text
                  selectable
                  style={{
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: '800'
                  }}
                >
                  {thread.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)}
                </Text>
              </View>

              <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text
                    selectable
                    numberOfLines={1}
                    style={{
                      flexShrink: 1,
                      color: colors.text,
                      fontSize: 15,
                      fontWeight: '800'
                    }}
                  >
                    {thread.name}
                  </Text>
                  {thread.status === 'priority'
                    ? (
                      <Text
                        selectable
                        style={{
                          color: '#7b61ff',
                          fontSize: 12
                        }}
                      >
                        📌
                      </Text>
                      )
                    : null}
                </View>

                {renderPreviewPrefix(thread.status, colors) ?? (
                  <Text
                    selectable
                    numberOfLines={1}
                    style={{
                      color: getPreviewColor(thread.status, colors),
                      fontSize: 13,
                      lineHeight: 18,
                      fontWeight: thread.status === 'typing' ? '600' : '500'
                    }}
                  >
                    {thread.status === 'sent' ? '✓✓ ' : ''}
                    {thread.preview}
                  </Text>
                )}
              </View>

              <View style={{ alignItems: 'flex-end', gap: 8 }}>
                <Text
                  selectable
                  style={{
                    color: colors.textMuted,
                    fontSize: 12,
                    fontWeight: '600'
                  }}
                >
                  {thread.timeLabel}
                </Text>
                {thread.unreadCount > 0
                  ? (
                    <View
                      style={{
                        minWidth: 20,
                        height: 20,
                        paddingHorizontal: 6,
                        borderRadius: 999,
                        backgroundColor: '#d84c4c',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Text
                        selectable
                        style={{
                          color: '#ffffff',
                          fontSize: 11,
                          fontWeight: '800'
                        }}
                      >
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

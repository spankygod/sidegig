import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native'
import { useNavigation } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { palette, resolvePaletteMode } from '@/constants/palette'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { type ChatInboxThread, type ChatMessage, createChatMessage, fetchChatInbox, fetchThreadMessages } from '@/lib/chat-client'
import { supabase } from '@/lib/supabase-client'
import { useSession } from '@/providers/session-provider'
import { messagesScreenStyles as styles } from '@/styles/screens/messages-screen'

type RealtimeChatThreadRow = {
  id: string
  poster_id: string
  worker_id: string
}

type RealtimeChatMessageRow = {
  id: string
  thread_id: string
  sender_id: string
  body: string
  created_at: string
}

const avatarTones = [
  '#1f8a63',
  '#254eda',
  '#d97706',
  '#a21caf',
  '#0f766e',
  '#be123c'
] as const

const inboxTimeFormatter = new Intl.DateTimeFormat('en-PH', {
  hour: 'numeric',
  minute: '2-digit'
})

const inboxWeekdayFormatter = new Intl.DateTimeFormat('en-PH', {
  weekday: 'short'
})

const inboxDateFormatter = new Intl.DateTimeFormat('en-PH', {
  month: 'short',
  day: 'numeric'
})

const messageTimeFormatter = new Intl.DateTimeFormat('en-PH', {
  hour: 'numeric',
  minute: '2-digit'
})

function normalizeSearchValue(value: string): string {
  return value
    .toLocaleLowerCase('en-PH')
    .replace(/\s+/g, ' ')
    .trim()
}

function getAvatarTone(value: string): string {
  let hash = 0

  for (const character of value) {
    hash = ((hash << 5) - hash) + character.charCodeAt(0)
    hash |= 0
  }

  return avatarTones[Math.abs(hash) % avatarTones.length]
}

function getInitials(value: string): string {
  const parts = value.trim().split(/\s+/).filter((part) => part !== '')

  if (parts.length === 0) {
    return 'RK'
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function formatInboxTimestamp(value: string): string {
  const timestamp = new Date(value)
  const now = new Date()
  const sameDate = timestamp.toDateString() === now.toDateString()

  if (sameDate) {
    return inboxTimeFormatter.format(timestamp)
  }

  const diffMs = now.getTime() - timestamp.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffDays < 7) {
    return inboxWeekdayFormatter.format(timestamp)
  }

  return inboxDateFormatter.format(timestamp)
}

function formatMessageTimestamp(value: string): string {
  return messageTimeFormatter.format(new Date(value))
}

function getThreadContextLine(thread: ChatInboxThread): string {
  const parts: string[] = []

  if (thread.contextTitle != null && thread.contextTitle.trim() !== '') {
    parts.push(thread.contextTitle)
  }

  parts.push(thread.contextType === 'hire' ? 'Hire chat' : 'Application chat')

  if (thread.participantCity != null && thread.participantCity.trim() !== '') {
    parts.push(thread.participantCity)
  }

  return parts.join(' · ')
}

function getThreadPreview(thread: ChatInboxThread, currentUserId: string): string {
  if (thread.lastMessageBody == null || thread.lastMessageBody.trim() === '') {
    return 'No messages yet. Open the thread to start the conversation.'
  }

  if (thread.lastMessageSenderId === currentUserId) {
    return `You: ${thread.lastMessageBody}`
  }

  return thread.lastMessageBody
}

function mergeMessages(existingMessages: ChatMessage[], incomingMessage: ChatMessage): ChatMessage[] {
  const existingIndex = existingMessages.findIndex((message) => message.id === incomingMessage.id)

  if (existingIndex >= 0) {
    const nextMessages = [...existingMessages]
    nextMessages[existingIndex] = incomingMessage
    return nextMessages
  }

  return [...existingMessages, incomingMessage].sort((left, right) => (
    Date.parse(left.createdAt) - Date.parse(right.createdAt)
  ))
}

function sortThreads(threads: ChatInboxThread[]): ChatInboxThread[] {
  return [...threads].sort((left, right) => (
    Date.parse(right.lastMessageAt) - Date.parse(left.lastMessageAt)
  ))
}

function updateThreadPreview(
  threads: ChatInboxThread[],
  incomingMessage: ChatMessage
): ChatInboxThread[] {
  const updatedThreads = threads.map((thread) => {
    if (thread.id !== incomingMessage.threadId) {
      return thread
    }

    return {
      ...thread,
      lastMessageAt: incomingMessage.createdAt,
      lastMessageBody: incomingMessage.body,
      lastMessageSenderId: incomingMessage.senderId
    }
  })

  return sortThreads(updatedThreads)
}

function mapRealtimeMessage(row: RealtimeChatMessageRow): ChatMessage {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at
  }
}

export default function MessagesScreen() {
  const colorScheme = useColorScheme()
  const mode = resolvePaletteMode(colorScheme)
  const colors = palette[mode]
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const { session } = useSession()
  const currentUserId = session?.user.id ?? null
  const [threads, setThreads] = React.useState<ChatInboxThread[]>([])
  const [selectedThreadId, setSelectedThreadId] = React.useState<string | null>(null)
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [searchQuery, setSearchQuery] = React.useState('')
  const [draftMessage, setDraftMessage] = React.useState('')
  const [isLoadingThreads, setIsLoadingThreads] = React.useState(false)
  const [isRefreshingThreads, setIsRefreshingThreads] = React.useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(false)
  const [isSendingMessage, setIsSendingMessage] = React.useState(false)
  const [threadsError, setThreadsError] = React.useState<string | null>(null)
  const [messagesError, setMessagesError] = React.useState<string | null>(null)
  const selectedThreadIdRef = React.useRef<string | null>(null)
  const threadIdsRef = React.useRef<string[]>([])
  const messagesListRef = React.useRef<FlatList<ChatMessage> | null>(null)

  const selectedThread = React.useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [selectedThreadId, threads]
  )

  const filteredThreads = React.useMemo(() => {
    const normalizedSearch = normalizeSearchValue(searchQuery)

    if (normalizedSearch === '') {
      return threads
    }

    return threads.filter((thread) => {
      const searchableContent = [
        thread.participantDisplayName,
        thread.participantCity,
        thread.contextTitle,
        thread.lastMessageBody
      ]
        .filter((value): value is string => value != null)
        .join(' ')

      return normalizeSearchValue(searchableContent).includes(normalizedSearch)
    })
  }, [searchQuery, threads])

  const loadInbox = React.useCallback(async (options?: { isRefresh?: boolean }) => {
    if (currentUserId == null) {
      setThreads([])
      setThreadsError(null)
      return
    }

    if (options?.isRefresh) {
      setIsRefreshingThreads(true)
    } else {
      setIsLoadingThreads(true)
    }

    try {
      const nextThreads = await fetchChatInbox(currentUserId)
      setThreads(sortThreads(nextThreads))
      setThreadsError(null)
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : 'Unable to load conversations right now.'
      setThreadsError(nextMessage)
    } finally {
      setIsLoadingThreads(false)
      setIsRefreshingThreads(false)
    }
  }, [currentUserId])

  const loadMessages = React.useCallback(async (threadId: string) => {
    setIsLoadingMessages(true)
    setMessagesError(null)

    try {
      const nextMessages = await fetchThreadMessages(threadId)
      setMessages(nextMessages)
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : 'Unable to load messages right now.'
      setMessagesError(nextMessage)
      setMessages([])
    } finally {
      setIsLoadingMessages(false)
    }
  }, [])

  React.useEffect(() => {
    selectedThreadIdRef.current = selectedThreadId
  }, [selectedThreadId])

  React.useEffect(() => {
    threadIdsRef.current = threads.map((thread) => thread.id)
  }, [threads])

  React.useEffect(() => {
    void loadInbox()
  }, [loadInbox])

  React.useEffect(() => {
    if (selectedThreadId == null) {
      setMessages([])
      setDraftMessage('')
      setMessagesError(null)
      return
    }

    void loadMessages(selectedThreadId)
  }, [loadMessages, selectedThreadId])

  React.useEffect(() => {
    if (selectedThreadId == null) {
      return
    }

    if (threads.some((thread) => thread.id === selectedThreadId)) {
      return
    }

    setSelectedThreadId(null)
  }, [selectedThreadId, threads])

  React.useEffect(() => {
    if (selectedThreadId == null || messages.length === 0) {
      return
    }

    const timeoutId = setTimeout(() => {
      messagesListRef.current?.scrollToEnd({ animated: true })
    }, 40)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [messages.length, selectedThreadId])

  React.useEffect(() => {
    navigation.setOptions({
      tabBarStyle: selectedThreadId == null ? undefined : { display: 'none' }
    })
  }, [navigation, selectedThreadId])

  React.useEffect(() => {
    if (currentUserId == null) {
      return
    }

    const channel = supabase
      .channel(`messages-${currentUserId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_threads'
      }, (payload) => {
        const row = payload.new as RealtimeChatThreadRow

        if (row.poster_id !== currentUserId && row.worker_id !== currentUserId) {
          return
        }

        void loadInbox({ isRefresh: true })
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        const row = payload.new as RealtimeChatMessageRow
        const incomingMessage = mapRealtimeMessage(row)
        const knownThreadIds = threadIdsRef.current

        if (!knownThreadIds.includes(incomingMessage.threadId)) {
          void loadInbox({ isRefresh: true })
          return
        }

        setThreads((currentThreads) => updateThreadPreview(currentThreads, incomingMessage))

        if (selectedThreadIdRef.current === incomingMessage.threadId) {
          setMessages((currentMessages) => mergeMessages(currentMessages, incomingMessage))
        }
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [currentUserId, loadInbox])

  async function handleSendMessage() {
    if (currentUserId == null || selectedThreadId == null) {
      return
    }

    const trimmedMessage = draftMessage.trim()

    if (trimmedMessage === '') {
      return
    }

    setIsSendingMessage(true)
    setMessagesError(null)

    try {
      const sentMessage = await createChatMessage({
        body: trimmedMessage,
        senderId: currentUserId,
        threadId: selectedThreadId
      })

      setDraftMessage('')
      setMessages((currentMessages) => mergeMessages(currentMessages, sentMessage))
      setThreads((currentThreads) => updateThreadPreview(currentThreads, sentMessage))
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : 'Unable to send your message right now.'
      setMessagesError(nextMessage)
    } finally {
      setIsSendingMessage(false)
    }
  }

  if (currentUserId == null) {
    return (
      <View style={[styles.screen, styles.loadingState, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    )
  }

  if (selectedThread != null) {
    const detailSubtitle = getThreadContextLine(selectedThread)

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.screen, { backgroundColor: colors.background }]}
      >
        <View
          style={[
            styles.detailHeader,
            {
              backgroundColor: colors.background,
              borderBottomColor: colors.border,
              paddingTop: Math.max(insets.top + 6, 18)
            }
          ]}
        >
          <Pressable
            accessibilityLabel="Back to conversations"
            accessibilityRole="button"
            onPress={() => { setSelectedThreadId(null) }}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed
            ]}
          >
            <Ionicons color={colors.text} name="chevron-back" size={24} />
          </Pressable>

          <View style={[styles.avatar, { backgroundColor: getAvatarTone(selectedThread.participantId) }]}>
            <Text selectable style={styles.avatarText}>
              {getInitials(selectedThread.participantDisplayName)}
            </Text>
          </View>

          <View style={styles.detailHeaderCopy}>
            <Text numberOfLines={1} selectable style={[styles.detailTitle, { color: colors.text }]}>
              {selectedThread.participantDisplayName}
            </Text>
            <Text numberOfLines={1} selectable style={[styles.detailSubtitle, { color: colors.textMuted }]}>
              {detailSubtitle}
            </Text>
          </View>
        </View>

        <FlatList
          ref={messagesListRef}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[
            styles.messageListContent,
            {
              paddingBottom: layoutPaddingBottom(insets.bottom)
            }
          ]}
          data={messages}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          onRefresh={() => { void loadMessages(selectedThread.id) }}
          refreshing={isLoadingMessages}
          renderItem={({ item }) => {
            const isMine = item.senderId === currentUserId

            return (
              <View
                style={[
                  styles.messageRow,
                  isMine ? styles.messageRowMine : styles.messageRowOther
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    {
                      backgroundColor: isMine ? colors.accent : colors.surface,
                      borderColor: isMine ? colors.accent : colors.border
                    }
                  ]}
                >
                  <Text selectable style={[styles.messageBody, { color: isMine ? '#ffffff' : colors.text }]}>
                    {item.body}
                  </Text>
                  <Text selectable style={[styles.messageTime, { color: isMine ? 'rgba(255,255,255,0.82)' : colors.textMuted }]}>
                    {formatMessageTimestamp(item.createdAt)}
                  </Text>
                </View>
              </View>
            )
          }}
          showsVerticalScrollIndicator={false}
          style={styles.messageList}
          ListEmptyComponent={(
            <View style={styles.emptyState}>
              {isLoadingMessages && <ActivityIndicator color={colors.accent} />}
              {!isLoadingMessages && (
                <>
                  <Text selectable style={[styles.emptyTitle, { color: colors.text }]}>
                    No messages yet
                  </Text>
                  <Text selectable style={[styles.emptyBody, { color: colors.textMuted }]}>
                    Start the conversation with a short, clear first message.
                  </Text>
                </>
              )}
            </View>
          )}
        />

        {messagesError != null && (
          <View style={[styles.errorBanner, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            <Ionicons color={colors.warning} name="alert-circle" size={16} />
            <Text selectable style={[styles.errorText, { color: colors.text }]}>
              {messagesError}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.composerBar,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 12)
            }
          ]}
        >
          <View
            style={[
              styles.composerInputWrap,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border
              }
            ]}
          >
            <TextInput
              editable={!isSendingMessage}
              multiline
              onChangeText={setDraftMessage}
              placeholder="Write a message"
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.accent}
              style={[styles.composerInput, { color: colors.text }]}
              value={draftMessage}
            />
          </View>
          <Pressable
            accessibilityLabel="Send message"
            accessibilityRole="button"
            disabled={isSendingMessage || draftMessage.trim() === ''}
            onPress={() => { void handleSendMessage() }}
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: draftMessage.trim() === '' ? colors.surfaceMuted : colors.accent,
                borderColor: draftMessage.trim() === '' ? colors.border : colors.accent,
                opacity: isSendingMessage ? 0.6 : pressed ? 0.9 : 1
              }
            ]}
          >
            {isSendingMessage
              ? <ActivityIndicator color="#ffffff" size="small" />
              : <Ionicons color="#ffffff" name="send" size={16} />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    )
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.inboxHeader,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingTop: Math.max(insets.top + 8, 18)
          }
        ]}
      >
        <Text selectable style={[styles.inboxTitle, { color: colors.text }]}>
          Messages
        </Text>

        <View
          style={[
            styles.searchField,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border
            }
          ]}
        >
          <Ionicons color={colors.textMuted} name="search-outline" size={18} />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setSearchQuery}
            placeholder="Search conversations"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.accent}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
          />
          {searchQuery.trim() !== '' && (
            <Pressable
              accessibilityLabel="Clear search"
              accessibilityRole="button"
              onPress={() => { setSearchQuery('') }}
              style={({ pressed }) => [styles.clearSearchButton, pressed && styles.pressed]}
            >
              <Ionicons color={colors.textMuted} name="close" size={16} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.threadListContent,
          {
            paddingBottom: Math.max(insets.bottom + 24, 32)
          }
        ]}
        data={filteredThreads}
        ItemSeparatorComponent={() => (
          <View style={[styles.threadSeparator, { backgroundColor: colors.border }]} />
        )}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        onRefresh={() => { void loadInbox({ isRefresh: true }) }}
        refreshing={isRefreshingThreads}
        renderItem={({ item }) => {
          const previewText = getThreadPreview(item, currentUserId)

          return (
            <Pressable
              accessibilityRole="button"
              onPress={() => { setSelectedThreadId(item.id) }}
              style={({ pressed }) => [
                styles.threadRow,
                pressed && { backgroundColor: colors.surfaceMuted },
                pressed && styles.pressed
              ]}
            >
              <View style={[styles.avatar, { backgroundColor: getAvatarTone(item.participantId) }]}>
                <Text selectable style={styles.avatarText}>
                  {getInitials(item.participantDisplayName)}
                </Text>
              </View>

              <View style={styles.threadCopy}>
                <View style={styles.threadTopRow}>
                  <Text numberOfLines={1} selectable style={[styles.threadName, { color: colors.text }]}>
                    {item.participantDisplayName}
                  </Text>
                  <Text selectable style={[styles.threadTime, { color: colors.textMuted }]}>
                    {formatInboxTimestamp(item.lastMessageAt)}
                  </Text>
                </View>

                <Text numberOfLines={1} selectable style={[styles.threadContext, { color: colors.textMuted }]}>
                  {getThreadContextLine(item)}
                </Text>
                <Text numberOfLines={2} selectable style={[styles.threadPreview, { color: colors.text }]}>
                  {previewText}
                </Text>
              </View>
            </Pressable>
          )
        }}
        showsVerticalScrollIndicator={false}
        style={styles.threadList}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            {isLoadingThreads
              ? <ActivityIndicator color={colors.accent} size="large" />
              : (
                <>
                  <Text selectable style={[styles.emptyTitle, { color: colors.text }]}>
                    {threads.length === 0 ? 'No conversations yet' : 'No conversations match that search'}
                  </Text>
                  <Text selectable style={[styles.emptyBody, { color: colors.textMuted }]}>
                    {threads.length === 0
                      ? 'Threads will appear here after an application or hire chat is opened.'
                      : 'Try a name, a gig title, or clear the search field.'}
                  </Text>
                </>
                )}
          </View>
        )}
        ListHeaderComponent={threadsError == null ? null : (
          <View style={styles.listHeaderWrap}>
            <View style={[styles.errorBanner, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
              <Ionicons color={colors.warning} name="alert-circle" size={16} />
              <Text selectable style={[styles.errorText, { color: colors.text }]}>
                {threadsError}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  )
}

function layoutPaddingBottom(insetBottom: number): number {
  return Math.max(insetBottom + 24, 32)
}

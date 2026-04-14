import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppConfig } from '@/components/app-config-provider';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  fetchChatMessages,
  fetchChatThreads,
  fetchMyProfile,
  fetchPublicUserProfile,
  type ChatThreadSummary,
} from '@/lib/api';

type Conversation = {
  id: string;
  avatarTone: string;
  contextLabel: string;
  initials: string;
  isUnread?: boolean;
  lastMessage: string;
  name: string;
  time: string;
  unreadCount?: number;
};

const avatarTones = ['#dbe8fb', '#e8eef9', '#edf3fb', '#e3eefc'];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'R';
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return '';
  }

  const deltaMs = Date.now() - timestamp;
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (deltaMs < minuteMs) {
    return 'Now';
  }

  if (deltaMs < hourMs) {
    return `${Math.max(1, Math.floor(deltaMs / minuteMs))}m`;
  }

  if (deltaMs < dayMs) {
    return `${Math.floor(deltaMs / hourMs)}h`;
  }

  if (deltaMs < 2 * dayMs) {
    return 'Yesterday';
  }

  return `${Math.floor(deltaMs / dayMs)}d`;
}

function getOtherParticipantId(thread: ChatThreadSummary, viewerId: string) {
  return thread.posterId === viewerId ? thread.workerId : thread.posterId;
}

function MessageRow({
  conversation,
  isLast,
}: {
  conversation: Conversation;
  isLast: boolean;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <View
      style={{
        borderBottomColor: isLast ? 'transparent' : palette.borderSoft,
        borderBottomWidth: 1,
        flexDirection: 'row',
        gap: 14,
        paddingVertical: 16,
      }}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: conversation.avatarTone,
          borderRadius: 999,
          height: 48,
          justifyContent: 'center',
          width: 48,
        }}>
        <Text
          selectable
          style={{
            color: palette.accentStrong,
            fontFamily: Fonts.rounded,
            fontSize: 14,
            fontWeight: '800',
          }}>
          {conversation.initials}
        </Text>
      </View>

      <View style={{ flex: 1, gap: 6 }}>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Text
            selectable
            style={{
              color: palette.textStrong,
              fontFamily: Fonts.rounded,
              fontSize: 16,
              fontWeight: conversation.isUnread ? '800' : '700',
            }}>
            {conversation.name}
          </Text>

          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
            <Text
              selectable
              style={{
                color: palette.mutedSoft,
                fontFamily: Fonts.sans,
                fontSize: 12,
              }}>
              {conversation.time}
            </Text>
            {conversation.unreadCount ? (
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: palette.accent,
                  borderRadius: 999,
                  height: 20,
                  justifyContent: 'center',
                  minWidth: 20,
                  paddingHorizontal: 6,
                }}>
                <Text
                  selectable
                  style={{
                    color: palette.inverseText,
                    fontFamily: Fonts.rounded,
                    fontSize: 11,
                    fontWeight: '800',
                  }}>
                  {conversation.unreadCount}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <Text
          selectable
          numberOfLines={2}
          style={{
            color: conversation.isUnread ? palette.text : palette.muted,
            fontFamily: Fonts.sans,
            fontSize: 14,
            lineHeight: 20,
          }}>
          {conversation.lastMessage}
        </Text>

        <Text
          selectable
          style={{
            color: palette.mutedSoft,
            fontFamily: Fonts.sans,
            fontSize: 12,
          }}>
          {conversation.contextLabel}
        </Text>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { accessToken, apiBaseUrl } = useAppConfig();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(accessToken !== '');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (accessToken === '') {
      setConversations([]);
      setIsLoading(false);
      setNotice('Sign in to load your chat threads.');
      return () => {
        isMounted = false;
      };
    }

    setIsLoading(true);
    setNotice(null);

    void Promise.all([
      fetchMyProfile(apiBaseUrl, accessToken),
      fetchChatThreads(apiBaseUrl, accessToken),
    ])
      .then(async ([profile, threads]) => {
        const mapped = await Promise.all(
          threads.map(async (thread, index): Promise<Conversation> => {
            const otherUserId = getOtherParticipantId(thread, profile.id);

            const [otherProfile, messages] = await Promise.all([
              fetchPublicUserProfile(apiBaseUrl, accessToken, otherUserId).catch(() => null),
              fetchChatMessages(apiBaseUrl, accessToken, thread.id, { limit: 1 }).catch(() => []),
            ]);

            const latestMessage = messages[0];
            const name = otherProfile?.displayName ?? 'Raket user';
            const contextLabel = thread.contextType === 'hire' ? 'Hire chat' : 'Application chat';

            return {
              id: thread.id,
              avatarTone: avatarTones[index % avatarTones.length],
              contextLabel,
              initials: getInitials(name),
              lastMessage: latestMessage?.body ?? `No messages yet. ${contextLabel} is ready.`,
              name,
              time: formatRelativeTime(latestMessage?.createdAt ?? thread.updatedAt),
            };
          })
        );

        if (!isMounted) {
          return;
        }

        setConversations(mapped);
        setNotice(mapped.length === 0 ? 'No chat threads yet. Threads open from applications and hires.' : null);
      })
      .catch(() => {
        if (isMounted) {
          setConversations([]);
          setNotice('Unable to load your chat threads right now.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken, apiBaseUrl]);

  return (
    <ScrollView
      contentContainerStyle={{
        gap: 14,
        paddingBottom: tabBarHeight + insets.bottom + 28,
        paddingHorizontal: 20,
        paddingTop: insets.top + 12,
      }}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: palette.background }}>
      <Animated.View entering={FadeInUp.duration(320)} style={{ gap: 4 }}>
        <Text
          selectable
          style={{
            color: palette.textStrong,
            fontFamily: Fonts.rounded,
            fontSize: 30,
            fontWeight: '800',
            lineHeight: 34,
          }}>
          Inbox
        </Text>
        <Text
          selectable
          style={{
            color: palette.muted,
            fontFamily: Fonts.sans,
            fontSize: 14,
          }}>
          Your latest messages and replies.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).duration(360)} style={{ overflow: 'hidden' }}>
        {isLoading ? <ActivityIndicator color={palette.accentStrong} /> : null}
        {notice ? (
          <Text
            selectable
            style={{
              color: palette.muted,
              fontFamily: Fonts.sans,
              fontSize: 14,
              lineHeight: 20,
              paddingVertical: 16,
            }}>
            {notice}
          </Text>
        ) : null}
        {conversations.map((conversation, index) => (
          <MessageRow key={conversation.id} conversation={conversation} isLast={index === conversations.length - 1} />
        ))}
      </Animated.View>
    </ScrollView>
  );
}

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Conversation = {
  id: string;
  avatarTone: string;
  initials: string;
  isUnread?: boolean;
  lastMessage: string;
  name: string;
  time: string;
  unreadCount?: number;
};

const conversations: Conversation[] = [
  {
    id: 'chat-1',
    avatarTone: '#dbe8fb',
    initials: 'CM',
    isUnread: true,
    lastMessage: 'Can you arrive by 1 PM? I already sent the building access details.',
    name: 'Casa Mila',
    time: '2m',
    unreadCount: 2,
  },
  {
    id: 'chat-2',
    avatarTone: '#e8eef9',
    initials: 'LR',
    isUnread: true,
    lastMessage: 'Please bring gloves and extra trash bags if you have them.',
    name: 'Luna Residences',
    time: '18m',
    unreadCount: 1,
  },
  {
    id: 'chat-3',
    avatarTone: '#edf3fb',
    initials: 'RF',
    lastMessage: 'We can adjust the start time to 10:30 if traffic is bad.',
    name: 'Reyes Family',
    time: '1h',
  },
  {
    id: 'chat-4',
    avatarTone: '#e3eefc',
    initials: 'BR',
    lastMessage: 'Noted. I will prepare the tools and message you in the morning.',
    name: 'BuildRight Crew',
    time: 'Yesterday',
  },
];

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
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

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
        {conversations.map((conversation, index) => (
          <MessageRow key={conversation.id} conversation={conversation} isLast={index === conversations.length - 1} />
        ))}
      </Animated.View>
    </ScrollView>
  );
}

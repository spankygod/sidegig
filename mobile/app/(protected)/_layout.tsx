import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { AuthRouteGuard } from '@/components/auth/auth-route-guard';
import { HapticTab } from '@/components/haptic-tab';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProtectedLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <AuthRouteGuard mode="protected">
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: palette.background },
          tabBarActiveTintColor: palette.text,
          tabBarButton: HapticTab,
          tabBarInactiveTintColor: palette.muted,
          tabBarLabelStyle: {
            fontFamily: Fonts.rounded,
            fontSize: 11,
            fontWeight: '700',
          },
          tabBarStyle: {
            backgroundColor: palette.surface,
            borderTopColor: palette.border,
            height: 72,
            paddingBottom: 10,
            paddingTop: 10,
          },
        }}>
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons color={color} name={focused ? 'home' : 'home-outline'} size={20} />
            ),
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="review"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons color={color} name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'} size={20} />
            ),
            title: 'Hiring',
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons color={color} name={focused ? 'chatbubble' : 'chatbubble-outline'} size={20} />
            ),
            title: 'Chat',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons color={color} name={focused ? 'person' : 'person-outline'} size={20} />
            ),
            title: 'Profile',
          }}
        />
      </Tabs>
    </AuthRouteGuard>
  );
}

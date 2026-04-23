import { Ionicons } from '@expo/vector-icons'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Pressable, useWindowDimensions, View } from 'react-native'
import { Tabs } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { palette, resolvePaletteMode } from '@/constants/palette'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { tabLayoutStyles as styles } from '@/styles/screens/tab-layout'

function getTabBarBottomOffset(bottomInset: number): number {
  if (bottomInset > 0) {
    return bottomInset + 6
  }

  return 16
}

function getTabTintColor(isFocused: boolean): string {
  if (isFocused) {
    return '#48d68e'
  }

  return 'rgba(255, 255, 255, 0.86)'
}

function getTabAccessibilityState(isFocused: boolean) {
  if (isFocused) {
    return { selected: true } as const
  }

  return undefined
}

function getHomeTabIconName(isFocused: boolean): 'home' | 'home-outline' {
  if (isFocused) {
    return 'home'
  }

  return 'home-outline'
}

function getGigsTabIconName(isFocused: boolean): 'briefcase' | 'briefcase-outline' {
  if (isFocused) {
    return 'briefcase'
  }

  return 'briefcase-outline'
}

function getMessagesTabIconName(isFocused: boolean): 'chatbubble-ellipses' | 'chatbubble-ellipses-outline' {
  if (isFocused) {
    return 'chatbubble-ellipses'
  }

  return 'chatbubble-ellipses-outline'
}

function getProfileTabIconName(isFocused: boolean): 'person' | 'person-outline' {
  if (isFocused) {
    return 'person'
  }

  return 'person-outline'
}

function shouldHideTabBar(style: unknown): boolean {
  if (Array.isArray(style)) {
    return style.some((item) => shouldHideTabBar(item))
  }

  if (style == null || typeof style !== 'object') {
    return false
  }

  return 'display' in style && style.display === 'none'
}

function FloatingTabBar({ descriptors, navigation, state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const { width: windowWidth } = useWindowDimensions()
  const dockWidth = Math.min(windowWidth - 24, 208)
  const activeRouteKey = state.routes[state.index]?.key
  const activeDescriptor = activeRouteKey == null ? null : descriptors[activeRouteKey]

  if (activeDescriptor != null && shouldHideTabBar(activeDescriptor.options.tabBarStyle)) {
    return null
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          bottom: getTabBarBottomOffset(insets.bottom)
        }
      ]}
    >
      <View style={[styles.dock, { width: dockWidth }]}>
        {state.routes.map((route) => {
          const descriptor = descriptors[route.key]
          const { options } = descriptor
          const isFocused = route.key === activeRouteKey
          const tintColor = getTabTintColor(isFocused)
          const accessibilityState = getTabAccessibilityState(isFocused)

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params)
            }
          }

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key
            })
          }

          return (
            <Pressable
              key={route.key}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              accessibilityRole="button"
              accessibilityState={accessibilityState}
              onLongPress={onLongPress}
              onPress={onPress}
              style={({ pressed }) => [
                styles.item,
                isFocused && styles.itemActive,
                pressed && styles.itemPressed
              ]}
              testID={options.tabBarButtonTestID}
            >
              {options.tabBarIcon?.({
                focused: isFocused,
                color: tintColor,
                size: 20
              })}
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const mode = resolvePaletteMode(colorScheme)
  const colors = palette[mode]

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.background
        },
        headerTintColor: colors.text,
        sceneStyle: {
          backgroundColor: colors.background
        },
        tabBarHideOnKeyboard: true
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          headerShown: false,
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={getHomeTabIconName(focused)} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="gigs"
        options={{
          title: 'Gigs',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={getGigsTabIconName(focused)} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          headerShown: false,
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={getMessagesTabIconName(focused)} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={getProfileTabIconName(focused)} size={size} />
          )
        }}
      />
    </Tabs>
  )
}

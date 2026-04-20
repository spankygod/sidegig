import { Ionicons } from '@expo/vector-icons'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { ActivityIndicator, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native'
import { Redirect, Tabs } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { palette } from '@/constants/palette'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useSession } from '@/providers/session-provider'

function FloatingTabBar({ descriptors, navigation, state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const { width: windowWidth } = useWindowDimensions()
  const dockWidth = Math.min(windowWidth - 24, 208)
  const activeRouteKey = state.routes[state.index]?.key

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          bottom: insets.bottom > 0 ? insets.bottom + 6 : 16
        }
      ]}
    >
      <View style={[styles.dock, { width: dockWidth }]}> 
        {state.routes.map((route) => {
          const descriptor = descriptors[route.key]
          const { options } = descriptor
          const isFocused = route.key === activeRouteKey
          const tintColor = isFocused ? '#48d68e' : 'rgba(255, 255, 255, 0.86)'

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
              accessibilityState={isFocused ? { selected: true } : {}}
              onLongPress={onLongPress}
              onPress={onPress}
              style={({ pressed }) => [
                styles.item,
                isFocused ? styles.itemActive : null,
                pressed ? styles.itemPressed : null
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
  const mode = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = palette[mode]
  const { isReady, session } = useSession()

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background
        }}
      >
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    )
  }

  if (session == null) {
    return <Redirect href="/sign-in" />
  }

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
            <Ionicons color={color} name={focused ? 'home' : 'home-outline'} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="gigs"
        options={{
          title: 'Gigs',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={focused ? 'briefcase' : 'briefcase-outline'} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          headerShown: false,
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={focused ? 'person' : 'person-outline'} size={size} />
          )
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  dock: {
    height: 52,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: '#050505',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 12
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 16
  },
  item: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemActive: {
    backgroundColor: '#185f37'
  },
  itemPressed: {
    opacity: 0.82
  }
})

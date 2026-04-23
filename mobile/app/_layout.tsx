import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter'
import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-reanimated'
import { palette, type PaletteMode, resolvePaletteMode } from '@/constants/palette'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { SessionProvider } from '@/providers/session-provider'
import { rootLayoutStyles as styles } from '@/styles/screens/root-layout'

export const unstable_settings = {
  anchor: '(protected)'
}

void SplashScreen.preventAutoHideAsync()

function buildTheme(mode: 'light' | 'dark'): Theme {
  const colors = palette[mode]
  const baseTheme = getBaseTheme(mode)

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: colors.background,
      card: colors.surface,
      border: colors.border,
      primary: colors.accent,
      text: colors.text
    }
  }
}

function getBaseTheme(mode: PaletteMode): Theme {
  if (mode === 'dark') {
    return DarkTheme
  }

  return DefaultTheme
}

function getStatusBarStyle(mode: PaletteMode): 'light' | 'dark' {
  if (mode === 'dark') {
    return 'light'
  }

  return 'dark'
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const resolvedMode = resolvePaletteMode(colorScheme)
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold
  })

  React.useEffect(() => {
    if (!fontsLoaded) {
      return
    }

    void SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SessionProvider>
        <ThemeProvider value={buildTheme(resolvedMode)}>
          <Stack
            screenOptions={{
              contentStyle: {
                backgroundColor: palette[resolvedMode].background
              },
              headerBackButtonDisplayMode: 'minimal'
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(guest)" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="(protected)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style={getStatusBarStyle(resolvedMode)} />
        </ThemeProvider>
      </SessionProvider>
    </GestureHandlerRootView>
  )
}

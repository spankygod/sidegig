import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppConfig } from '@/components/app-config-provider';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AuthCallbackScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const { accessToken, refreshSession } = useAppConfig();
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  useEffect(() => {
    let isActive = true;

    void refreshSession()
      .catch(() => undefined)
      .finally(() => {
        if (isActive) {
          setHasCheckedSession(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, [refreshSession]);

  useEffect(() => {
    if (!hasCheckedSession) {
      return;
    }

    router.replace(accessToken === '' ? '/sign-in' : '/profile');
  }, [accessToken, hasCheckedSession]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <View style={styles.screen}>
        <ActivityIndicator color={palette.tint} />
        <Text style={[styles.title, { color: palette.text }]}>Completing sign-in...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 18,
    fontWeight: '700',
  },
});

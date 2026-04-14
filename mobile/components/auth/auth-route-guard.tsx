import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAppConfig } from '@/components/app-config-provider';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AuthRouteGuardProps = {
  children: React.ReactNode;
  mode: 'guest' | 'protected';
};

export function AuthRouteGuard({ children, mode }: AuthRouteGuardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const { accessToken, isAuthReady } = useAppConfig();

  if (!isAuthReady) {
    return (
      <View style={[styles.screen, { backgroundColor: palette.background }]}>
        <ActivityIndicator color={palette.tint} />
      </View>
    );
  }

  if (mode === 'guest' && accessToken !== '') {
    return <Redirect href="/home" />;
  }

  if (mode === 'protected' && accessToken === '') {
    return <Redirect href="/sign-in" />;
  }

  return children;
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

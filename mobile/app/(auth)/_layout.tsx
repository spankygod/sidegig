import { Stack } from 'expo-router';

import { AuthRouteGuard } from '@/components/auth/auth-route-guard';

export default function AuthLayout() {
  return (
    <AuthRouteGuard mode="guest">
      <Stack>
        <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack>
    </AuthRouteGuard>
  );
}

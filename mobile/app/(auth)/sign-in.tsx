import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoogleLogo } from '@/components/auth/google-logo';
import { useAppConfig } from '@/components/app-config-provider';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { signInWithGoogle } from '@/lib/supabase';

export default function SignInScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const { isSupabaseConfigured } = useAppConfig();

  const [email, setEmail] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    if (!isSupabaseConfigured) {
      setNotice('Add your Supabase URL and publishable key in mobile env first.');
      return;
    }

    setNotice(null);
    setIsGoogleLoading(true);

    try {
      await signInWithGoogle();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Google sign-in failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  }

  function handleEmailContinue() {
    if (email.trim() === '') {
      setNotice('Enter an email or use Google sign-in.');
      return;
    }

    setNotice('Email sign-in is not wired yet. Use Google for now.');
  }

  function handleApplePress() {
    Alert.alert('Apple sign-in', 'Apple sign-in is not wired yet.');
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <View style={styles.screen}>
        <View style={[styles.panel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.title, { color: palette.text }]}>Log in or sign up</Text>

          <View style={[styles.inputShell, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="email@example.com"
              placeholderTextColor={palette.muted}
              style={[styles.input, { color: palette.text }]}
              value={email}
            />
            {email !== '' ? (
              <Pressable
                accessibilityLabel="Clear email"
                hitSlop={10}
                onPress={() => setEmail('')}
                style={styles.clearButton}>
                <Ionicons color={palette.muted} name="close-circle" size={18} />
              </Pressable>
            ) : null}
          </View>

          <Pressable
            onPress={handleEmailContinue}
            style={[styles.primaryButton, { backgroundColor: palette.text }]}>
            <Text style={[styles.primaryButtonLabel, { color: palette.background }]}>Continue</Text>
          </Pressable>

          <View style={styles.orRow}>
            <View style={[styles.rule, { backgroundColor: palette.border }]} />
            <Text style={[styles.orLabel, { color: palette.muted }]}>or</Text>
            <View style={[styles.rule, { backgroundColor: palette.border }]} />
          </View>

          <Pressable
            disabled={isGoogleLoading}
            onPress={() => {
              void handleGoogleSignIn();
            }}
            style={[
              styles.secondaryButton,
              { backgroundColor: palette.surface, borderColor: palette.border, opacity: isGoogleLoading ? 0.72 : 1 },
            ]}>
            <View style={styles.buttonContent}>
              <View style={[styles.brandBadge, { backgroundColor: palette.background, borderColor: palette.border }]}>
                <GoogleLogo color={palette.text} />
              </View>
              <Text style={[styles.secondaryButtonLabel, { color: palette.text }]}>
                {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={handleApplePress}
            style={[styles.secondaryButton, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <View style={styles.buttonContent}>
              <View style={[styles.brandBadge, { backgroundColor: palette.text }]}>
                <Ionicons color={palette.background} name="logo-apple" size={16} />
              </View>
              <Text style={[styles.secondaryButtonLabel, { color: palette.text }]}>Continue with Apple</Text>
            </View>
          </Pressable>

          {notice != null ? (
            <Text style={[styles.notice, { color: palette.muted }]}>{notice}</Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  panel: {
    alignSelf: 'center',
    borderRadius: 28,
    borderWidth: 1,
    gap: 14,
    maxWidth: 420,
    padding: 20,
    width: '100%',
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
    textAlign: 'center',
  },
  inputShell: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 54,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 16,
    minHeight: 54,
  },
  clearButton: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 54,
  },
  primaryButtonLabel: {
    fontFamily: Fonts.rounded,
    fontSize: 17,
    fontWeight: '800',
  },
  orRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  rule: {
    flex: 1,
    height: 1,
  },
  orLabel: {
    fontFamily: Fonts.sans,
    fontSize: 15,
  },
  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  buttonContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  brandBadge: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  secondaryButtonLabel: {
    fontFamily: Fonts.rounded,
    fontSize: 16,
    fontWeight: '700',
  },
  notice: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});

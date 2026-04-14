import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import {
  CryptoDigestAlgorithm,
  digest,
  getRandomValues,
  randomUUID,
} from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { AppState, Platform } from 'react-native';
import { createClient, processLock } from '@supabase/supabase-js';

WebBrowser.maybeCompleteAuthSession();

function ensureWebCrypto() {
  const currentCrypto = (globalThis.crypto ?? {}) as Crypto & {
    getRandomValues?: Crypto['getRandomValues'];
    randomUUID?: Crypto['randomUUID'];
    subtle?: SubtleCrypto;
  };

  if (typeof currentCrypto.getRandomValues !== 'function') {
    currentCrypto.getRandomValues = (<T extends ArrayBufferView>(array: T) =>
      getRandomValues(array as unknown as Parameters<typeof getRandomValues>[0]) as unknown as T) as Crypto['getRandomValues'];
  }

  if (typeof currentCrypto.randomUUID !== 'function') {
    currentCrypto.randomUUID = (() => randomUUID()) as Crypto['randomUUID'];
  }

  if (typeof currentCrypto.subtle === 'undefined') {
    currentCrypto.subtle = {
      digest: async (algorithm: AlgorithmIdentifier, data: BufferSource) => {
        const normalizedAlgorithm =
          typeof algorithm === 'string' ? algorithm.toUpperCase() : String((algorithm as { name?: string }).name ?? '').toUpperCase();

        if (normalizedAlgorithm !== 'SHA-256') {
          throw new Error(`Unsupported digest algorithm: ${normalizedAlgorithm}`);
        }

        return await digest(CryptoDigestAlgorithm.SHA256, data);
      },
    } as SubtleCrypto;
  }

  if (typeof globalThis.crypto === 'undefined') {
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: currentCrypto,
    });
  }
}

ensureWebCrypto();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl !== '' && supabasePublishableKey !== '');

// Use the exact allow-listed deep link so Supabase does not fall back to the Site URL.
export const supabaseRedirectUrl = 'raket://auth/callback';

type PersistedAuthPayload = {
  provider_refresh_token?: string | null;
  provider_token?: string | null;
};

function prunePersistedSessionValue(value: string): string {
  try {
    const parsed = JSON.parse(value) as PersistedAuthPayload;

    if (parsed != null && typeof parsed === 'object') {
      delete parsed.provider_token;
      delete parsed.provider_refresh_token;
      return JSON.stringify(parsed);
    }
  } catch {
    // Non-JSON values such as PKCE code verifiers should be stored as-is.
  }

  return value;
}

const secureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, prunePersistedSessionValue(value)),
};

function readCallbackParam(callbackUrl: URL, name: string): string | null {
  const fragmentParams = new URLSearchParams(callbackUrl.hash.startsWith('#') ? callbackUrl.hash.slice(1) : callbackUrl.hash);

  return callbackUrl.searchParams.get(name) ?? fragmentParams.get(name);
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'sb_publishable_placeholder',
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
      lock: processLock,
      persistSession: true,
      storage: secureStoreAdapter,
      userStorage: AsyncStorage,
    },
  }
);

if (Platform.OS !== 'web') {
  const updateAutoRefresh = (state: string) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
      return;
    }

    supabase.auth.stopAutoRefresh();
  };

  updateAutoRefresh(AppState.currentState);
  AppState.addEventListener('change', updateAutoRefresh);
}

export async function signInWithGoogle(): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase mobile auth is not configured.');
  }

  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    throw new Error('Google sign-in requires a development build or standalone app. Expo Go uses exp:// and cannot finish this raket:// redirect.');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: supabaseRedirectUrl,
      skipBrowserRedirect: true,
    },
  });

  if (error != null) {
    throw error;
  }

  if (data.url == null || data.url === '') {
    throw new Error('Supabase did not return an OAuth URL.');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, supabaseRedirectUrl);

  if (result.type !== 'success') {
    throw new Error(result.type === 'cancel' ? 'Google sign-in was canceled.' : 'Google sign-in did not complete.');
  }

  const callbackUrl = new URL(result.url);
  const code = readCallbackParam(callbackUrl, 'code');
  const authError = readCallbackParam(callbackUrl, 'error_description') ?? readCallbackParam(callbackUrl, 'error');

  if (authError != null && authError !== '') {
    throw new Error(`Google sign-in returned an auth error: ${authError}`);
  }

  if (code == null || code === '') {
    throw new Error('Supabase did not return an authorization code.');
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError != null) {
    throw new Error(`Supabase session exchange failed: ${exchangeError.message}`);
  }
}

export async function signOutSupabase(): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  await supabase.auth.signOut();
}

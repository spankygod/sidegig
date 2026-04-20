import 'react-native-url-polyfill/auto'

import { createClient, processLock } from '@supabase/supabase-js'
import { AppState, Platform } from 'react-native'
import { mobileEnv } from '@/lib/mobile-env'

const inMemoryStorage = new Map<string, string>()

function getSupabaseStorage() {
  if (Platform.OS === 'web') {
    return undefined
  }

  try {
    // Some local dev clients are built without the native AsyncStorage module.
    // Fall back to in-memory storage so the app can still boot.
    return require('@react-native-async-storage/async-storage').default
  } catch (error) {
    console.warn('AsyncStorage native module unavailable. Falling back to in-memory auth session storage.', error)

    return {
      getItem(key: string) {
        return Promise.resolve(inMemoryStorage.get(key) ?? null)
      },
      setItem(key: string, value: string) {
        inMemoryStorage.set(key, value)
        return Promise.resolve()
      },
      removeItem(key: string) {
        inMemoryStorage.delete(key)
        return Promise.resolve()
      }
    }
  }
}

export const supabase = createClient(
  mobileEnv.supabaseUrl,
  mobileEnv.supabasePublishableKey,
  {
    auth: {
      ...(Platform.OS !== 'web' ? { storage: getSupabaseStorage() } : {}),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock
    }
  }
)

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
      return
    }

    supabase.auth.stopAutoRefresh()
  })
}

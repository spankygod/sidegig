import Constants from 'expo-constants';
import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import type { Session } from '@supabase/supabase-js';

import { isSupabaseConfigured, signOutSupabase, supabase } from '@/lib/supabase';

type AppConfigContextValue = {
  accessToken: string;
  apiBaseUrl: string;
  isAuthReady: boolean;
  isSupabaseConfigured: boolean;
  refreshSession: () => Promise<void>;
  userEmail: string | null;
  signOut: () => Promise<void>;
  setAccessToken: (value: string) => void;
  setApiBaseUrl: (value: string) => void;
};

const expoApiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  'http://127.0.0.1:3000';

const AppConfigContext = createContext<AppConfigContextValue | null>(null);

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

export function AppConfigProvider({ children }: PropsWithChildren) {
  const [apiBaseUrl, setApiBaseUrlState] = useState(normalizeBaseUrl(expoApiBaseUrl));
  const [accessToken, setAccessTokenState] = useState('');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  function applySession(session: Session | null) {
    setAccessTokenState(session?.access_token ?? '');
    setUserEmail(session?.user.email ?? null);
  }

  const refreshSession = useCallback(async () => {
    if (!isSupabaseConfigured) {
      applySession(null);
      return;
    }

    const { data, error } = await supabase.auth.getSession();

    if (error != null) {
      throw error;
    }

    applySession(data.session);
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      applySession(null);
      setIsAuthReady(true);
      return () => {
        isMounted = false;
      };
    }

    void refreshSession()
      .catch(() => {
        if (isMounted) {
          applySession(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsAuthReady(true);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      applySession(session);
      setIsAuthReady(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [refreshSession]);

  return (
    <AppConfigContext.Provider
      value={{
        accessToken,
        apiBaseUrl,
        isAuthReady,
        isSupabaseConfigured,
        refreshSession,
        userEmail,
        signOut: async () => {
          applySession(null);
          await signOutSupabase();
        },
        setAccessToken: (value) => setAccessTokenState(value.trim()),
        setApiBaseUrl: (value) => setApiBaseUrlState(normalizeBaseUrl(value)),
      }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  const context = useContext(AppConfigContext);

  if (context == null) {
    throw new Error('useAppConfig must be used inside AppConfigProvider');
  }

  return context;
}

import * as QueryParams from 'expo-auth-session/build/QueryParams'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import Constants, { ExecutionEnvironment } from 'expo-constants'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Alert, Platform } from 'react-native'
import type { Session } from '@supabase/supabase-js'
import { BackendError, createGig as createGigRequest, fetchAuthUser, fetchMyGigs, fetchMyProfile } from '@/lib/backend-client'
import type { BackendAuthUser, CreateGigPayload, OwnedGig, UserProfile } from '@/lib/raket-types'
import { supabase } from '@/lib/supabase-client'

WebBrowser.maybeCompleteAuthSession()

type RefreshedAppData = {
  session: Session | null
  authUser: BackendAuthUser | null
  profile: UserProfile | null
  myGigs: OwnedGig[]
}

type SessionContextValue = {
  session: Session | null
  authUser: BackendAuthUser | null
  profile: UserProfile | null
  myGigs: OwnedGig[]
  isReady: boolean
  isRefreshing: boolean
  isSigningIn: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshAppData: () => Promise<RefreshedAppData>
  submitGig: (payload: CreateGigPayload) => Promise<OwnedGig>
  clearError: () => void
}

const sessionContext = React.createContext<SessionContextValue | null>(null)

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message
  }

  return 'Something went wrong.'
}

async function createSessionFromUrl(url: string): Promise<Session | null> {
  const { params, errorCode } = QueryParams.getQueryParams(url)

  if (errorCode != null) {
    const description = typeof params.error_description === 'string'
      ? params.error_description
      : errorCode

    throw new Error(description)
  }

  const accessToken = typeof params.access_token === 'string' ? params.access_token : null
  const refreshToken = typeof params.refresh_token === 'string' ? params.refresh_token : null

  if (accessToken == null || refreshToken == null) {
    return null
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  })

  if (error != null) {
    throw error
  }

  return data.session
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = React.useState<Session | null>(null)
  const [authUser, setAuthUser] = React.useState<BackendAuthUser | null>(null)
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [myGigs, setMyGigs] = React.useState<OwnedGig[]>([])
  const [isReady, setIsReady] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [isSigningIn, setIsSigningIn] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const buildCurrentSnapshot = React.useCallback((): RefreshedAppData => ({
    session,
    authUser,
    profile,
    myGigs
  }), [authUser, myGigs, profile, session])

  const hydrateSession = React.useCallback(async (nextSession: Session | null): Promise<RefreshedAppData> => {
    setSession(nextSession)

    if (nextSession == null) {
      setAuthUser(null)
      setProfile(null)
      setMyGigs([])
      setError(null)
      setIsRefreshing(false)
      setIsReady(true)
      return {
        session: null,
        authUser: null,
        profile: null,
        myGigs: []
      }
    }

    setIsRefreshing(true)

    try {
      const [resolvedAuthUser, resolvedProfile, resolvedGigs] = await Promise.all([
        fetchAuthUser(nextSession.access_token),
        fetchMyProfile(nextSession.access_token),
        fetchMyGigs(nextSession.access_token)
      ])

      setAuthUser(resolvedAuthUser)
      setProfile(resolvedProfile)
      setMyGigs(resolvedGigs)
      setError(null)

      return {
        session: nextSession,
        authUser: resolvedAuthUser,
        profile: resolvedProfile,
        myGigs: resolvedGigs
      }
    } catch (nextError) {
      setAuthUser(null)
      setProfile(null)
      setMyGigs([])
      setError(toErrorMessage(nextError))

      if (nextError instanceof BackendError && nextError.status === 401) {
        await supabase.auth.signOut()

        return {
          session: null,
          authUser: null,
          profile: null,
          myGigs: []
        }
      }

      return {
        session: nextSession,
        authUser: null,
        profile: null,
        myGigs: []
      }
    } finally {
      setIsRefreshing(false)
      setIsReady(true)
    }
  }, [])

  React.useEffect(() => {
    let isMounted = true

    async function handleIncomingUrl(url: string): Promise<void> {
      try {
        await createSessionFromUrl(url)
      } catch (incomingUrlError) {
        if (!isMounted) {
          return
        }

        setError(toErrorMessage(incomingUrlError))
      }
    }

    async function bootstrap(): Promise<void> {
      try {
        const initialUrl = await Linking.getInitialURL()

        if (initialUrl != null) {
          await handleIncomingUrl(initialUrl)
        }

        const { data, error: sessionError } = await supabase.auth.getSession()

        if (sessionError != null) {
          throw sessionError
        }

        if (!isMounted) {
          return
        }

        await hydrateSession(data.session)
      } catch (bootstrapError) {
        if (!isMounted) {
          return
        }

        setError(toErrorMessage(bootstrapError))
        setIsReady(true)
      }
    }

    void bootstrap()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return
      }

      void hydrateSession(nextSession)
    })

    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      void handleIncomingUrl(url)
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
      linkingSubscription.remove()
    }
  }, [hydrateSession])

  const signInWithGoogle = React.useCallback(async () => {
    setIsSigningIn(true)
    setError(null)

    try {
      const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient
      const redirectTo = makeRedirectUri({
        path: 'auth/callback',
        ...(Platform.OS === 'web' || isExpoGo ? {} : { scheme: 'mobile' })
      })
      console.log('[auth] redirectTo', redirectTo)

      if (Platform.OS !== 'web') {
        Alert.alert('Redirect URI', redirectTo)
      }

      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          ...(Platform.OS === 'web' ? {} : { skipBrowserRedirect: true })
        }
      })

      if (signInError != null) {
        throw signInError
      }

      if (data.url == null || data.url.trim() === '') {
        throw new Error('Google sign-in did not return an authorization URL.')
      }

      try {
        const oauthUrl = new URL(data.url)
        const returnedRedirectTo = oauthUrl.searchParams.get('redirect_to') ?? '(missing)'
        console.log('[auth] oauth redirect_to', returnedRedirectTo)

        if (Platform.OS !== 'web') {
          Alert.alert('OAuth redirect_to', returnedRedirectTo)
        }
      } catch {}

      if (Platform.OS === 'web') {
        return
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)

      if (result.type === 'success') {
        await createSessionFromUrl(result.url)
        return
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        throw new Error('Google sign-in was canceled.')
      }
    } catch (signInError) {
      setError(toErrorMessage(signInError))
    } finally {
      setIsSigningIn(false)
    }
  }, [])

  const signOut = React.useCallback(async () => {
    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError != null) {
      setError(toErrorMessage(signOutError))
      return
    }

    setError(null)
  }, [])

  const refreshAppData = React.useCallback(async () => {
    const { data, error: sessionError } = await supabase.auth.getSession()

    if (sessionError != null) {
      setError(toErrorMessage(sessionError))
      return buildCurrentSnapshot()
    }

    const refreshedAppData = await hydrateSession(data.session)

    return refreshedAppData ?? buildCurrentSnapshot()
  }, [buildCurrentSnapshot, hydrateSession])

  const submitGig = React.useCallback(async (payload: CreateGigPayload) => {
    if (session == null) {
      throw new Error('Sign in before posting a job.')
    }

    const createdGig = await createGigRequest(session.access_token, payload)
    await hydrateSession(session)

    return createdGig
  }, [hydrateSession, session])

  const value = React.useMemo<SessionContextValue>(() => ({
    session,
    authUser,
    profile,
    myGigs,
    isReady,
    isRefreshing,
    isSigningIn,
    error,
    signInWithGoogle,
    signOut,
    refreshAppData,
    submitGig,
    clearError: () => { setError(null) }
  }), [
    authUser,
    error,
    isReady,
    isRefreshing,
    isSigningIn,
    myGigs,
    profile,
    refreshAppData,
    session,
    signInWithGoogle,
    signOut,
    submitGig
  ])

  return (
    <sessionContext.Provider value={value}>
      {children}
    </sessionContext.Provider>
  )
}

export function useSession() {
  const value = React.use(sessionContext)

  if (value == null) {
    throw new Error('useSession must be used inside SessionProvider')
  }

  return value
}

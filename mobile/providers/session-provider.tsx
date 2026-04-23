import * as QueryParams from 'expo-auth-session/build/QueryParams'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import Constants, { ExecutionEnvironment } from 'expo-constants'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Alert, Platform } from 'react-native'
import type { Session } from '@supabase/supabase-js'
import { BackendError, createGig as createGigRequest, fetchAuthUser, fetchMyGigs, fetchMyProfile, provisionMyProfile, updateMyProfile as updateMyProfileRequest } from '@/lib/backend-client'
import { isProfileOnboardingComplete, type BackendAuthUser, type CreateGigPayload, type OwnedGig, type UpdateProfilePayload, type UserProfile } from '@/lib/raket-types'
import { supabase } from '@/lib/supabase-client'

WebBrowser.maybeCompleteAuthSession()

type RefreshedAppData = {
  session: Session | null
  authUser: BackendAuthUser | null
  profile: UserProfile | null
  myGigs: OwnedGig[]
}

type BootstrapCacheSnapshot = {
  authUser: BackendAuthUser | null
  profile: UserProfile | null
  myGigs: OwnedGig[]
}

type HydrateSessionOptions = {
  preserveExistingData?: boolean
}

type SessionContextValue = {
  session: Session | null
  authUser: BackendAuthUser | null
  profile: UserProfile | null
  myGigs: OwnedGig[]
  isReady: boolean
  isRefreshing: boolean
  isSigningIn: boolean
  isRouteReady: boolean
  needsOnboarding: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshAppData: () => Promise<RefreshedAppData>
  updateProfile: (payload: UpdateProfilePayload) => Promise<UserProfile>
  submitGig: (payload: CreateGigPayload) => Promise<OwnedGig>
  clearError: () => void
}

const sessionContext = React.createContext<SessionContextValue | null>(null)

function getBootstrapCacheStorage() {
  if (Platform.OS === 'web') {
    return null
  }

  try {
    return require('@react-native-async-storage/async-storage').default as {
      getItem: (key: string) => Promise<string | null>
      setItem: (key: string, value: string) => Promise<void>
      removeItem: (key: string) => Promise<void>
    }
  } catch {
    return null
  }
}

const bootstrapCacheKey = 'raket.bootstrap.v1'
const bootstrapCacheStorage = getBootstrapCacheStorage()

function readStringParam(params: Record<string, unknown>, key: string): string | null {
  const value = params[key]

  if (typeof value !== 'string') {
    return null
  }

  return value
}

function buildRedirectTo(): string {
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  const redirectUriOptions: {
    path: string
    scheme?: string
  } = {
    path: 'auth/callback'
  }

  if (Platform.OS !== 'web' && !isExpoGo) {
    redirectUriOptions.scheme = 'mobile'
  }

  return makeRedirectUri(redirectUriOptions)
}

function buildGoogleOAuthOptions(redirectTo: string): {
  redirectTo: string
  skipBrowserRedirect?: boolean
} {
  const options: {
    redirectTo: string
    skipBrowserRedirect?: boolean
  } = {
    redirectTo
  }

  if (Platform.OS !== 'web') {
    options.skipBrowserRedirect = true
  }

  return options
}

function ensureErrorInstance(error: unknown, fallbackMessage: string): Error {
  if (error instanceof Error) {
    return error
  }

  return new Error(fallbackMessage)
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message
  }

  return 'Something went wrong.'
}

function getOAuthErrorDescription(params: Record<string, unknown>, fallbackCode: string): string {
  const errorDescription = readStringParam(params, 'error_description')

  if (errorDescription != null && errorDescription.trim() !== '') {
    return errorDescription
  }

  return fallbackCode
}

function getCachedGigs(value: unknown): OwnedGig[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value as OwnedGig[]
}

function getNeedsOnboarding(session: Session | null, profile: UserProfile | null): boolean {
  if (session == null || profile == null) {
    return false
  }

  return !isProfileOnboardingComplete(profile)
}

async function createSessionFromUrl(url: string): Promise<Session | null> {
  const { params, errorCode } = QueryParams.getQueryParams(url)

  if (errorCode != null) {
    const description = getOAuthErrorDescription(params, errorCode)

    throw new Error(description)
  }

  const accessToken = readStringParam(params, 'access_token')
  const refreshToken = readStringParam(params, 'refresh_token')

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

async function readBootstrapCache(): Promise<BootstrapCacheSnapshot | null> {
  if (bootstrapCacheStorage == null) {
    return null
  }

  try {
    const rawValue = await bootstrapCacheStorage.getItem(bootstrapCacheKey)

    if (rawValue == null || rawValue.trim() === '') {
      return null
    }

    const parsedValue = JSON.parse(rawValue) as BootstrapCacheSnapshot
    const cachedGigs = getCachedGigs(parsedValue.myGigs)

    return {
      authUser: parsedValue.authUser ?? null,
      profile: parsedValue.profile ?? null,
      myGigs: cachedGigs
    }
  } catch {
    return null
  }
}

async function writeBootstrapCache(snapshot: BootstrapCacheSnapshot): Promise<void> {
  if (bootstrapCacheStorage == null) {
    return
  }

  try {
    await bootstrapCacheStorage.setItem(bootstrapCacheKey, JSON.stringify(snapshot))
  } catch {}
}

async function clearBootstrapCache(): Promise<void> {
  if (bootstrapCacheStorage == null) {
    return
  }

  try {
    await bootstrapCacheStorage.removeItem(bootstrapCacheKey)
  } catch {}
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
  const latestSessionRef = React.useRef<Session | null>(null)
  const latestAuthUserRef = React.useRef<BackendAuthUser | null>(null)
  const latestProfileRef = React.useRef<UserProfile | null>(null)
  const latestMyGigsRef = React.useRef<OwnedGig[]>([])
  const activeHydrationKeyRef = React.useRef<string | null>(null)

  const setSessionState = React.useCallback((nextSession: Session | null) => {
    latestSessionRef.current = nextSession
    setSession(nextSession)
  }, [])

  const setAuthUserState = React.useCallback((nextAuthUser: BackendAuthUser | null) => {
    latestAuthUserRef.current = nextAuthUser
    setAuthUser(nextAuthUser)
  }, [])

  const setProfileState = React.useCallback((nextProfile: UserProfile | null) => {
    latestProfileRef.current = nextProfile
    setProfile(nextProfile)
  }, [])

  const setMyGigsState = React.useCallback((nextMyGigs: OwnedGig[]) => {
    latestMyGigsRef.current = nextMyGigs
    setMyGigs(nextMyGigs)
  }, [])

  const buildCurrentSnapshot = React.useCallback((): RefreshedAppData => ({
    session: latestSessionRef.current,
    authUser: latestAuthUserRef.current,
    profile: latestProfileRef.current,
    myGigs: latestMyGigsRef.current
  }), [])

  const persistBootstrapSnapshot = React.useCallback(async (snapshot?: Partial<BootstrapCacheSnapshot>) => {
    await writeBootstrapCache({
      authUser: snapshot?.authUser ?? latestAuthUserRef.current,
      profile: snapshot?.profile ?? latestProfileRef.current,
      myGigs: snapshot?.myGigs ?? latestMyGigsRef.current
    })
  }, [])

  const hydrateDeferredSessionData = React.useCallback(async (accessToken: string) => {
    try {
      const [resolvedAuthUser, resolvedGigs] = await Promise.all([
        fetchAuthUser(accessToken),
        fetchMyGigs(accessToken)
      ])

      setAuthUserState(resolvedAuthUser)
      setMyGigsState(resolvedGigs)
      setError(null)
      await persistBootstrapSnapshot({
        authUser: resolvedAuthUser,
        myGigs: resolvedGigs
      })
    } catch (nextError) {
      setError(toErrorMessage(nextError))
    }
  }, [persistBootstrapSnapshot, setAuthUserState, setMyGigsState])

  const hydrateSession = React.useCallback(async (
    nextSession: Session | null,
    options?: HydrateSessionOptions
  ): Promise<RefreshedAppData> => {
    const hydrationKey = nextSession?.access_token ?? 'anonymous'

    if (activeHydrationKeyRef.current === hydrationKey) {
      return buildCurrentSnapshot()
    }

    activeHydrationKeyRef.current = hydrationKey
    setSessionState(nextSession)

    if (nextSession == null) {
      setAuthUserState(null)
      setProfileState(null)
      setMyGigsState([])
      setError(null)
      setIsRefreshing(false)
      setIsReady(true)
      await clearBootstrapCache()
      activeHydrationKeyRef.current = null
      return {
        session: null,
        authUser: null,
        profile: null,
        myGigs: []
      }
    }

    setIsRefreshing(true)

    if (!options?.preserveExistingData) {
      setAuthUserState(null)
      setProfileState(null)
      setMyGigsState([])
    }

    try {
      let resolvedProfile: UserProfile

      try {
        resolvedProfile = await fetchMyProfile(nextSession.access_token)
      } catch (profileError) {
        if (profileError instanceof BackendError && profileError.status === 404) {
          resolvedProfile = await provisionMyProfile(nextSession.access_token)
        } else {
          throw profileError
        }
      }

      setProfileState(resolvedProfile)
      setError(null)
      setIsReady(true)
      setIsRefreshing(false)
      await persistBootstrapSnapshot({ profile: resolvedProfile })

      void hydrateDeferredSessionData(nextSession.access_token)

      return {
        session: nextSession,
        authUser: latestAuthUserRef.current,
        profile: resolvedProfile,
        myGigs: latestMyGigsRef.current
      }
    } catch (nextError) {
      setError(toErrorMessage(nextError))
      setIsRefreshing(false)
      setIsReady(true)

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
        authUser: latestAuthUserRef.current,
        profile: latestProfileRef.current,
        myGigs: latestMyGigsRef.current
      }
    } finally {
      activeHydrationKeyRef.current = null
    }
  }, [
    buildCurrentSnapshot,
    hydrateDeferredSessionData,
    persistBootstrapSnapshot,
    setAuthUserState,
    setMyGigsState,
    setProfileState,
    setSessionState
  ])

  React.useEffect(() => {
    let isMounted = true

    async function handleIncomingUrl(url: string): Promise<void> {
      try {
        const nextSession = await createSessionFromUrl(url)

        if (!isMounted || nextSession == null) {
          return
        }

        await hydrateSession(nextSession, {
          preserveExistingData: true
        })
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

        if (data.session != null) {
          const cachedSnapshot = await readBootstrapCache()

          if (!isMounted) {
            return
          }

          if (cachedSnapshot != null) {
            setSessionState(data.session)
            setAuthUserState(cachedSnapshot.authUser)
            setProfileState(cachedSnapshot.profile)
            setMyGigsState(cachedSnapshot.myGigs)
            setError(null)
            setIsReady(true)
          }

          await hydrateSession(data.session, {
            preserveExistingData: cachedSnapshot != null
          })
          return
        }

        await hydrateSession(null)
      } catch (bootstrapError) {
        if (!isMounted) {
          return
        }

        setError(toErrorMessage(bootstrapError))
        setIsReady(true)
      }
    }

    void bootstrap()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) {
        return
      }

      if (event === 'INITIAL_SESSION') {
        return
      }

      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'SIGNED_IN') {
        setSessionState(nextSession)
        return
      }

      if (nextSession == null || event === 'SIGNED_OUT') {
        setTimeout(() => {
          void hydrateSession(null)
        }, 0)
        return
      }

      setSessionState(nextSession)
    })

    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      void handleIncomingUrl(url)
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
      linkingSubscription.remove()
    }
  }, [hydrateSession, setAuthUserState, setMyGigsState, setProfileState, setSessionState])

  const signInWithGoogle = React.useCallback(async () => {
    setIsSigningIn(true)
    setError(null)

    try {
      const redirectTo = buildRedirectTo()
      console.log('[auth] redirectTo', redirectTo)

      if (Platform.OS !== 'web') {
        Alert.alert('Redirect URI', redirectTo)
      }

      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: buildGoogleOAuthOptions(redirectTo)
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

    const refreshedAppData = await hydrateSession(data.session, {
      preserveExistingData: data.session != null
    })

    return refreshedAppData ?? buildCurrentSnapshot()
  }, [buildCurrentSnapshot, hydrateSession])

  const updateProfile = React.useCallback(async (payload: UpdateProfilePayload) => {
    if (session == null) {
      throw new Error('Sign in before updating your profile.')
    }

    try {
      setError(null)
      const updatedProfile = await updateMyProfileRequest(session.access_token, payload)
      setProfileState(updatedProfile)
      await persistBootstrapSnapshot({ profile: updatedProfile })
      return updatedProfile
    } catch (updateError) {
      const nextErrorMessage = toErrorMessage(updateError)
      setError(nextErrorMessage)
      throw ensureErrorInstance(updateError, nextErrorMessage)
    }
  }, [persistBootstrapSnapshot, session, setProfileState])

  const submitGig = React.useCallback(async (payload: CreateGigPayload) => {
    if (session == null) {
      throw new Error('Sign in before posting a job.')
    }

    const createdGig = await createGigRequest(session.access_token, payload)
    await hydrateSession(session, {
      preserveExistingData: true
    })

    return createdGig
  }, [hydrateSession, session])

  const isRouteReady = isReady
  const needsOnboarding = getNeedsOnboarding(session, profile)

  const value = React.useMemo<SessionContextValue>(() => ({
    session,
    authUser,
    profile,
    myGigs,
    isReady,
    isRefreshing,
    isSigningIn,
    isRouteReady,
    needsOnboarding,
    error,
    signInWithGoogle,
    signOut,
    refreshAppData,
    updateProfile,
    submitGig,
    clearError: () => { setError(null) }
  }), [
    authUser,
    error,
    isReady,
    isRefreshing,
    isSigningIn,
    isRouteReady,
    myGigs,
    needsOnboarding,
    profile,
    refreshAppData,
    session,
    signInWithGoogle,
    signOut,
    updateProfile,
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

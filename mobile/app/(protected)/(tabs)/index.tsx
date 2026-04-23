import React from 'react'
import { RefreshControl, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FeedHomeHeader, type FeedHomeTab } from '@/components/feed/feed-home-header'
import { FindGigHomeView } from '@/components/feed/find-gig-home-view'
import { FeedScreenSkeleton } from '@/components/loading/feed-screen-skeleton'
import { palette, resolvePaletteMode } from '@/constants/palette'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { fetchPublicGigs } from '@/lib/backend-client'
import { type OwnedGig, type PublicGig, type UserProfile } from '@/lib/raket-types'
import { useSession } from '@/providers/session-provider'
import { feedScreenStyles as styles } from '@/styles/screens/feed-screen'

const discoveryPageSize = 6
const LazyPostJobComposer = React.lazy(async () => {
  const module = await import('@/components/post-job-composer')

  return {
    default: module.PostJobComposer
  }
})

function getRecentGigs(myGigs: OwnedGig[], publishedGigs: OwnedGig[]): OwnedGig[] {
  if (publishedGigs.length > 0) {
    return publishedGigs.slice(0, 3)
  }

  return myGigs.slice(0, 3)
}

function buildMarketplaceLocationFilters(profileSnapshot: Pick<UserProfile, 'city' | 'latitude' | 'longitude'>) {
  if (profileSnapshot.latitude != null && profileSnapshot.longitude != null) {
    return {}
  }

  if (profileSnapshot.city != null) {
    return { city: profileSnapshot.city }
  }

  return {}
}

function getMarketplaceErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unable to load gigs right now.'
}

function buildProfileSnapshot(profile: Pick<UserProfile, 'city' | 'latitude' | 'longitude'> | null | undefined) {
  if (profile == null) {
    return undefined
  }

  return {
    city: profile.city,
    latitude: profile.latitude,
    longitude: profile.longitude
  }
}

export default function FeedScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const mode = resolvePaletteMode(colorScheme)
  const colors = palette[mode]
  const insets = useSafeAreaInsets()
  const { error, isRefreshing, myGigs, profile, refreshAppData, session } = useSession()
  const [activeTab, setActiveTab] = React.useState<FeedHomeTab>('find')
  const [searchQuery, setSearchQuery] = React.useState('')
  const deferredSearchQuery = React.useDeferredValue(searchQuery)
  const [discoveryPage, setDiscoveryPage] = React.useState(0)
  const [marketplaceGigs, setMarketplaceGigs] = React.useState<PublicGig[]>([])
  const [marketplaceTotalCount, setMarketplaceTotalCount] = React.useState(0)
  const [marketplaceError, setMarketplaceError] = React.useState<string | null>(null)
  const [isMarketplaceLoading, setIsMarketplaceLoading] = React.useState(false)
  const [hasLoadedMarketplace, setHasLoadedMarketplace] = React.useState(false)

  const publishedGigs = myGigs.filter((gig) => gig.status === 'published')
  const draftCount = myGigs.filter((gig) => gig.status === 'draft').length
  const publishedCount = publishedGigs.length
  const totalApplicants = myGigs.reduce((total, gig) => total + gig.applicationCount, 0)
  const totalBudget = myGigs.reduce((total, gig) => total + gig.priceAmount, 0)
  const recentGigs = getRecentGigs(myGigs, publishedGigs)
  const discoveryPageCount = Math.max(1, Math.ceil(marketplaceTotalCount / discoveryPageSize))
  const boundedDiscoveryPage = Math.min(discoveryPage, discoveryPageCount - 1)
  const discoveryOffset = boundedDiscoveryPage * discoveryPageSize
  const isFeedRefreshing = isRefreshing || isMarketplaceLoading
  const isInitialFeedLoading = isRefreshing && profile == null && myGigs.length === 0 && !hasLoadedMarketplace

  const loadMarketplaceGigs = React.useCallback(async (overrides?: {
    accessToken?: string
    profile?: Pick<UserProfile, 'city' | 'latitude' | 'longitude'>
  }, options?: {
    bypassCache?: boolean
  }) => {
    const accessToken = overrides?.accessToken ?? session?.access_token
    const profileSnapshot = overrides?.profile ?? {
      city: profile?.city ?? null,
      latitude: profile?.latitude ?? null,
      longitude: profile?.longitude ?? null
    }

    if (accessToken == null) {
      setMarketplaceGigs([])
      setMarketplaceTotalCount(0)
      setMarketplaceError(null)
      setHasLoadedMarketplace(true)
      return
    }

    setIsMarketplaceLoading(true)

    try {
      const locationFilters = buildMarketplaceLocationFilters(profileSnapshot)
      const response = await fetchPublicGigs(
        accessToken,
        {
          ...locationFilters,
          q: deferredSearchQuery.trim(),
          offset: discoveryOffset,
          limit: discoveryPageSize
        },
        {
          bypassCache: options?.bypassCache ?? false
        }
      )

      setMarketplaceGigs(response.gigs)
      setMarketplaceTotalCount(response.page.total)
      setMarketplaceError(null)
    } catch (nextError) {
      setMarketplaceError(getMarketplaceErrorMessage(nextError))
    } finally {
      setIsMarketplaceLoading(false)
      setHasLoadedMarketplace(true)
    }
  }, [
    deferredSearchQuery,
    discoveryOffset,
    profile?.city,
    profile?.latitude,
    profile?.longitude,
    session?.access_token
  ])

  const refreshHomeData = React.useCallback(async () => {
    const refreshedAppData = await refreshAppData()
    const refreshedProfile = refreshedAppData?.profile ?? profile

    await loadMarketplaceGigs({
      accessToken: refreshedAppData?.session?.access_token ?? session?.access_token,
      profile: buildProfileSnapshot(refreshedProfile)
    }, {
      bypassCache: true
    })
  }, [loadMarketplaceGigs, profile, refreshAppData, session?.access_token])

  let activeTabContent = (
    <React.Suspense fallback={<FeedScreenSkeleton mode={mode} />}>
      <LazyPostJobComposer
        introDescription="Build the essentials here, save a draft, or publish without leaving Home."
        introTitle="Create a gig"
        mode={mode}
        onSuccess={() => { setActiveTab('find') }}
      />
    </React.Suspense>
  )

  if (activeTab === 'find') {
    activeTabContent = (
      <FindGigHomeView
        discoveryError={marketplaceError}
        draftCount={draftCount}
        error={error}
        isDiscoveryLoading={!hasLoadedMarketplace || isMarketplaceLoading}
        mode={mode}
        onActivateCreate={() => { setActiveTab('create') }}
        onOpenDiscoveryGig={(gigId) => {
          router.push({
            pathname: '/gigs/[gigId]',
            params: { gigId }
          })
        }}
        onOpenGigs={() => { router.navigate('/gigs') }}
        onOpenProfile={() => { router.navigate('/profile') }}
        profile={profile}
        publishedCount={publishedCount}
        recentGigs={recentGigs}
        discoveryGigs={marketplaceGigs}
        discoveryPage={boundedDiscoveryPage}
        discoveryPageCount={discoveryPageCount}
        searchQuery={searchQuery}
        totalApplicants={totalApplicants}
        totalBudget={totalBudget}
      />
    )
  }

  let screenContent = (
    <>
      <FeedHomeHeader
        activeTab={activeTab}
        isRefreshing={isFeedRefreshing}
        mode={mode}
        onChangeSearchQuery={setSearchQuery}
        onRefresh={() => { void refreshHomeData() }}
        onSelectTab={setActiveTab}
        searchQuery={searchQuery}
      />
      {activeTabContent}
    </>
  )

  if (isInitialFeedLoading) {
    screenContent = <FeedScreenSkeleton mode={mode} />
  }

  React.useEffect(() => {
    setDiscoveryPage(0)
  }, [deferredSearchQuery])

  React.useEffect(() => {
    void loadMarketplaceGigs()
  }, [loadMarketplaceGigs])

  React.useEffect(() => {
    if (discoveryPage !== boundedDiscoveryPage) {
      setDiscoveryPage(boundedDiscoveryPage)
    }
  }, [boundedDiscoveryPage, discoveryPage])

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: Math.max(insets.top + 10, 28)
        }
      ]}
      nestedScrollEnabled
      refreshControl={(
        <RefreshControl
          colors={[colors.accent]}
          onRefresh={() => { void refreshHomeData() }}
          refreshing={isFeedRefreshing}
          tintColor={colors.accent}
        />
      )}
      showsVerticalScrollIndicator={false}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      {screenContent}
    </ScrollView>
  )
}

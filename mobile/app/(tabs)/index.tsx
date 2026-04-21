import React from 'react'
import { RefreshControl, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FeedHomeHeader, type FeedHomeTab } from '@/components/feed/feed-home-header'
import { FindGigHomeView } from '@/components/feed/find-gig-home-view'
import { PostJobComposer } from '@/components/post-job-composer'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { fetchPublicGigs } from '@/lib/backend-client'
import { palette } from '@/constants/palette'
import { type GigCategory, type PublicGig, type UserProfile } from '@/lib/raket-types'
import { useSession } from '@/providers/session-provider'
import { feedScreenStyles as styles } from '@/styles/screens/feed-screen'

const discoveryPageSize = 6

function buildLocalitySummary(input: {
  city: string | null | undefined
  hasCoordinates: boolean
  serviceRadiusKm: number | null | undefined
}): string {
  if (input.hasCoordinates) {
    const locationName = input.city?.trim() !== '' && input.city != null ? input.city : 'your current area'
    return `Showing gigs within ${input.serviceRadiusKm ?? 0} km of ${locationName}.`
  }

  if (input.city?.trim() !== '' && input.city != null) {
    return `Showing ${input.city} gigs because precise location is incomplete.`
  }

  return 'Showing marketplace-wide gigs until you set your city and exact location.'
}

export default function FeedScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const mode = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = palette[mode]
  const insets = useSafeAreaInsets()
  const { error, isRefreshing, myGigs, profile, refreshAppData, session } = useSession()
  const [activeTab, setActiveTab] = React.useState<FeedHomeTab>('find')
  const [searchQuery, setSearchQuery] = React.useState('')
  const deferredSearchQuery = React.useDeferredValue(searchQuery)
  const [selectedCategory, setSelectedCategory] = React.useState<GigCategory | 'all'>('all')
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
  const recentGigs = (publishedGigs.length > 0 ? publishedGigs : myGigs).slice(0, 3)
  const locationLabel = profile?.city ?? 'the marketplace'
  const localitySummary = buildLocalitySummary({
    city: profile?.city,
    hasCoordinates: profile?.latitude != null && profile.longitude != null,
    serviceRadiusKm: profile?.serviceRadiusKm
  })
  const discoveryPageCount = Math.max(1, Math.ceil(marketplaceTotalCount / discoveryPageSize))
  const boundedDiscoveryPage = Math.min(discoveryPage, discoveryPageCount - 1)
  const discoveryOffset = boundedDiscoveryPage * discoveryPageSize
  const isFeedRefreshing = isRefreshing || isMarketplaceLoading

  const loadMarketplaceGigs = React.useCallback(async (overrides?: {
    accessToken?: string
    profile?: Pick<UserProfile, 'city' | 'latitude' | 'longitude'>
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
      const response = await fetchPublicGigs(accessToken, {
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        ...(profileSnapshot?.latitude != null && profileSnapshot.longitude != null
          ? {}
          : profileSnapshot?.city != null
            ? { city: profileSnapshot.city }
            : {}),
        q: deferredSearchQuery.trim(),
        offset: discoveryOffset,
        limit: discoveryPageSize
      })

      setMarketplaceGigs(response.gigs)
      setMarketplaceTotalCount(response.page.total)
      setMarketplaceError(null)
    } catch (nextError) {
      setMarketplaceError(nextError instanceof Error ? nextError.message : 'Unable to load gigs right now.')
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
    selectedCategory,
    session
  ])

  const refreshHomeData = React.useCallback(async () => {
    const refreshedAppData = await refreshAppData()
    const refreshedProfile = refreshedAppData?.profile ?? profile

    await loadMarketplaceGigs({
      accessToken: refreshedAppData?.session?.access_token ?? session?.access_token,
      profile: refreshedProfile == null
        ? undefined
        : {
            city: refreshedProfile.city,
            latitude: refreshedProfile.latitude,
            longitude: refreshedProfile.longitude
          }
    })
  }, [loadMarketplaceGigs, profile, refreshAppData, session?.access_token])

  React.useEffect(() => {
    setDiscoveryPage(0)
  }, [deferredSearchQuery, selectedCategory])

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
      <FeedHomeHeader
        activeTab={activeTab}
        isRefreshing={isFeedRefreshing}
        mode={mode}
        onChangeSearchQuery={setSearchQuery}
        onRefresh={() => { void refreshHomeData() }}
        onSelectTab={setActiveTab}
        searchQuery={searchQuery}
      />

      {activeTab === 'find'
        ? (
          <FindGigHomeView
            discoveryError={marketplaceError}
            draftCount={draftCount}
            error={error}
            isDiscoveryLoading={!hasLoadedMarketplace || isMarketplaceLoading}
            locationLabel={locationLabel}
            localitySummary={localitySummary}
            mode={mode}
            onChangeCategory={(category) => { setSelectedCategory(category) }}
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
            discoveryTotalCount={marketplaceTotalCount}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            totalApplicants={totalApplicants}
            totalBudget={totalBudget}
          />
          )
        : (
          <PostJobComposer
            introDescription="Build the essentials here, save a draft, or publish without leaving Home."
            introTitle="Create a gig"
            mode={mode}
            onSuccess={() => { setActiveTab('find') }}
          />
          )}
    </ScrollView>
  )
}

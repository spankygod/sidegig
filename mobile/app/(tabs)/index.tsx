import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FeedHomeHeader, type FeedHomeTab } from '@/components/feed/feed-home-header'
import { FindGigHomeView } from '@/components/feed/find-gig-home-view'
import { PostJobComposer } from '@/components/post-job-composer'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useSession } from '@/providers/session-provider'

export default function FeedScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const mode = colorScheme === 'dark' ? 'dark' : 'light'
  const insets = useSafeAreaInsets()
  const { error, isRefreshing, myGigs, profile, refreshAppData } = useSession()
  const [activeTab, setActiveTab] = React.useState<FeedHomeTab>('find')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [discoveryPage, setDiscoveryPage] = React.useState(0)

  const publishedGigs = myGigs.filter((gig) => gig.status === 'published')
  const draftCount = myGigs.filter((gig) => gig.status === 'draft').length
  const publishedCount = publishedGigs.length
  const totalApplicants = myGigs.reduce((total, gig) => total + gig.applicationCount, 0)
  const totalBudget = myGigs.reduce((total, gig) => total + gig.priceAmount, 0)
  const recentGigs = (publishedGigs.length > 0 ? publishedGigs : myGigs).slice(0, 3)
  const discoverySource = publishedGigs.length > 0 ? publishedGigs : myGigs
  const firstName = profile?.displayName.split(' ')[0] ?? 'there'
  const locationLabel = profile?.city ?? 'Philippines'
  const initials = profile?.displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? firstName.slice(0, 2).toUpperCase()
  const profileStrength = [
    profile?.bio != null && profile.bio.trim() !== '',
    (profile?.skills.length ?? 0) >= 3,
    profile?.city != null,
    publishedCount > 0
  ].filter(Boolean).length
  const profileStrengthLabel = ['Needs setup', 'Getting there', 'Looking solid', 'Ready to publish', 'Fully loaded'][profileStrength]
  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredDiscoveryGigs = discoverySource.filter((gig) => {
    if (normalizedSearch === '') {
      return true
    }

    return [
      gig.title,
      formatGigCategory(gig.category),
      gig.location.city,
      gig.location.barangay,
      gig.scheduleSummary,
      gig.description
    ].some((value) => value.toLowerCase().includes(normalizedSearch))
  })
  const discoveryPageSize = 5
  const discoveryPageCount = Math.max(1, Math.ceil(filteredDiscoveryGigs.length / discoveryPageSize))
  const boundedDiscoveryPage = Math.min(discoveryPage, discoveryPageCount - 1)
  const discoveryGigs = filteredDiscoveryGigs.slice(
    boundedDiscoveryPage * discoveryPageSize,
    (boundedDiscoveryPage + 1) * discoveryPageSize
  )

  React.useEffect(() => {
    setDiscoveryPage(0)
  }, [searchQuery])

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
      showsVerticalScrollIndicator={false}
      style={styles.screen}
    >
      <FeedHomeHeader
        activeTab={activeTab}
        isRefreshing={isRefreshing}
        mode={mode}
        onChangeSearchQuery={setSearchQuery}
        onRefresh={() => { void refreshAppData() }}
        onSelectTab={setActiveTab}
        searchQuery={searchQuery}
      />

      {activeTab === 'find'
        ? (
          <FindGigHomeView
            draftCount={draftCount}
            error={error}
            firstName={firstName}
            initials={initials}
            locationLabel={locationLabel}
            mode={mode}
            myGigs={myGigs}
            onActivateCreate={() => { setActiveTab('create') }}
            onOpenGigs={() => { router.navigate('/gigs') }}
            onOpenProfile={() => { router.navigate('/profile') }}
            onNextDiscoveryPage={() => { setDiscoveryPage((current) => Math.min(current + 1, discoveryPageCount - 1)) }}
            onPreviousDiscoveryPage={() => { setDiscoveryPage((current) => Math.max(current - 1, 0)) }}
            profile={profile}
            profileStrengthLabel={profileStrengthLabel}
            publishedCount={publishedCount}
            recentGigs={recentGigs}
            discoveryGigs={discoveryGigs}
            discoveryPage={boundedDiscoveryPage}
            discoveryPageCount={discoveryPageCount}
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 132,
    gap: 16
  }
})

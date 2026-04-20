import React from 'react'
import { Redirect, Stack, useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native'
import { AppSurface } from '@/components/app-surface'
import { PrimaryButton } from '@/components/primary-button'
import { TextField } from '@/components/text-field'
import { palette } from '@/constants/palette'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { BackendError, createGigApplication, fetchMyApplications, fetchPublicGigById } from '@/lib/backend-client'
import {
  formatDurationBucket,
  formatGigCategory,
  formatGigTimestamp,
  formatPhpCurrency,
  type GigApplicationSummary,
  type PublicGig
} from '@/lib/raket-types'
import { useSession } from '@/providers/session-provider'

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message
  }

  return 'Something went wrong.'
}

function normalizeRouteParam(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.trim() !== '') {
    return value
  }

  return null
}

function formatPercent(value: number): string {
  return `${value}%`
}

function formatApplicationStatus(status: GigApplicationSummary['status']): string {
  return status.replaceAll('_', ' ')
}

export default function PublicGigDetailScreen() {
  const colorScheme = useColorScheme()
  const mode = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = palette[mode]
  const { gigId } = useLocalSearchParams<{ gigId?: string | string[] }>()
  const normalizedGigId = normalizeRouteParam(gigId)
  const { isReady, profile, refreshAppData, session } = useSession()
  const [gig, setGig] = React.useState<PublicGig | null>(null)
  const [intro, setIntro] = React.useState('')
  const [availability, setAvailability] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [applyError, setApplyError] = React.useState<string | null>(null)
  const [applicationFeedback, setApplicationFeedback] = React.useState<string | null>(null)
  const [existingApplicationStatus, setExistingApplicationStatus] = React.useState<GigApplicationSummary['status'] | null>(null)

  const isWorkerLocationReady = profile?.latitude != null && profile.longitude != null

  const loadGig = React.useCallback(async (refreshing: boolean) => {
    if (normalizedGigId == null) {
      setLoadError('Gig ID is missing.')
      setIsLoading(false)
      setIsRefreshing(false)
      return
    }

    if (refreshing) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const nextGig = await fetchPublicGigById(session?.access_token, normalizedGigId)
      let applications: GigApplicationSummary[] = []

      if (session?.access_token != null) {
        try {
          applications = await fetchMyApplications(session.access_token)
        } catch {
          applications = []
        }
      }

      const existingApplication = applications.find((application) => application.gig.id === normalizedGigId)

      setGig(nextGig)
      setExistingApplicationStatus(existingApplication?.status ?? null)
      setApplicationFeedback(
        existingApplication == null
          ? null
          : `You already applied to this gig. Status: ${formatApplicationStatus(existingApplication.status)}.`
      )
      setLoadError(null)
    } catch (error) {
      setLoadError(toErrorMessage(error))
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [normalizedGigId, session?.access_token])

  React.useEffect(() => {
    setGig(null)
    setLoadError(null)
    setApplyError(null)
    setApplicationFeedback(null)
    setExistingApplicationStatus(null)
    setIntro('')
    setAvailability('')
    void loadGig(false)
  }, [loadGig])

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background
        }}
      >
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    )
  }

  if (session == null) {
    return <Redirect href="/sign-in" />
  }

  async function handleSubmitApplication(): Promise<void> {
    if (gig == null) {
      return
    }

    if (session == null) {
      setApplyError('Sign in before applying to gigs.')
      return
    }

    if (intro.trim().length < 20) {
      setApplyError('Intro must be at least 20 characters.')
      return
    }

    if (availability.trim().length < 4) {
      setApplyError('Availability must be at least 4 characters.')
      return
    }

    setIsSubmitting(true)
    setApplyError(null)
    setApplicationFeedback(null)

    try {
      const application = await createGigApplication(session.access_token, {
        gigId: gig.id,
        intro: intro.trim(),
        availability: availability.trim()
      })

      setExistingApplicationStatus(application.status)
      setApplicationFeedback(`Application sent. Status: ${formatApplicationStatus(application.status)}.`)
      setIntro('')
      setAvailability('')
      await refreshAppData()
    } catch (error) {
      if (
        error instanceof BackendError &&
        error.status === 409 &&
        error.message.toLowerCase().includes('already applied')
      ) {
        setExistingApplicationStatus('submitted')
        setApplicationFeedback('You already applied to this gig. Status: submitted.')
        return
      }

      setApplyError(toErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Gig details',
          headerBackButtonDisplayMode: 'minimal',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.background
          },
          contentStyle: {
            backgroundColor: colors.background
          }
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 112,
          gap: 16
        }}
        refreshControl={(
          <RefreshControl
            colors={[colors.accent]}
            onRefresh={() => { void loadGig(true) }}
            refreshing={isRefreshing}
            tintColor={colors.accent}
          />
        )}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        {isLoading && gig == null
          ? (
            <AppSurface mode={mode}>
              <ActivityIndicator color={colors.accent} size="large" />
              <Text
                selectable
                style={{
                  color: colors.text,
                  fontSize: 18,
                  fontWeight: '700',
                  textAlign: 'center'
                }}
              >
                Loading gig
              </Text>
            </AppSurface>
            )
          : null}

        {loadError != null && gig == null
          ? (
            <AppSurface mode={mode}>
              <Text
                selectable
                style={{
                  color: colors.danger,
                  fontSize: 16,
                  fontWeight: '700'
                }}
              >
                {loadError}
              </Text>
              <PrimaryButton mode={mode} onPress={() => { void loadGig(false) }} variant="secondary">
                Try again
              </PrimaryButton>
            </AppSurface>
            )
          : null}

        {gig == null
          ? null
          : (
            <>
              <AppSurface mode={mode}>
                <View style={{ gap: 8 }}>
                  <Text
                    selectable
                    style={{
                      color: colors.textMuted,
                      fontSize: 13,
                      fontWeight: '700',
                      textTransform: 'uppercase'
                    }}
                  >
                    {formatGigCategory(gig.category)} · {gig.location.city}
                  </Text>
                  <Text
                    selectable
                    style={{
                      color: colors.text,
                      fontSize: 28,
                      fontWeight: '800',
                      lineHeight: 34
                    }}
                  >
                    {gig.title}
                  </Text>
                  <Text
                    selectable
                    style={{
                      color: colors.textMuted,
                      fontSize: 15,
                      lineHeight: 22
                    }}
                  >
                    {gig.description}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8
                  }}
                >
                  {[
                    formatPhpCurrency(gig.priceAmount),
                    formatDurationBucket(gig.durationBucket),
                    gig.distanceKm == null ? gig.location.barangay : `${gig.distanceKm.toFixed(1)} km away`,
                    `${gig.applicationRadiusKm} km radius`
                  ].map((item) => (
                    <View
                      key={item}
                      style={{
                        borderRadius: 999,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        backgroundColor: colors.surfaceMuted
                      }}
                    >
                      <Text
                        selectable
                        style={{
                          color: colors.text,
                          fontSize: 12,
                          fontWeight: '700'
                        }}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={{ gap: 6 }}>
                  <Text
                    selectable
                    style={{
                      color: colors.text,
                      fontSize: 15,
                      fontWeight: '700'
                    }}
                  >
                    Schedule
                  </Text>
                  <Text
                    selectable
                    style={{
                      color: colors.textMuted,
                      fontSize: 15,
                      lineHeight: 22
                    }}
                  >
                    {gig.scheduleSummary}
                  </Text>
                  <Text
                    selectable
                    style={{
                      color: colors.textMuted,
                      fontSize: 13,
                      lineHeight: 20
                    }}
                  >
                    Posted {formatGigTimestamp(gig.createdAt)}
                  </Text>
                </View>
              </AppSurface>

              <AppSurface mode={mode}>
                <Text
                  selectable
                  style={{
                    color: colors.text,
                    fontSize: 18,
                    fontWeight: '800'
                  }}
                >
                  Poster credibility
                </Text>
                <View style={{ gap: 4 }}>
                  <Text
                    selectable
                    style={{
                      color: colors.text,
                      fontSize: 18,
                      fontWeight: '700'
                    }}
                  >
                    {gig.poster.displayName}
                  </Text>
                  <Text
                    selectable
                    style={{
                      color: colors.textMuted,
                      fontSize: 14,
                      lineHeight: 20
                    }}
                  >
                    Trust signals based on reviews, response rate, and completed hires.
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 12
                  }}
                >
                  {[
                    { label: 'Rating', value: gig.poster.rating.toFixed(1) },
                    { label: 'Reviews', value: String(gig.poster.reviewCount) },
                    { label: 'Response', value: formatPercent(gig.poster.responseRate) },
                    { label: 'Jobs posted', value: String(gig.poster.gigsPosted) },
                    { label: 'Hires funded', value: String(gig.poster.hiresFunded) },
                    { label: 'Hires completed', value: String(gig.poster.hiresCompleted) }
                  ].map((item) => (
                    <View
                      key={item.label}
                      style={{
                        width: '47%',
                        borderRadius: 14,
                        borderCurve: 'continuous',
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: colors.surfaceMuted,
                        padding: 14,
                        gap: 6
                      }}
                    >
                      <Text
                        selectable
                        style={{
                          color: colors.textMuted,
                          fontSize: 12,
                          fontWeight: '600'
                        }}
                      >
                        {item.label}
                      </Text>
                      <Text
                        selectable
                        style={{
                          color: colors.text,
                          fontSize: 18,
                          fontWeight: '800',
                          fontVariant: ['tabular-nums']
                        }}
                      >
                        {item.value}
                      </Text>
                    </View>
                  ))}
                </View>
              </AppSurface>

              <AppSurface mode={mode}>
                <Text
                  selectable
                  style={{
                    color: colors.text,
                    fontSize: 18,
                    fontWeight: '800'
                  }}
                >
                  Apply for this gig
                </Text>

                {applicationFeedback == null
                  ? null
                  : (
                    <View
                      style={{
                        borderRadius: 8,
                        borderCurve: 'continuous',
                        borderWidth: 1,
                        borderColor: colors.success,
                        backgroundColor: colors.accentSoft,
                        padding: 14
                      }}
                    >
                      <Text
                        selectable
                        style={{
                          color: colors.text,
                          fontSize: 14,
                          fontWeight: '700',
                          lineHeight: 20
                        }}
                      >
                        {applicationFeedback}
                      </Text>
                    </View>
                    )}

                {applyError == null
                  ? null
                  : (
                    <View
                      style={{
                        borderRadius: 8,
                        borderCurve: 'continuous',
                        borderWidth: 1,
                        borderColor: colors.danger,
                        backgroundColor: colors.surfaceMuted,
                        padding: 14
                      }}
                    >
                      <Text
                        selectable
                        style={{
                          color: colors.danger,
                          fontSize: 14,
                          fontWeight: '700',
                          lineHeight: 20
                        }}
                      >
                        {applyError}
                      </Text>
                    </View>
                    )}

                {!isWorkerLocationReady
                  ? (
                    <View
                      style={{
                        borderRadius: 8,
                        borderCurve: 'continuous',
                        borderWidth: 1,
                        borderColor: colors.warning,
                        backgroundColor: colors.surfaceMuted,
                        padding: 14
                      }}
                    >
                      <Text
                        selectable
                        style={{
                          color: colors.text,
                          fontSize: 14,
                          fontWeight: '700',
                          lineHeight: 20
                        }}
                      >
                        Add your worker location before applying. The backend checks your distance against the gig radius.
                      </Text>
                    </View>
                    )
                  : null}

                <TextField
                  autoCapitalize="sentences"
                  editable={existingApplicationStatus == null && !isSubmitting}
                  label="Why are you a fit?"
                  mode={mode}
                  multiline
                  onChangeText={(value) => {
                    setApplyError(null)
                    setIntro(value)
                  }}
                  placeholder="Share relevant experience, what you can handle, and how you will approach the work."
                  value={intro}
                />
                <TextField
                  autoCapitalize="sentences"
                  editable={existingApplicationStatus == null && !isSubmitting}
                  label="Availability"
                  mode={mode}
                  onChangeText={(value) => {
                    setApplyError(null)
                    setAvailability(value)
                  }}
                  placeholder="Tomorrow after 2 PM, or Saturday morning."
                  value={availability}
                />

                <PrimaryButton
                  disabled={existingApplicationStatus != null || !isWorkerLocationReady}
                  loading={isSubmitting}
                  mode={mode}
                  onPress={() => { void handleSubmitApplication() }}
                >
                  {existingApplicationStatus == null ? 'Submit application' : `Application ${formatApplicationStatus(existingApplicationStatus)}`}
                </PrimaryButton>
              </AppSurface>
            </>
            )}
      </ScrollView>
    </>
  )
}

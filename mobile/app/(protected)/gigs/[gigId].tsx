import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  ActivityIndicator,
  Pressable,
  Text,
  View
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PrimaryButton } from '@/components/primary-button'
import { TextField } from '@/components/text-field'
import { palette, resolvePaletteMode } from '@/constants/palette'
import { layout } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { BackendError, createGigApplication, fetchMyApplications, fetchPublicGigById } from '@/lib/backend-client'
import {
  formatDurationBucket,
  formatGigCategory,
  formatGigTimestamp,
  formatPhpAmount,
  type GigApplicationSummary,
  type PublicGig
} from '@/lib/raket-types'
import { useSession } from '@/providers/session-provider'
import { publicGigDetailStyles as styles } from '@/styles/screens/public-gig-detail'

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

  if (Array.isArray(value)) {
    return value.find((item) => item.trim() !== '') ?? null
  }

  return null
}

function formatPercent(value: number): string {
  return `${value}%`
}

function formatApplicationStatus(status: GigApplicationSummary['status']): string {
  return status
    .split('_')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

function formatGigDistanceLine(gig: PublicGig): string {
  if (gig.distanceKm == null) {
    return `Near ${gig.location.barangay}`
  }

  return `${gig.distanceKm.toFixed(1)} km from your location`
}

function formatGigDistanceBadge(gig: PublicGig): string {
  if (gig.distanceKm == null) {
    return gig.location.barangay
  }

  return `${gig.distanceKm.toFixed(1)} km away`
}

function getExistingApplicationFeedback(application: GigApplicationSummary | undefined): string | null {
  if (application == null) {
    return null
  }

  return `You already applied to this gig. Status: ${formatApplicationStatus(application.status)}.`
}

function getFooterButtonLabel(existingApplicationStatus: GigApplicationSummary['status'] | null): string {
  if (existingApplicationStatus == null) {
    return 'Submit application'
  }

  return `Application ${formatApplicationStatus(existingApplicationStatus)}`
}

function getPosterInitials(gig: PublicGig | null): string {
  if (gig == null) {
    return 'RK'
  }

  return gig.poster.displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

async function loadExistingApplications(accessToken: string | undefined): Promise<GigApplicationSummary[]> {
  if (accessToken == null) {
    return []
  }

  try {
    return await fetchMyApplications(accessToken)
  } catch {
    return []
  }
}

function buildRequirementPoints(gig: PublicGig): string[] {
  const points = [
    `${formatGigCategory(gig.category)} work in ${gig.location.city}`,
    gig.scheduleSummary,
    `${gig.applicationRadiusKm} km application radius`,
    formatGigDistanceLine(gig)
  ]

  if (gig.startsAt != null) {
    points.push(`Starts ${formatGigTimestamp(gig.startsAt)}`)
  }

  return points.slice(0, 4)
}

function buildHeaderTagline(gig: PublicGig): string {
  return `${formatGigCategory(gig.category)} · ${gig.location.city}`
}

function getRequirementPoints(gig: PublicGig | null): string[] {
  if (gig == null) {
    return []
  }

  return buildRequirementPoints(gig)
}

export default function PublicGigDetailScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const mode = resolvePaletteMode(colorScheme)
  const colors = palette[mode]
  const { gigId } = useLocalSearchParams<{ gigId?: string | string[] }>()
  const normalizedGigId = normalizeRouteParam(gigId)
  const { profile, refreshAppData, session } = useSession()
  const [gig, setGig] = React.useState<PublicGig | null>(null)
  const [intro, setIntro] = React.useState('')
  const [availability, setAvailability] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [applyError, setApplyError] = React.useState<string | null>(null)
  const [applicationFeedback, setApplicationFeedback] = React.useState<string | null>(null)
  const [existingApplicationStatus, setExistingApplicationStatus] = React.useState<GigApplicationSummary['status'] | null>(null)
  const [focusedField, setFocusedField] = React.useState<'intro' | 'availability' | null>(null)

  const isWorkerLocationReady = profile?.latitude != null && profile.longitude != null
  const footerBottomPadding = Math.max(insets.bottom + layout.spacing.md, layout.screenPadding)
  const dragTranslateY = useSharedValue(0)
  const gestureStartedAtTop = useSharedValue(false)
  const scrollOffsetY = useSharedValue(0)

  const closeScreen = React.useCallback(() => {
    router.back()
  }, [router])

  const clearFocusedField = React.useCallback((field: 'intro' | 'availability') => {
    setFocusedField((currentField) => {
      if (currentField === field) {
        return null
      }

      return currentField
    })
  }, [])

  const animatedScreenStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dragTranslateY.value }]
  }))

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffsetY.value = event.contentOffset.y
    }
  })

  const nativeScrollGesture = React.useMemo(() => Gesture.Native(), [])

  const dismissGesture = React.useMemo(() => (
    Gesture.Pan()
      .enabled(focusedField == null)
      .activeOffsetY(12)
      .failOffsetX([-20, 20])
      .simultaneousWithExternalGesture(nativeScrollGesture)
      .onBegin(() => {
        gestureStartedAtTop.value = scrollOffsetY.value <= 4
        dragTranslateY.value = 0
      })
      .onUpdate((event) => {
        if (gestureStartedAtTop.value && event.translationY > 0) {
          dragTranslateY.value = Math.min(event.translationY * 0.92, 220)
        }
      })
      .onEnd((event) => {
        if (!gestureStartedAtTop.value) {
          dragTranslateY.value = withSpring(0, { damping: 18, stiffness: 180 })
          return
        }

        if (dragTranslateY.value > 112 || event.velocityY > 1050) {
          runOnJS(closeScreen)()
          return
        }

        dragTranslateY.value = withSpring(0, { damping: 18, stiffness: 180 })
      })
      .onFinalize(() => {
        gestureStartedAtTop.value = false
        if (dragTranslateY.value > 0) {
          dragTranslateY.value = withSpring(0, { damping: 18, stiffness: 180 })
        }
      })
  ), [closeScreen, dragTranslateY, focusedField, gestureStartedAtTop, nativeScrollGesture, scrollOffsetY])

  const loadGig = React.useCallback(async () => {
    if (normalizedGigId == null) {
      setLoadError('Gig ID is missing.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const [nextGig, applicationsResult] = await Promise.all([
        fetchPublicGigById(session?.access_token, normalizedGigId),
        loadExistingApplications(session?.access_token)
      ])

      const applications = applicationsResult
      const existingApplication = applications.find((application) => application.gig.id === normalizedGigId)

      setGig(nextGig)
      setExistingApplicationStatus(existingApplication?.status ?? null)
      setApplicationFeedback(getExistingApplicationFeedback(existingApplication))
      setLoadError(null)
    } catch (error) {
      setLoadError(toErrorMessage(error))
    } finally {
      setIsLoading(false)
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
    void loadGig()
  }, [loadGig])

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
        setApplicationFeedback('You already applied to this gig. Status: Submitted.')
        return
      }

      setApplyError(toErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const footerButtonLabel = getFooterButtonLabel(existingApplicationStatus)
  const requirementPoints = getRequirementPoints(gig)
  const posterInitials = getPosterInitials(gig)
  const shouldShowLoadingState = isLoading && gig == null
  const shouldShowLoadError = loadError != null && gig == null
  const canEditApplication = existingApplicationStatus == null && !isSubmitting

  return (
    <>
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityLabel="Close gig details"
          accessibilityRole="button"
          onPress={closeScreen}
          style={[styles.backdrop, { backgroundColor: 'transparent' }]}
        />

        <GestureDetector gesture={dismissGesture}>
          <Animated.View
            style={[
              styles.screen,
              styles.sheet,
              animatedScreenStyle,
              {
                backgroundColor: colors.background
              }
            ]}
          >
            <View
              style={[
                styles.headerBar,
                {
                  backgroundColor: colors.background,
                  borderBottomColor: colors.border,
                  paddingTop: layout.spacing.sm
                }
              ]}
            >
            <View style={styles.headerHandleWrap}>
              <View style={[styles.headerHandle, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.headerRow}>
              <Pressable
                accessibilityRole="button"
                onPress={closeScreen}
                style={({ pressed }) => [
                  styles.headerIconButton,
                  {
                    backgroundColor: colors.surfaceMuted
                  },
                  pressed && styles.pressed
                ]}
              >
                <Ionicons color={colors.text} name="chevron-down" size={18} />
              </Pressable>

              <Text selectable style={[styles.headerTitle, { color: colors.text }]}>
                Gig details
              </Text>

              <View style={styles.headerIconSpacer} />
            </View>
          </View>

          <GestureDetector gesture={nativeScrollGesture}>
            <Animated.ScrollView
              bounces={false}
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
              onScroll={scrollHandler}
              overScrollMode="never"
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              style={styles.scrollArea}
            >
              {shouldShowLoadingState && (
                <View style={styles.centeredState}>
                  <View style={styles.stateContent}>
                    <ActivityIndicator color={colors.accent} size="large" />
                    <Text selectable style={[styles.stateTitle, { color: colors.text }]}>Loading gig</Text>
                  </View>
                </View>
              )}

              {shouldShowLoadError && (
                <View style={styles.centeredState}>
                  <View style={styles.stateContent}>
                  <Text selectable style={[styles.errorTitle, { color: colors.danger }]}>{loadError}</Text>
                    <PrimaryButton mode={mode} onPress={() => { void loadGig() }} variant="secondary">
                      Try again
                    </PrimaryButton>
                  </View>
                </View>
              )}

              {gig != null && (
                <>
                  <View style={styles.heroSection}>
                      <View style={styles.heroTopRow}>
                        <View style={[styles.posterBadge, { backgroundColor: colors.accentSoft }]}>
                          <Text selectable style={[styles.posterBadgeText, { color: colors.accent }]}>
                            {posterInitials}
                          </Text>
                        </View>
                        <View style={styles.heroCopy}>
                          <Text selectable style={[styles.heroEyebrow, { color: colors.textMuted }]}>
                            {buildHeaderTagline(gig)}
                          </Text>
                          <Text selectable style={[styles.heroTitle, { color: colors.text }]}>
                            {gig.title}
                          </Text>
                          <Text selectable style={[styles.heroMeta, { color: colors.textMuted }]}>
                            Posted by {gig.poster.displayName}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.metricStrip
                        ]}
                      >
                        {[
                          { label: 'Budget', value: formatPhpAmount(gig.priceAmount) },
                          { label: 'Timeline', value: formatDurationBucket(gig.durationBucket) },
                          { label: 'Reach', value: `${gig.applicationRadiusKm} km` }
                        ].map((item, index) => (
                          <View
                            key={item.label}
                            style={[
                              styles.metricColumn,
                              index < 2 && {
                                borderRightWidth: 1,
                                borderRightColor: colors.border
                              }
                            ]}
                          >
                            <Text selectable style={[styles.metricValue, { color: colors.text }]}>
                              {item.value}
                            </Text>
                            <Text selectable style={[styles.metricLabel, { color: colors.textMuted }]}>
                              {item.label}
                            </Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.tagRow}>
                        {[
                          formatGigDistanceBadge(gig),
                          formatPercent(gig.poster.responseRate),
                          `${gig.poster.reviewCount} reviews`
                        ].map((item) => (
                          <View
                            key={item}
                            style={[
                              styles.inlineTag,
                              {
                                backgroundColor: colors.surfaceMuted,
                                borderColor: colors.border
                              }
                            ]}
                          >
                            <Text selectable style={[styles.inlineTagText, { color: colors.textMuted }]}>
                              {item}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View style={[styles.section, { borderTopColor: colors.border }]}>
                      <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>About this role</Text>
                      <Text selectable style={[styles.bodyText, { color: colors.textMuted }]}>
                        {gig.description}
                      </Text>

                      <View style={styles.detailStack}>
                        {requirementPoints.map((item) => (
                          <View key={item} style={styles.bulletRow}>
                            <View style={[styles.bulletIcon, { backgroundColor: colors.accentSoft }]}>
                              <Ionicons color={colors.accent} name="checkmark" size={14} />
                            </View>
                            <Text selectable style={[styles.bulletText, { color: colors.text }]}>
                              {item}
                            </Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.metaList}>
                        {[
                          { icon: 'calendar-outline', label: 'Schedule', value: gig.scheduleSummary },
                          { icon: 'time-outline', label: 'Posted', value: formatGigTimestamp(gig.createdAt) }
                        ].map((item, index) => (
                          <View
                            key={item.label}
                            style={[
                              styles.metaRow,
                              index > 0 && {
                                borderTopWidth: 1,
                                borderTopColor: colors.border
                              }
                            ]}
                          >
                            <View style={[styles.metaIconWrap, { backgroundColor: colors.surfaceMuted }]}>
                              <Ionicons color={colors.textMuted} name={item.icon as 'calendar-outline' | 'time-outline'} size={16} />
                            </View>
                            <View style={styles.metaCopy}>
                              <Text selectable style={[styles.metaLabel, { color: colors.textMuted }]}>{item.label}</Text>
                              <Text selectable style={[styles.metaValue, { color: colors.text }]}>{item.value}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View style={[styles.section, { borderTopColor: colors.border }]}>
                      <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>Poster credibility</Text>
                      <Text selectable style={[styles.bodyText, { color: colors.textMuted }]}>
                        These trust signals come directly from the poster profile connected to this gig.
                      </Text>

                      <View style={styles.posterHeader}>
                        <View style={[styles.posterAvatar, { backgroundColor: colors.text }]}>
                          <Text selectable style={styles.posterAvatarText}>{posterInitials}</Text>
                        </View>
                        <View style={styles.posterCopy}>
                          <Text selectable style={[styles.posterName, { color: colors.text }]}>
                            {gig.poster.displayName}
                          </Text>
                          <Text selectable style={[styles.posterSubline, { color: colors.textMuted }]}>
                            {gig.location.barangay}, {gig.location.city}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.posterMetricList}>
                        {[
                          { label: 'Rating', value: gig.poster.rating.toFixed(1) },
                          { label: 'Reviews', value: String(gig.poster.reviewCount) },
                          { label: 'Response', value: formatPercent(gig.poster.responseRate) },
                          { label: 'Jobs posted', value: String(gig.poster.gigsPosted) },
                          { label: 'Hires funded', value: String(gig.poster.hiresFunded) },
                          { label: 'Completed', value: String(gig.poster.hiresCompleted) }
                        ].map((item, index) => (
                          <View
                            key={item.label}
                            style={[
                              styles.posterMetricRow,
                              index > 0 && {
                                borderTopWidth: 1,
                                borderTopColor: colors.border
                              }
                            ]}
                          >
                            <Text selectable style={[styles.posterMetricLabel, { color: colors.textMuted }]}>
                              {item.label}
                            </Text>
                            <Text selectable style={[styles.posterMetricValue, { color: colors.text }]}>
                              {item.value}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View style={[styles.section, { borderTopColor: colors.border }]}>
                      <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>Apply for this gig</Text>
                      <Text selectable style={[styles.bodyText, { color: colors.textMuted }]}>
                        Send a short intro and your availability so the poster can review your fit quickly.
                      </Text>

                      {applicationFeedback != null && (
                        <View
                          style={[
                            styles.feedbackBanner,
                            {
                              backgroundColor: colors.accentSoft,
                              borderColor: colors.success
                            }
                          ]}
                        >
                          <Text selectable style={[styles.feedbackText, { color: colors.text }]}>
                            {applicationFeedback}
                          </Text>
                        </View>
                      )}

                      {applyError != null && (
                        <View
                          style={[
                            styles.feedbackBanner,
                            {
                              backgroundColor: colors.surfaceMuted,
                              borderColor: colors.danger
                            }
                          ]}
                        >
                          <Text selectable style={[styles.feedbackText, { color: colors.danger }]}>
                            {applyError}
                          </Text>
                        </View>
                      )}

                      {!isWorkerLocationReady && (
                        <View
                          style={[
                            styles.feedbackBanner,
                            {
                              backgroundColor: colors.surfaceMuted,
                              borderColor: colors.warning
                            }
                          ]}
                        >
                          <Text selectable style={[styles.feedbackText, { color: colors.text }]}>
                            Add your worker location before applying. The backend checks your distance against the gig radius.
                          </Text>
                        </View>
                      )}

                      <TextField
                        autoCapitalize="sentences"
                        editable={canEditApplication}
                        label="Why are you a fit?"
                        mode={mode}
                        multiline
                        onChangeText={(value) => {
                          setApplyError(null)
                          setIntro(value)
                        }}
                        onBlur={() => {
                          clearFocusedField('intro')
                        }}
                        onFocus={() => {
                          setFocusedField('intro')
                        }}
                        placeholder="Share relevant experience, what you can handle, and how you will approach the work."
                        value={intro}
                      />

                      <TextField
                        autoCapitalize="sentences"
                        editable={canEditApplication}
                        label="Availability"
                        mode={mode}
                        onChangeText={(value) => {
                          setApplyError(null)
                          setAvailability(value)
                        }}
                        onBlur={() => {
                          clearFocusedField('availability')
                        }}
                        onFocus={() => {
                          setFocusedField('availability')
                        }}
                        placeholder="Tomorrow after 2 PM, or Saturday morning."
                        value={availability}
                      />
                    </View>
                </>
              )}
            </Animated.ScrollView>
          </GestureDetector>

          {gig != null && (
            <View
              style={[
                styles.footer,
                {
                  borderTopColor: colors.border,
                  backgroundColor: colors.background,
                  paddingBottom: footerBottomPadding
                }
              ]}
            >
              <PrimaryButton
                disabled={existingApplicationStatus != null || !isWorkerLocationReady}
                loading={isSubmitting}
                mode={mode}
                onPress={() => { void handleSubmitApplication() }}
              >
                {footerButtonLabel}
              </PrimaryButton>
            </View>
          )}
          </Animated.View>
        </GestureDetector>
      </View>
    </>
  )
}

import { Image } from 'expo-image'
import React from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import { PrimaryButton } from '@/components/primary-button'
import { SelectField } from '@/components/select-field'
import { SelectionSheet, type SelectionOption } from '@/components/selection-sheet'
import { TextField } from '@/components/text-field'
import { palette, resolvePaletteMode } from '@/constants/palette'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { findLocationMatch, findCityByProvinceAndName, getLocationDirectoryRelease, listBarangaysByProvinceAndCity, listCitiesByProvince, listProvinceNames } from '@/lib/ph-location-directory'
import { type BackendAuthUser, type UserProfile } from '@/lib/raket-types'
import { useSession } from '@/providers/session-provider'
import { onboardingScreenStyles as styles } from '@/styles/screens/onboarding-screen'

type ActiveSheet = 'province' | 'city' | 'barangay' | null
type OnboardingStep = 'profile' | 'phone' | 'pin' | 'photo'

const onboardingSteps: OnboardingStep[] = ['profile', 'phone', 'pin', 'photo']

function hasTextValue(value: string | null | undefined): boolean {
  return value != null && value.trim() !== ''
}

function getAuthAvatarUrl(authUser: BackendAuthUser | null): string | null {
  if (authUser == null) {
    return null
  }

  const metadata = authUser.userMetadata
  const candidates = [
    metadata.avatar_url,
    metadata.picture,
    metadata.photo_url,
    metadata.picture_url
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim() !== '') {
      return candidate.trim()
    }
  }

  return null
}

function buildAvatarPlaceholderDataUri(name: string): string {
  const trimmedName = name.trim()
  let parts = ['Raket']

  if (trimmedName !== '') {
    parts = trimmedName.split(/\s+/).filter((part) => part !== '')
  }

  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'R'
  const paletteIndex = trimmedName
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0) % 4
  const backgroundColors = ['#0f766e', '#166534', '#1d4ed8', '#b45309']
  const backgroundColor = backgroundColors[paletteIndex]
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
      <rect width="256" height="256" rx="128" fill="${backgroundColor}" />
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="96" font-weight="700">${initials}</text>
    </svg>
  `

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function buildInitialFieldValue(currentValue: string, fallbackValue: string): string {
  if (currentValue !== '') {
    return currentValue
  }

  return fallbackValue
}

function toNullableText(value: string): string | null {
  if (value === '') {
    return null
  }

  return value
}

function resolveAvatarUrl(
  avatarUrl: string,
  authAvatarUrl: string | null,
  generatedAvatarUrl: string
): string {
  const trimmedAvatarUrl = avatarUrl.trim()

  if (trimmedAvatarUrl !== '') {
    return trimmedAvatarUrl
  }

  if (authAvatarUrl != null) {
    return authAvatarUrl
  }

  return generatedAvatarUrl
}

function getResolvedStepIndex(currentStep: OnboardingStep): number {
  const stepIndex = onboardingSteps.indexOf(currentStep)

  if (stepIndex < 0) {
    return 0
  }

  return stepIndex
}

function getCityPlaceholder(province: string): string {
  if (province.trim() === '') {
    return 'Select province first'
  }

  return 'Select a city'
}

function getBarangayPlaceholder(city: string): string {
  if (city.trim() === '') {
    return 'Select city first'
  }

  return 'Select a barangay'
}

function getCityEmptyMessage(province: string): string {
  if (province.trim() === '') {
    return 'Pick a province first.'
  }

  return 'No cities matched your search.'
}

function getBarangayEmptyMessage(city: string): string {
  if (city.trim() === '') {
    return 'Pick a city first.'
  }

  return 'No barangays matched your search.'
}

function getSelectedBarangayKey(
  selectedCityRecord: ReturnType<typeof findCityByProvinceAndName>,
  barangay: string
): string {
  if (selectedCityRecord == null) {
    return barangay
  }

  return `${selectedCityRecord.code}:${barangay}`
}

function getPhotoCopy(authAvatarUrl: string | null): { title: string; description: string } {
  if (authAvatarUrl == null) {
    return {
      title: 'Profile image ready',
      description: 'We could not find a Google photo, so we created a profile image from your initials for now. You can replace it later.'
    }
  }

  return {
    title: 'Using your Google profile photo',
    description: 'We found a photo on your Google account and will use it as your starting profile image.'
  }
}

function getPrimaryActionLabel(step: OnboardingStep): string {
  if (step === 'photo') {
    return 'Finish onboarding'
  }

  return 'Continue'
}

function getKeyboardAvoidingBehavior() {
  if (Platform.OS === 'ios') {
    return 'padding' as const
  }

  return undefined
}

function getSecondaryActionLabel(resolvedStepIndex: number): string {
  if (resolvedStepIndex === 0) {
    return 'Sign out'
  }

  return 'Back'
}

function getNextOnboardingStep(profile: UserProfile | null | undefined): OnboardingStep {
  if (profile == null) {
    return 'profile'
  }

  if (
    !hasTextValue(profile.displayName) ||
    !hasTextValue(profile.province) ||
    !hasTextValue(profile.city) ||
    !hasTextValue(profile.barangay)
  ) {
    return 'profile'
  }

  if (!hasTextValue(profile.phone)) {
    return 'phone'
  }

  if (!profile.hasPin) {
    return 'pin'
  }

  return 'photo'
}

export default function OnboardingScreen() {
  const colorScheme = useColorScheme()
  const mode = resolvePaletteMode(colorScheme)
  const colors = palette[mode]
  const { authUser, clearError, error, profile, signOut, updateProfile } = useSession()
  const [displayName, setDisplayName] = React.useState('')
  const [province, setProvince] = React.useState('')
  const [city, setCity] = React.useState('')
  const [barangay, setBarangay] = React.useState('')
  const [bio, setBio] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [pinCode, setPinCode] = React.useState('')
  const [pinCodeConfirmation, setPinCodeConfirmation] = React.useState('')
  const [avatarUrl, setAvatarUrl] = React.useState('')
  const [activeSheet, setActiveSheet] = React.useState<ActiveSheet>(null)
  const [currentStep, setCurrentStep] = React.useState<OnboardingStep>('profile')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const hasInitializedStep = React.useRef(false)

  const authAvatarUrl = React.useMemo(() => getAuthAvatarUrl(authUser), [authUser])
  const generatedAvatarUrl = React.useMemo(
    () => buildAvatarPlaceholderDataUri(displayName || profile?.displayName || authUser?.email || 'Raket User'),
    [authUser?.email, displayName, profile?.displayName]
  )

  const locationMatch = React.useMemo(() => findLocationMatch(
    profile?.province,
    profile?.city,
    profile?.barangay
  ), [profile?.barangay, profile?.city, profile?.province])

  const provinceOptions = React.useMemo<SelectionOption[]>(() => (
    listProvinceNames().map((provinceName) => ({
      key: provinceName,
      label: provinceName
    }))
  ), [])

  const cityOptions = React.useMemo<SelectionOption[]>(() => (
    listCitiesByProvince(province).map((cityOption) => ({
      key: cityOption.code,
      label: cityOption.name
    }))
  ), [province])

  const selectedCityRecord = React.useMemo(() => findCityByProvinceAndName(province, city), [city, province])

  const barangayOptions = React.useMemo<SelectionOption[]>(() => (
    listBarangaysByProvinceAndCity(province, city).map((barangayName) => ({
      key: `${selectedCityRecord?.code ?? province}:${barangayName}`,
      label: barangayName
    }))
  ), [city, province, selectedCityRecord?.code])

  React.useEffect(() => {
    if (profile == null) {
      return
    }

    const resolvedProvince = locationMatch?.provinceName ?? profile.province ?? ''
    const resolvedCity = locationMatch?.cityName ?? profile.city ?? ''
    const resolvedBarangay = locationMatch?.barangayName ?? profile.barangay ?? ''

    setDisplayName((currentValue) => buildInitialFieldValue(currentValue, profile.displayName))
    setProvince((currentValue) => buildInitialFieldValue(currentValue, resolvedProvince))
    setCity((currentValue) => buildInitialFieldValue(currentValue, resolvedCity))
    setBarangay((currentValue) => buildInitialFieldValue(currentValue, resolvedBarangay))
    setBio((currentValue) => buildInitialFieldValue(currentValue, profile.bio ?? ''))
    setPhone((currentValue) => buildInitialFieldValue(currentValue, profile.phone ?? authUser?.phone ?? ''))
    setAvatarUrl((currentValue) => buildInitialFieldValue(currentValue, profile.avatarUrl ?? authAvatarUrl ?? ''))
  }, [authAvatarUrl, authUser?.phone, locationMatch, profile])

  React.useEffect(() => {
    if (hasInitializedStep.current || profile == null) {
      return
    }

    setCurrentStep(getNextOnboardingStep(profile))
    hasInitializedStep.current = true
  }, [profile])

  const resolvedStepIndex = getResolvedStepIndex(currentStep)
  const heroTitleByStep: Record<OnboardingStep, string> = {
    profile: 'Set up your account',
    phone: 'Enter your phone number',
    pin: 'Set up your PIN code',
    photo: 'Add a profile photo'
  }
  const heroDescriptionByStep: Record<OnboardingStep, string> = {
    profile: 'Tell us who you are and where you are based so we can tailor the marketplace to you.',
    phone: 'Add the number people should use for account-related contact and future verification.',
    pin: 'Choose a 4 to 8 digit PIN you can use for future sensitive actions in the app.',
    photo: 'We will save a profile image for your account before you enter the marketplace.'
  }

  const surfaceMessage = formError ?? error
  const resolvedAvatarUrl = resolveAvatarUrl(avatarUrl, authAvatarUrl, generatedAvatarUrl)
  const cityPlaceholder = getCityPlaceholder(province)
  const barangayPlaceholder = getBarangayPlaceholder(city)
  const cityEmptyMessage = getCityEmptyMessage(province)
  const barangayEmptyMessage = getBarangayEmptyMessage(city)
  const selectedBarangayKey = getSelectedBarangayKey(selectedCityRecord, barangay)
  const photoCopy = getPhotoCopy(authAvatarUrl)
  const primaryActionLabel = getPrimaryActionLabel(currentStep)
  const keyboardAvoidingBehavior = getKeyboardAvoidingBehavior()
  const secondaryActionLabel = getSecondaryActionLabel(resolvedStepIndex)

  function moveToPreviousStep() {
    clearError()
    setFormError(null)

    if (resolvedStepIndex === 0) {
      return
    }

    setCurrentStep(onboardingSteps[resolvedStepIndex - 1])
  }

  function handleSecondaryAction() {
    if (resolvedStepIndex === 0) {
      void signOut()
      return
    }

    moveToPreviousStep()
  }

  function validateProfileStep(): string | null {
    const trimmedDisplayName = displayName.trim()
    const trimmedProvince = province.trim()
    const trimmedCity = city.trim()
    const trimmedBarangay = barangay.trim()

    if (trimmedDisplayName.length < 2) {
      return 'Name must be at least 2 characters.'
    }

    if (trimmedProvince === '' || trimmedCity === '' || trimmedBarangay === '') {
      return 'Province, city, and barangay are required.'
    }

    return null
  }

  function validatePhoneStep(): string | null {
    const trimmedPhone = phone.trim()
    const normalizedDigits = trimmedPhone.replace(/\D/g, '')

    if (normalizedDigits.length < 10 || normalizedDigits.length > 15) {
      return 'Enter a valid phone number with 10 to 15 digits.'
    }

    return null
  }

  function validatePinStep(): string | null {
    const trimmedPinCode = pinCode.trim()
    const trimmedPinCodeConfirmation = pinCodeConfirmation.trim()

    if (!/^\d{4,8}$/.test(trimmedPinCode)) {
      return 'PIN code must be 4 to 8 digits.'
    }

    if (trimmedPinCode !== trimmedPinCodeConfirmation) {
      return 'PIN code confirmation does not match.'
    }

    return null
  }

  async function submitPhotoStep(): Promise<void> {
    const profileStepError = validateProfileStep()

    if (profileStepError != null) {
      setFormError(profileStepError)
      setCurrentStep('profile')
      return
    }

    const phoneStepError = validatePhoneStep()

    if (phoneStepError != null) {
      setFormError(phoneStepError)
      setCurrentStep('phone')
      return
    }

    const pinStepError = validatePinStep()

    if (pinStepError != null) {
      setFormError(pinStepError)
      setCurrentStep('pin')
      return
    }

    const trimmedDisplayName = displayName.trim()
    const trimmedProvince = province.trim()
    const trimmedCity = city.trim()
    const trimmedBarangay = barangay.trim()
    const trimmedBio = bio.trim()
    const trimmedPhone = phone.trim()
    const trimmedPinCode = pinCode.trim()

    await updateProfile({
      displayName: trimmedDisplayName,
      province: trimmedProvince,
      city: trimmedCity,
      barangay: trimmedBarangay,
      bio: toNullableText(trimmedBio),
      phone: trimmedPhone,
      pinCode: trimmedPinCode,
      avatarUrl: resolvedAvatarUrl
    })
  }

  async function handleContinue(): Promise<void> {
    clearError()
    setFormError(null)
    setIsSubmitting(true)

    try {
      if (currentStep === 'profile') {
        const profileStepError = validateProfileStep()

        if (profileStepError != null) {
          setFormError(profileStepError)
          return
        }

        setCurrentStep('phone')
        return
      }

      if (currentStep === 'phone') {
        const phoneStepError = validatePhoneStep()

        if (phoneStepError != null) {
          setFormError(phoneStepError)
          return
        }

        setCurrentStep('pin')
        return
      }

      if (currentStep === 'pin') {
        const pinStepError = validatePinStep()

        if (pinStepError != null) {
          setFormError(pinStepError)
          return
        }

        setCurrentStep('photo')
        return
      }

      await submitPhotoStep()
    } finally {
      setIsSubmitting(false)
    }
  }

  function renderCurrentStep() {
    if (currentStep === 'profile') {
      return (
        <>
          <TextField
            autoCapitalize="words"
            editable={!isSubmitting}
            label="Name"
            mode={mode}
            onChangeText={(nextValue) => {
              clearError()
              setFormError(null)
              setDisplayName(nextValue)
            }}
            placeholder="How should people see your name?"
            value={displayName}
          />

          <Text selectable style={[styles.helperText, { color: colors.textMuted }]}>
            Province, city, and barangay options are bundled offline from PSGC {getLocationDirectoryRelease()}.
          </Text>

          <SelectField
            disabled={isSubmitting}
            label="Province"
            mode={mode}
            onPress={() => {
              clearError()
              setFormError(null)
              setActiveSheet('province')
            }}
            placeholder="Select a province"
            value={province}
          />

          <SelectField
            disabled={isSubmitting || province.trim() === ''}
            label="City"
            mode={mode}
            onPress={() => {
              clearError()
              setFormError(null)
              setActiveSheet('city')
            }}
            placeholder={cityPlaceholder}
            value={city}
          />

          <SelectField
            disabled={isSubmitting || city.trim() === ''}
            label="Barangay"
            mode={mode}
            onPress={() => {
              clearError()
              setFormError(null)
              setActiveSheet('barangay')
            }}
            placeholder={barangayPlaceholder}
            value={barangay}
          />

          <TextField
            editable={!isSubmitting}
            label="Short bio (optional)"
            mode={mode}
            multiline
            numberOfLines={5}
            onChangeText={(nextValue) => {
              clearError()
              setFormError(null)
              setBio(nextValue)
            }}
            placeholder="What kind of work do you usually post or need help with?"
            value={bio}
          />
        </>
      )
    }

    if (currentStep === 'phone') {
      return (
        <>
          <TextField
            editable={!isSubmitting}
            keyboardType="phone-pad"
            label="Phone number"
            mode={mode}
            onChangeText={(nextValue) => {
              clearError()
              setFormError(null)
              setPhone(nextValue)
            }}
            placeholder="09xx xxx xxxx or +63 xxx xxx xxxx"
            value={phone}
          />
          <Text selectable style={[styles.helperText, { color: colors.textMuted }]}>
            Use the number you want tied to this account. You can change it later from your profile settings.
          </Text>
        </>
      )
    }

    if (currentStep === 'pin') {
      return (
        <>
          <TextField
            editable={!isSubmitting}
            keyboardType="number-pad"
            label="PIN code"
            maxLength={8}
            mode={mode}
            onChangeText={(nextValue) => {
              clearError()
              setFormError(null)
              setPinCode(nextValue.replace(/\D/g, ''))
            }}
            placeholder="Enter 4 to 8 digits"
            secureTextEntry
            value={pinCode}
          />
          <TextField
            editable={!isSubmitting}
            keyboardType="number-pad"
            label="Confirm PIN code"
            maxLength={8}
            mode={mode}
            onChangeText={(nextValue) => {
              clearError()
              setFormError(null)
              setPinCodeConfirmation(nextValue.replace(/\D/g, ''))
            }}
            placeholder="Re-enter your PIN code"
            secureTextEntry
            value={pinCodeConfirmation}
          />
          <Text selectable style={[styles.helperText, { color: colors.textMuted }]}>
            This PIN is stored securely on your account and should be different from obvious guesses like 1234.
          </Text>
        </>
      )
    }

    return (
      <View style={[styles.photoCard, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
        <Image
          contentFit="cover"
          source={{ uri: resolvedAvatarUrl }}
          style={styles.photoPreview}
        />
        <Text selectable style={[styles.photoTitle, { color: colors.text }]}>
          {photoCopy.title}
        </Text>
        <Text selectable style={[styles.photoDescription, { color: colors.textMuted }]}>
          {photoCopy.description}
        </Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={keyboardAvoidingBehavior}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        style={styles.screen}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border
            }
          ]}
        >
          <View style={styles.hero}>
            <Text selectable style={[styles.progressText, { color: colors.textMuted }]}>
              Step {resolvedStepIndex + 1} of {onboardingSteps.length}
            </Text>

            <View style={[styles.kicker, { backgroundColor: colors.accentSoft }]}>
              <Text selectable style={[styles.kickerText, { color: colors.accent }]}>
                Onboarding
              </Text>
            </View>

            <Text selectable style={[styles.title, { color: colors.text }]}>
              {heroTitleByStep[currentStep]}
            </Text>
            <Text selectable style={[styles.description, { color: colors.textMuted }]}>
              {heroDescriptionByStep[currentStep]}
            </Text>
            <Text selectable style={[styles.email, { color: colors.textMuted }]}>
              {authUser?.email ?? 'Google account connected'}
            </Text>
          </View>

          <View style={styles.form}>
            {renderCurrentStep()}

            {surfaceMessage != null && (
              <View
                style={[
                  styles.messageCard,
                  {
                    backgroundColor: colors.surfaceMuted,
                    borderColor: colors.danger
                  }
                ]}
              >
                <Text selectable style={[styles.messageText, { color: colors.danger }]}>
                  {surfaceMessage}
                </Text>
              </View>
            )}

            <View style={styles.actionRow}>
              <View style={styles.actionButton}>
                <PrimaryButton
                  disabled={isSubmitting}
                  mode={mode}
                  onPress={handleSecondaryAction}
                  variant="secondary"
                >
                  {secondaryActionLabel}
                </PrimaryButton>
              </View>

              <View style={styles.actionButton}>
                <PrimaryButton loading={isSubmitting} mode={mode} onPress={() => { void handleContinue() }}>
                  {primaryActionLabel}
                </PrimaryButton>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <SelectionSheet
        emptyMessage="No provinces matched your search."
        mode={mode}
        onClose={() => { setActiveSheet(null) }}
        onSelect={(option) => {
          clearError()
          setFormError(null)
          setProvince(option.label)
          setCity('')
          setBarangay('')
          setActiveSheet(null)
        }}
        options={provinceOptions}
        searchPlaceholder="Search province"
        selectedKey={province}
        title="Select province"
        visible={activeSheet === 'province'}
      />
      <SelectionSheet
        emptyMessage={cityEmptyMessage}
        mode={mode}
        onClose={() => { setActiveSheet(null) }}
        onSelect={(option) => {
          clearError()
          setFormError(null)
          setCity(option.label)
          setBarangay('')
          setActiveSheet(null)
        }}
        options={cityOptions}
        searchPlaceholder="Search city"
        selectedKey={selectedCityRecord?.code ?? city}
        title="Select city"
        visible={activeSheet === 'city'}
      />
      <SelectionSheet
        emptyMessage={barangayEmptyMessage}
        mode={mode}
        onClose={() => { setActiveSheet(null) }}
        onSelect={(option) => {
          clearError()
          setFormError(null)
          setBarangay(option.label)
          setActiveSheet(null)
        }}
        options={barangayOptions}
        searchPlaceholder="Search barangay"
        selectedKey={selectedBarangayKey}
        title="Select barangay"
        visible={activeSheet === 'barangay'}
      />
    </KeyboardAvoidingView>
  )
}

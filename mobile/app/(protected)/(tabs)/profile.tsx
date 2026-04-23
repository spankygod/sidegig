import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { OptionChip } from '@/components/option-chip'
import { ProfileScreenSkeleton } from '@/components/loading/profile-screen-skeleton'
import { PrimaryButton } from '@/components/primary-button'
import { SelectField } from '@/components/select-field'
import { SelectionSheet, type SelectionOption } from '@/components/selection-sheet'
import { TextField } from '@/components/text-field'
import { palette, resolvePaletteMode } from '@/constants/palette'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { findCityByProvinceAndName, findLocationMatch, getLocationDirectoryRelease, listBarangaysByProvinceAndCity, listCitiesByProvince, listProvinceNames } from '@/lib/ph-location-directory'
import { isProfileOnboardingComplete } from '@/lib/raket-types'
import { useSession } from '@/providers/session-provider'
import { profileScreenStyles as styles } from '@/styles/screens/profile-screen'

type ActiveSheet = 'province' | 'city' | 'barangay' | null

const suggestedSkills = [
  'errands',
  'cleaning',
  'moving',
  'construction helper',
  'photo assist',
  'delivery',
  'virtual assistance',
  'customer service'
] as const

const compactNumberFormatter = new Intl.NumberFormat('en-PH', {
  notation: 'compact',
  maximumFractionDigits: 1
})

function formatNullableValue(value: string | null | undefined, fallback = 'Not set yet'): string {
  if (value == null || value.trim() === '') {
    return fallback
  }

  return value
}

function formatCompactNumber(value: number): string {
  if (value < 1000) {
    return String(value)
  }

  return compactNumberFormatter.format(value)
}

function formatRatingValue(value: number): string {
  if (value <= 0) {
    return 'New'
  }

  return value.toFixed(1)
}

function formatLocationLine(province: string, city: string, barangay: string): string {
  const parts = [barangay, city, province]
    .map((part) => part.trim())
    .filter((part) => part !== '')

  if (parts.length === 0) {
    return 'Location not set yet'
  }

  return parts.join(', ')
}

function formatRadiusLabel(radius: number): string {
  return `${radius} km radius`
}

function formatSkillsInput(skills: string[]): string {
  return skills.join(', ')
}

function parseSkillsInput(value: string): string[] {
  return [...new Set(
    value
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill !== '')
  )]
}

function includesSkill(skills: string[], skill: string): boolean {
  const normalizedSkill = skill.trim().toLocaleLowerCase('en-PH')

  return skills.some((existingSkill) => existingSkill.toLocaleLowerCase('en-PH') === normalizedSkill)
}

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  const baseValue = name?.trim() || email?.split('@')[0]?.trim() || 'Raket User'
  const parts = baseValue.split(/\s+/).filter((part) => part !== '')

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'RU'
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

function toNullableText(value: string): string | null {
  const trimmedValue = value.trim()

  if (trimmedValue === '') {
    return null
  }

  return trimmedValue
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const mode = resolvePaletteMode(colorScheme)
  const colors = palette[mode]
  const {
    authUser,
    clearError,
    error,
    isRefreshing,
    profile,
    refreshAppData,
    signOut,
    updateProfile
  } = useSession()
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [activeSheet, setActiveSheet] = React.useState<ActiveSheet>(null)
  const [displayName, setDisplayName] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [province, setProvince] = React.useState('')
  const [city, setCity] = React.useState('')
  const [barangay, setBarangay] = React.useState('')
  const [serviceRadiusKm, setServiceRadiusKm] = React.useState('')
  const [bio, setBio] = React.useState('')
  const [skillsInput, setSkillsInput] = React.useState('')
  const isInitialProfileLoading = isRefreshing && profile == null && error == null
  const profileLocationMatch = React.useMemo(() => findLocationMatch(
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

  const selectedCityRecord = React.useMemo(
    () => findCityByProvinceAndName(province, city),
    [city, province]
  )

  const barangayOptions = React.useMemo<SelectionOption[]>(() => (
    listBarangaysByProvinceAndCity(province, city).map((barangayName) => ({
      key: `${selectedCityRecord?.code ?? province}:${barangayName}`,
      label: barangayName
    }))
  ), [city, province, selectedCityRecord?.code])

  const selectedSkills = React.useMemo(
    () => parseSkillsInput(skillsInput),
    [skillsInput]
  )

  const accountEmail = authUser?.email ?? 'Google account connected'
  const avatarUrl = profile?.avatarUrl?.trim() || null
  const fallbackAvatarTextColor = mode === 'dark' ? '#0f172a' : '#ffffff'
  const surfaceMessage = formError ?? error
  const profileLocation = formatLocationLine(
    profileLocationMatch?.provinceName ?? profile?.province ?? '',
    profileLocationMatch?.cityName ?? profile?.city ?? '',
    profileLocationMatch?.barangayName ?? profile?.barangay ?? ''
  )
  const statusIsReady = isProfileOnboardingComplete(profile)
  const statusLabel = statusIsReady ? 'Marketplace ready' : 'Needs attention'
  const statusBackgroundColor = statusIsReady ? colors.accentSoft : colors.surfaceMuted
  const statusTextColor = statusIsReady ? colors.accent : colors.warning
  const cityPlaceholder = getCityPlaceholder(province)
  const barangayPlaceholder = getBarangayPlaceholder(city)
  const cityEmptyMessage = getCityEmptyMessage(province)
  const barangayEmptyMessage = getBarangayEmptyMessage(city)
  const selectedBarangayKey = getSelectedBarangayKey(selectedCityRecord, barangay)

  const resetFormState = React.useCallback(() => {
    const resolvedProvince = profileLocationMatch?.provinceName ?? profile?.province ?? ''
    const resolvedCity = profileLocationMatch?.cityName ?? profile?.city ?? ''
    const resolvedBarangay = profileLocationMatch?.barangayName ?? profile?.barangay ?? ''

    setDisplayName(profile?.displayName ?? '')
    setPhone(profile?.phone ?? '')
    setProvince(resolvedProvince)
    setCity(resolvedCity)
    setBarangay(resolvedBarangay)
    setServiceRadiusKm(String(profile?.serviceRadiusKm ?? 15))
    setBio(profile?.bio ?? '')
    setSkillsInput(formatSkillsInput(profile?.skills ?? []))
  }, [profile, profileLocationMatch])

  React.useEffect(() => {
    if (profile == null || isEditing) {
      return
    }

    resetFormState()
  }, [isEditing, profile, resetFormState])

  function clearSurfaceMessage() {
    clearError()
    setFormError(null)
  }

  function startEditing() {
    clearSurfaceMessage()
    resetFormState()
    setIsEditing(true)
  }

  function cancelEditing() {
    clearSurfaceMessage()
    resetFormState()
    setActiveSheet(null)
    setIsEditing(false)
  }

  function toggleSuggestedSkill(skill: string) {
    clearSurfaceMessage()
    setSkillsInput((currentValue) => {
      const currentSkills = parseSkillsInput(currentValue)
      const nextSkills = includesSkill(currentSkills, skill)
        ? currentSkills.filter((existingSkill) => (
          existingSkill.toLocaleLowerCase('en-PH') !== skill.toLocaleLowerCase('en-PH')
        ))
        : [...currentSkills, skill]

      return formatSkillsInput(nextSkills)
    })
  }

  async function saveProfile() {
    const trimmedDisplayName = displayName.trim()
    const trimmedPhone = phone.trim()
    const trimmedProvince = province.trim()
    const trimmedCity = city.trim()
    const trimmedBarangay = barangay.trim()
    const trimmedBio = bio.trim()
    const normalizedSkills = parseSkillsInput(skillsInput)
    const parsedRadius = Number.parseInt(serviceRadiusKm, 10)

    clearSurfaceMessage()

    if (trimmedDisplayName.length < 2) {
      setFormError('Display name must be at least 2 characters.')
      return
    }

    if (trimmedPhone === '') {
      setFormError('Phone number is required.')
      return
    }

    const normalizedPhoneDigits = trimmedPhone.replace(/\D/g, '')

    if (normalizedPhoneDigits.length < 10 || normalizedPhoneDigits.length > 15) {
      setFormError('Enter a valid phone number with 10 to 15 digits.')
      return
    }

    if (trimmedProvince === '' || trimmedCity === '' || trimmedBarangay === '') {
      setFormError('Province, city, and barangay are required.')
      return
    }

    if (!Number.isFinite(parsedRadius) || parsedRadius < 1 || parsedRadius > 200) {
      setFormError('Service radius must be between 1 and 200 km.')
      return
    }

    if (trimmedBio.length > 280) {
      setFormError('Bio must be 280 characters or fewer.')
      return
    }

    if (normalizedSkills.length > 20) {
      setFormError('Add up to 20 skills only.')
      return
    }

    if (normalizedSkills.some((skill) => skill.length > 40)) {
      setFormError('Each skill must be 40 characters or fewer.')
      return
    }

    setIsSaving(true)

    try {
      await updateProfile({
        bio: toNullableText(trimmedBio),
        city: trimmedCity,
        displayName: trimmedDisplayName,
        barangay: trimmedBarangay,
        phone: trimmedPhone,
        province: trimmedProvince,
        serviceRadiusKm: parsedRadius,
        skills: normalizedSkills
      })
      setIsEditing(false)
      setActiveSheet(null)
    } finally {
      setIsSaving(false)
    }
  }

  if (isInitialProfileLoading) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={styles.contentContainer}
        style={[styles.screen, { backgroundColor: colors.background }]}
      >
        <ProfileScreenSkeleton mode={mode} />
      </ScrollView>
    )
  }

  if (profile == null) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={styles.contentContainer}
        style={[styles.screen, { backgroundColor: colors.background }]}
      >
        <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text selectable style={[styles.emptyTitle, { color: colors.text }]}>
            Profile unavailable
          </Text>
          <Text selectable style={[styles.emptyBody, { color: colors.textMuted }]}>
            We could not load your profile details right now. Try refreshing before signing out.
          </Text>
        </View>

        {surfaceMessage != null && (
          <View style={[styles.messageCard, { backgroundColor: colors.surfaceMuted, borderColor: colors.danger }]}>
            <Text selectable style={[styles.messageText, { color: colors.danger }]}>
              {surfaceMessage}
            </Text>
          </View>
        )}

        <View style={styles.actionRow}>
          <View style={styles.actionButton}>
            <PrimaryButton mode={mode} onPress={() => { void refreshAppData() }} variant="secondary">
              Refresh profile
            </PrimaryButton>
          </View>
          <View style={styles.actionButton}>
            <PrimaryButton mode={mode} onPress={() => { void signOut() }}>
              Sign out
            </PrimaryButton>
          </View>
        </View>
      </ScrollView>
    )
  }

  const profileStats = [
    {
      label: 'Rating',
      value: formatRatingValue(profile.stats.rating)
    },
    {
      label: 'Reviews',
      value: formatCompactNumber(profile.stats.reviewCount)
    },
    {
      label: 'Completed',
      value: formatCompactNumber(profile.stats.jobsCompleted)
    },
    {
      label: 'Response',
      value: `${profile.stats.responseRate}%`
    }
  ]

  const detailRows = [
    {
      label: 'Phone',
      value: formatNullableValue(profile.phone)
    },
    {
      label: 'Location',
      value: profileLocation
    },
    {
      label: 'Service radius',
      value: formatRadiusLabel(profile.serviceRadiusKm)
    },
    {
      label: 'PIN security',
      value: profile.hasPin ? 'Enabled' : 'Not set yet'
    },
    {
      label: 'User ID',
      value: profile.id
    }
  ]

  const readOnlySkills = profile.skills
  const hasReadOnlySkills = readOnlySkills.length > 0
  const heroDescription = profile.bio?.trim() || 'Add a short bio so workers and clients know what kind of jobs you post or take on.'

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        style={[styles.screen, { backgroundColor: colors.background }]}
      >
        <View
          style={[
            styles.screenHeader,
            {
              paddingTop: Math.max(insets.top + 8, 18) + 14
            }
          ]}
        >
          <Text selectable style={[styles.screenTitle, { color: colors.text }]}>
            Profile
          </Text>
        </View>

        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.heroTopRow}>
            {avatarUrl != null
              ? (
                <Image
                  contentFit="cover"
                  source={{ uri: avatarUrl }}
                  style={styles.avatarImage}
                />
                )
              : (
                <View style={[styles.avatarFallback, { backgroundColor: colors.accent }]}>
                  <Text selectable style={[styles.avatarFallbackText, { color: fallbackAvatarTextColor }]}>
                    {getInitials(profile.displayName, authUser?.email)}
                  </Text>
                </View>
                )}

            <View style={styles.heroCopy}>
              <View style={[styles.statusPill, { backgroundColor: statusBackgroundColor }]}>
                <Text selectable style={[styles.statusPillText, { color: statusTextColor }]}>
                  {statusLabel}
                </Text>
              </View>
              <Text selectable style={[styles.heroTitle, { color: colors.text }]}>
                {profile.displayName}
              </Text>
              <Text selectable style={[styles.heroBody, { color: colors.textMuted }]}>
                {accountEmail}
              </Text>
            </View>
          </View>

          <Text selectable style={[styles.heroDescription, { color: colors.textMuted }]}>
            {heroDescription}
          </Text>

          <View style={styles.metaRow}>
            <View style={[styles.metaPill, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
              <Ionicons color={colors.accent} name="location-outline" size={16} />
              <Text selectable style={[styles.metaPillText, { color: colors.text }]}>
                {profileLocation}
              </Text>
            </View>
            <View style={[styles.metaPill, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
              <Ionicons color={colors.accent} name="radio-outline" size={16} />
              <Text selectable style={[styles.metaPillText, { color: colors.text }]}>
                {formatRadiusLabel(profile.serviceRadiusKm)}
              </Text>
            </View>
          </View>
        </View>

        {surfaceMessage != null && (
          <View style={[styles.messageCard, { backgroundColor: colors.surfaceMuted, borderColor: colors.danger }]}>
            <Text selectable style={[styles.messageText, { color: colors.danger }]}>
              {surfaceMessage}
            </Text>
          </View>
        )}

        <View style={styles.statsRow}>
          {profileStats.map((stat) => (
            <View
              key={stat.label}
              style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text selectable style={[styles.statLabel, { color: colors.textMuted }]}>
                {stat.label}
              </Text>
              <Text selectable style={[styles.statValue, { color: colors.text }]}>
                {stat.value}
              </Text>
            </View>
          ))}
        </View>

        {!isEditing && (
          <>
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>
                Profile details
              </Text>

              <View style={styles.detailStack}>
                {detailRows.map((row, index) => {
                  const showSeparator = index < detailRows.length - 1

                  return (
                    <View key={row.label}>
                      <View style={styles.detailItem}>
                        <Text selectable style={[styles.detailLabel, { color: colors.textMuted }]}>
                          {row.label}
                        </Text>
                        <Text selectable style={[styles.detailValue, { color: colors.text }]}>
                          {row.value}
                        </Text>
                      </View>
                      {showSeparator && (
                        <View style={[styles.detailSeparator, { backgroundColor: colors.border }]} />
                      )}
                    </View>
                  )
                })}
              </View>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>
                Skills
              </Text>

              {hasReadOnlySkills
                ? (
                  <View style={styles.skillsWrap}>
                    {readOnlySkills.map((skill) => (
                      <View
                        key={skill}
                        style={[styles.skillPill, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}
                      >
                        <Text selectable style={[styles.skillPillText, { color: colors.text }]}>
                          {skill}
                        </Text>
                      </View>
                    ))}
                  </View>
                  )
                : (
                  <Text selectable style={[styles.helperText, { color: colors.textMuted }]}>
                    Add a few skills so future matching and applications have better context.
                  </Text>
                  )}
            </View>

            <View style={styles.actionRow}>
              <View style={styles.actionButton}>
                <PrimaryButton mode={mode} onPress={startEditing} variant="secondary">
                  Edit profile
                </PrimaryButton>
              </View>
              <View style={styles.actionButton}>
                <PrimaryButton mode={mode} onPress={() => { void refreshAppData() }} variant="secondary">
                  Refresh
                </PrimaryButton>
              </View>
            </View>

            <PrimaryButton mode={mode} onPress={() => { void signOut() }}>
              Sign out
            </PrimaryButton>
          </>
        )}

        {isEditing && (
          <>
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>
                Edit profile
              </Text>

              <View style={styles.form}>
                <TextField
                  autoCapitalize="words"
                  editable={!isSaving}
                  label="Display name"
                  mode={mode}
                  onChangeText={(nextValue) => {
                    clearSurfaceMessage()
                    setDisplayName(nextValue)
                  }}
                  placeholder="How should people see your name?"
                  value={displayName}
                />

                <TextField
                  editable={!isSaving}
                  keyboardType="phone-pad"
                  label="Phone number"
                  mode={mode}
                  onChangeText={(nextValue) => {
                    clearSurfaceMessage()
                    setPhone(nextValue)
                  }}
                  placeholder="09xx xxx xxxx or +63 xxx xxx xxxx"
                  value={phone}
                />

                <Text selectable style={[styles.helperText, { color: colors.textMuted }]}>
                  Province, city, and barangay options are bundled offline from PSGC {getLocationDirectoryRelease()}.
                </Text>

                <SelectField
                  disabled={isSaving}
                  label="Province"
                  mode={mode}
                  onPress={() => {
                    clearSurfaceMessage()
                    setActiveSheet('province')
                  }}
                  placeholder="Select a province"
                  value={province}
                />

                <SelectField
                  disabled={isSaving || province.trim() === ''}
                  label="City"
                  mode={mode}
                  onPress={() => {
                    clearSurfaceMessage()
                    setActiveSheet('city')
                  }}
                  placeholder={cityPlaceholder}
                  value={city}
                />

                <SelectField
                  disabled={isSaving || city.trim() === ''}
                  label="Barangay"
                  mode={mode}
                  onPress={() => {
                    clearSurfaceMessage()
                    setActiveSheet('barangay')
                  }}
                  placeholder={barangayPlaceholder}
                  value={barangay}
                />

                <TextField
                  editable={!isSaving}
                  keyboardType="number-pad"
                  label="Service radius (km)"
                  maxLength={3}
                  mode={mode}
                  onChangeText={(nextValue) => {
                    clearSurfaceMessage()
                    setServiceRadiusKm(nextValue.replace(/\D/g, ''))
                  }}
                  placeholder="How far should jobs be shown?"
                  value={serviceRadiusKm}
                />

                <TextField
                  editable={!isSaving}
                  label="Bio"
                  mode={mode}
                  multiline
                  numberOfLines={5}
                  onChangeText={(nextValue) => {
                    clearSurfaceMessage()
                    setBio(nextValue)
                  }}
                  placeholder="Tell people what kind of jobs you post or what work you usually take."
                  value={bio}
                />

                <TextField
                  editable={!isSaving}
                  label="Skills"
                  mode={mode}
                  onChangeText={(nextValue) => {
                    clearSurfaceMessage()
                    setSkillsInput(nextValue)
                  }}
                  placeholder="errands, packing, customer service"
                  value={skillsInput}
                />

                <Text selectable style={[styles.helperText, { color: colors.textMuted }]}>
                  Add up to 20 skills. Separate custom skills with commas or tap the suggestions below.
                </Text>

                <View style={styles.suggestedSkillsWrap}>
                  {suggestedSkills.map((skill) => (
                    <OptionChip
                      key={skill}
                      label={skill}
                      mode={mode}
                      onPress={() => { toggleSuggestedSkill(skill) }}
                      selected={includesSkill(selectedSkills, skill)}
                    />
                  ))}
                </View>

                {selectedSkills.length > 0 && (
                  <View style={styles.skillsWrap}>
                    {selectedSkills.map((skill) => (
                      <View
                        key={skill}
                        style={[styles.skillPill, { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}
                      >
                        <Text selectable style={[styles.skillPillText, { color: colors.accent }]}>
                          {skill}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.actionRow}>
              <View style={styles.actionButton}>
                <PrimaryButton mode={mode} onPress={cancelEditing} variant="secondary">
                  Cancel
                </PrimaryButton>
              </View>
              <View style={styles.actionButton}>
                <PrimaryButton loading={isSaving} mode={mode} onPress={() => { void saveProfile() }}>
                  Save changes
                </PrimaryButton>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <SelectionSheet
        emptyMessage="No provinces matched your search."
        mode={mode}
        onClose={() => { setActiveSheet(null) }}
        onSelect={(option) => {
          clearSurfaceMessage()
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
          clearSurfaceMessage()
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
          clearSurfaceMessage()
          setBarangay(option.label)
          setActiveSheet(null)
        }}
        options={barangayOptions}
        searchPlaceholder="Search barangay"
        selectedKey={selectedBarangayKey}
        title="Select barangay"
        visible={activeSheet === 'barangay'}
      />
    </>
  )
}

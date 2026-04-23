import React from 'react'
import DateTimePicker from '@react-native-community/datetimepicker'
import WheelPicker from '@quidone/react-native-wheel-picker'
import { Modal, Pressable, Platform, Text, TextInput, View } from 'react-native'
import { AppSurface } from '@/components/app-surface'
import { OptionChip } from '@/components/option-chip'
import { PrimaryButton } from '@/components/primary-button'
import { TextField } from '@/components/text-field'
import { palette, type PaletteMode } from '@/constants/palette'
import {
  type DurationBucket,
  formatGigCategory,
  gigCategories,
  type CreateGigPayload
} from '@/lib/raket-types'
import { useSession } from '@/providers/session-provider'
import { postJobComposerStyles as styles } from '@/styles/components/post-job-composer'

type GigFormState = {
  title: string
  category: typeof gigCategories[number]
  description: string
  priceAmount: string
  durationBucket: DurationBucket
  city: string
  barangay: string
  latitude: string
  longitude: string
  applicationRadiusKm: string
  scheduleSummary: string
  status: 'draft' | 'published'
  startsAt: string
}

type PostJobComposerProps = {
  introDescription?: string
  introTitle?: string
  mode?: PaletteMode
  onSuccess?: () => void
}

type WheelPickerItem<ValueT extends string | number> = {
  label: string
  value: ValueT
}

const initialFormState: GigFormState = {
  title: '',
  category: 'errands_personal_assistance',
  description: '',
  priceAmount: '',
  durationBucket: 'same_day',
  city: '',
  barangay: '',
  latitude: '',
  longitude: '',
  applicationRadiusKm: '25',
  scheduleSummary: '',
  status: 'published',
  startsAt: ''
}

function normalizeOptionalString(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function validateGigForm(form: GigFormState): string | null {
  if (form.title.trim().length < 4) {
    return 'Job title must be at least 4 characters.'
  }

  if (form.description.trim().length < 20) {
    return 'Description must be at least 20 characters.'
  }

  const priceAmount = Number.parseInt(form.priceAmount, 10)

  if (!Number.isFinite(priceAmount) || priceAmount < 100) {
    return 'Budget must be at least PHP 100.'
  }

  if (form.city.trim() === '' || form.barangay.trim() === '') {
    return 'City and barangay are required.'
  }

  const latitude = Number.parseFloat(form.latitude)
  const longitude = Number.parseFloat(form.longitude)

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return 'Latitude must be a valid number between -90 and 90.'
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return 'Longitude must be a valid number between -180 and 180.'
  }

  const applicationRadiusKm = Number.parseInt(form.applicationRadiusKm, 10)

  if (!Number.isFinite(applicationRadiusKm) || applicationRadiusKm < 1 || applicationRadiusKm > 200) {
    return 'Application radius must be between 1 km and 200 km.'
  }

  if (form.scheduleSummary.trim().length < 4) {
    return 'Pick a start date and time.'
  }

  return null
}

function buildCreateGigPayload(form: GigFormState): CreateGigPayload {
  return {
    title: form.title.trim(),
    category: form.category,
    description: form.description.trim(),
    priceAmount: Number.parseInt(form.priceAmount, 10),
    durationBucket: form.durationBucket,
    city: form.city.trim(),
    barangay: form.barangay.trim(),
    latitude: Number.parseFloat(form.latitude),
    longitude: Number.parseFloat(form.longitude),
    applicationRadiusKm: Number.parseInt(form.applicationRadiusKm, 10),
    scheduleSummary: form.scheduleSummary.trim(),
    status: form.status,
    startsAt: normalizeOptionalString(form.startsAt)
  }
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message
  }

  return 'Unable to post the job right now.'
}

function formatScheduleDateTime(value: Date): string {
  return new Intl.DateTimeFormat('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(value)
}

function formatWheelDateLabel(value: Date): string {
  const today = new Date()
  const isSameDay =
    today.getFullYear() === value.getFullYear() &&
    today.getMonth() === value.getMonth() &&
    today.getDate() === value.getDate()

  if (isSameDay) {
    return `Today ${new Intl.DateTimeFormat('en-PH', {
      day: 'numeric',
      month: 'short'
    }).format(value)}`
  }

  return new Intl.DateTimeFormat('en-PH', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }).format(value)
}

function roundDateToQuarterHour(value: Date): Date {
  const roundedValue = new Date(value)
  const minutes = roundedValue.getMinutes()
  const roundedMinutes = Math.round(minutes / 15) * 15
  roundedValue.setMinutes(roundedMinutes, 0, 0)

  if (roundedMinutes === 60) {
    roundedValue.setHours(roundedValue.getHours() + 1, 0, 0, 0)
  }

  return roundedValue
}

function buildDateWheelItems(baseDate: Date): WheelPickerItem<string>[] {
  return Array.from({ length: 30 }, (_, index) => {
    const nextDate = new Date(baseDate)
    nextDate.setHours(0, 0, 0, 0)
    nextDate.setDate(baseDate.getDate() + index)

    return {
      label: formatWheelDateLabel(nextDate),
      value: nextDate.toISOString().slice(0, 10)
    }
  })
}

function buildTimeWheelItems(): WheelPickerItem<number>[] {
  return Array.from({ length: 12 }, (_, index) => {
    const value = index + 1

    return {
      label: String(value),
      value
    }
  })
}

function buildMinuteWheelItems(): WheelPickerItem<number>[] {
  return Array.from({ length: 60 }, (_, index) => ({
    label: String(index).padStart(2, '0'),
    value: index
  }))
}

function buildMeridiemWheelItems(): WheelPickerItem<'AM' | 'PM'>[] {
  return [
    { label: 'AM', value: 'AM' },
    { label: 'PM', value: 'PM' }
  ]
}

function getTwelveHourValue(value: Date): number {
  const hours = value.getHours() % 12
  return hours === 0 ? 12 : hours
}

function getMeridiemValue(value: Date): 'AM' | 'PM' {
  return value.getHours() >= 12 ? 'PM' : 'AM'
}

function toTwentyFourHour(hour: number, meridiem: 'AM' | 'PM'): number {
  if (meridiem === 'AM') {
    return hour === 12 ? 0 : hour
  }

  return hour === 12 ? 12 : hour + 12
}

function getSchedulePickerValue(startsAt: string): Date {
  if (startsAt.trim() === '') {
    return roundDateToQuarterHour(new Date())
  }

  const parsedValue = new Date(startsAt)

  if (Number.isNaN(parsedValue.getTime())) {
    return roundDateToQuarterHour(new Date())
  }

  return roundDateToQuarterHour(parsedValue)
}

export function PostJobComposer({
  introDescription = 'Fill in the essentials and publish when the role is ready for workers nearby.',
  introTitle = 'Create a new gig',
  mode,
  onSuccess
}: PostJobComposerProps) {
  const colors = palette[mode ?? 'light']
  const { clearError, submitGig } = useSession()
  const [form, setForm] = React.useState<GigFormState>(initialFormState)
  const [localError, setLocalError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isScheduleSheetVisible, setIsScheduleSheetVisible] = React.useState(false)
  const [draftScheduledAt, setDraftScheduledAt] = React.useState<Date>(new Date())
  const dateWheelItems = React.useMemo(() => buildDateWheelItems(new Date()), [])
  const hourWheelItems = React.useMemo(() => buildTimeWheelItems(), [])
  const minuteWheelItems = React.useMemo(() => buildMinuteWheelItems(), [])
  const meridiemWheelItems = React.useMemo(() => buildMeridiemWheelItems(), [])

  const updateForm = React.useCallback(<Key extends keyof GigFormState>(key: Key, value: GigFormState[Key]) => {
    setForm((current) => ({
      ...current,
      [key]: value
    }))
  }, [])

  function applyScheduledAt(value: Date) {
    updateForm('startsAt', value.toISOString())
    updateForm('scheduleSummary', formatScheduleDateTime(value))
  }

  function handleOpenSchedulePicker() {
    setDraftScheduledAt(getSchedulePickerValue(form.startsAt))
    setIsScheduleSheetVisible(true)
  }

  function handleSaveSchedule() {
    applyScheduledAt(draftScheduledAt)
    setIsScheduleSheetVisible(false)
  }

  function handleUseFlexibleSchedule() {
    updateForm('startsAt', '')
    updateForm('scheduleSummary', 'Flexible timing')
    setIsScheduleSheetVisible(false)
  }

  function handleAndroidDateWheelChange(nextDateKey: string) {
    const [year, month, day] = nextDateKey.split('-').map((item) => Number.parseInt(item, 10))
    const nextScheduledAt = new Date(draftScheduledAt)
    nextScheduledAt.setFullYear(year, month - 1, day)
    setDraftScheduledAt(nextScheduledAt)
  }

  function handleAndroidHourWheelChange(nextHour: number) {
    const nextScheduledAt = new Date(draftScheduledAt)
    nextScheduledAt.setHours(
      toTwentyFourHour(nextHour, getMeridiemValue(draftScheduledAt)),
      draftScheduledAt.getMinutes(),
      0,
      0
    )
    setDraftScheduledAt(nextScheduledAt)
  }

  function handleAndroidMinuteWheelChange(nextMinute: number) {
    const nextScheduledAt = new Date(draftScheduledAt)
    nextScheduledAt.setMinutes(nextMinute, 0, 0)
    setDraftScheduledAt(nextScheduledAt)
  }

  function handleAndroidMeridiemWheelChange(nextMeridiem: 'AM' | 'PM') {
    const nextScheduledAt = new Date(draftScheduledAt)
    nextScheduledAt.setHours(
      toTwentyFourHour(getTwelveHourValue(draftScheduledAt), nextMeridiem),
      draftScheduledAt.getMinutes(),
      0,
      0
    )
    setDraftScheduledAt(nextScheduledAt)
  }

  async function handleSubmit(): Promise<void> {
    const validationMessage = validateGigForm(form)

    if (validationMessage != null) {
      setLocalError(validationMessage)
      return
    }

    setIsSubmitting(true)
    setLocalError(null)
    clearError()

    try {
      await submitGig(buildCreateGigPayload(form))
      setForm(initialFormState)
      onSuccess?.()
    } catch (submitError) {
      setLocalError(toErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <AppSurface mode={mode}>
        <Text selectable style={[styles.title, { color: colors.text }]}>
          {introTitle}
        </Text>
        <Text selectable style={[styles.description, { color: colors.textMuted }]}>
          {introDescription}
        </Text>
      </AppSurface>

      {localError == null
        ? null
        : (
          <AppSurface mode={mode}>
            <Text selectable style={[styles.errorText, { color: colors.danger }]}>
              {localError}
            </Text>
          </AppSurface>
          )}

      <AppSurface mode={mode}>
        <TextField
          autoCapitalize="sentences"
          label="Job title"
          mode={mode}
          onChangeText={(value) => { updateForm('title', value) }}
          placeholder="Weekend condo cleanup"
          value={form.title}
        />
        <TextField
          autoCapitalize="sentences"
          label="Description"
          mode={mode}
          multiline
          onChangeText={(value) => { updateForm('description', value) }}
          placeholder="Share the scope, what is included, and the outcome you need."
          value={form.description}
        />
        <View style={styles.fieldGroup}>
          <Text selectable style={[styles.fieldLabel, { color: colors.text }]}>
            Budget in PHP
          </Text>
          <View style={[styles.budgetInputWrap, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
            <TextInput
              keyboardType="number-pad"
              onChangeText={(value) => { updateForm('priceAmount', value.replace(/[^0-9]/g, '')) }}
              placeholder="100"
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.accent}
              style={[styles.budgetInput, { color: colors.text }]}
              value={form.priceAmount}
            />
            <Text selectable style={[styles.budgetSuffix, { color: colors.textMuted }]}>
              /day
            </Text>
          </View>
        </View>
        {Platform.OS === 'web'
          ? (
            <TextField
              autoCapitalize="sentences"
              label="Schedule summary"
              mode={mode}
              onChangeText={(value) => { updateForm('scheduleSummary', value) }}
              placeholder="Saturday, 9 AM to 1 PM"
              value={form.scheduleSummary}
            />
            )
          : (
            <>
              <View style={styles.fieldGroup}>
                <Text selectable style={[styles.fieldLabel, { color: colors.text }]}>
                  Start date and time
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleOpenSchedulePicker}
                  style={({ pressed }) => [
                    styles.scheduleTrigger,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surfaceMuted,
                      opacity: pressed ? 0.92 : 1
                    }
                  ]}
                >
                  <View style={styles.scheduleCopy}>
                    <Text selectable style={[styles.scheduleEyebrow, { color: colors.textMuted }]}>
                      Schedule
                    </Text>
                    <Text selectable style={[styles.scheduleValue, { color: form.scheduleSummary.trim() === '' ? colors.textMuted : colors.text }]}>
                      {form.scheduleSummary.trim() === '' ? 'Choose start date and time' : form.scheduleSummary}
                    </Text>
                  </View>
                </Pressable>
              </View>
            </>
            )}
      </AppSurface>

      <AppSurface mode={mode}>
        <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>
          Category
        </Text>
        <View style={styles.chipWrap}>
          {gigCategories.map((category) => (
            <OptionChip
              key={category}
              label={formatGigCategory(category)}
              mode={mode}
              onPress={() => { updateForm('category', category) }}
              selected={form.category === category}
            />
          ))}
        </View>
      </AppSurface>

      <AppSurface mode={mode}>
        <TextField
          autoCapitalize="words"
          label="City"
          mode={mode}
          onChangeText={(value) => { updateForm('city', value) }}
          placeholder="Quezon City"
          value={form.city}
        />
        <TextField
          autoCapitalize="words"
          label="Barangay"
          mode={mode}
          onChangeText={(value) => { updateForm('barangay', value) }}
          placeholder="Teachers Village East"
          value={form.barangay}
        />
        <View style={styles.splitRow}>
          <View style={styles.splitColumn}>
            <TextField
              keyboardType="decimal-pad"
              label="Latitude"
              mode={mode}
              onChangeText={(value) => { updateForm('latitude', value) }}
              placeholder="14.6488"
              value={form.latitude}
            />
          </View>
          <View style={styles.splitColumn}>
            <TextField
              keyboardType="decimal-pad"
              label="Longitude"
              mode={mode}
              onChangeText={(value) => { updateForm('longitude', value) }}
              placeholder="121.0509"
              value={form.longitude}
            />
          </View>
        </View>
        <TextField
          keyboardType="number-pad"
          label="Application radius in km"
          mode={mode}
          onChangeText={(value) => { updateForm('applicationRadiusKm', value.replace(/[^0-9]/g, '')) }}
          placeholder="25"
          value={form.applicationRadiusKm}
        />
      </AppSurface>

      <AppSurface mode={mode}>
        <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>
          Save state
        </Text>
        <View style={styles.chipWrap}>
          {(['published', 'draft'] as const).map((status) => (
            <OptionChip
              key={status}
              label={status === 'published' ? 'Publish now' : 'Save draft'}
              mode={mode}
              onPress={() => { updateForm('status', status) }}
              selected={form.status === status}
            />
          ))}
        </View>
      </AppSurface>

      <PrimaryButton loading={isSubmitting} mode={mode} onPress={() => { void handleSubmit() }}>
        {form.status === 'published' ? 'Publish job' : 'Save draft'}
      </PrimaryButton>

      {Platform.OS === 'web'
        ? null
        : (
          <Modal
            animationType="slide"
            onRequestClose={() => { setIsScheduleSheetVisible(false) }}
            transparent
            visible={isScheduleSheetVisible}
          >
            <View style={styles.sheetOverlay}>
              <Pressable
                accessibilityRole="button"
                onPress={() => { setIsScheduleSheetVisible(false) }}
                style={styles.sheetDismissArea}
              />
              <View
                style={[
                  styles.sheetCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border
                  }
                ]}
              >
                <View style={styles.sheetHandle} />
                <Text selectable style={[styles.sheetTitle, { color: colors.text }]}>
                  Pick a time
                </Text>
                <View style={styles.sheetDivider} />

                {Platform.OS === 'ios'
                  ? (
                    <View style={styles.iosPickerWrap}>
                      <DateTimePicker
                        display="spinner"
                        minuteInterval={15}
                        mode="datetime"
                        themeVariant={mode === 'dark' ? 'dark' : 'light'}
                        value={draftScheduledAt}
                        onChange={(_event, selectedDate) => {
                          if (selectedDate == null) {
                            return
                          }

                          setDraftScheduledAt(selectedDate)
                        }}
                      />
                    </View>
                    )
                  : (
                    <View style={styles.androidScheduleControls}>
                      <View style={styles.androidWheelWrap}>
                        <WheelPicker
                          data={dateWheelItems}
                          enableScrollByTapOnItem
                          itemHeight={40}
                          itemTextStyle={styles.androidWheelItemText}
                          overlayItemStyle={styles.androidWheelOverlay}
                          style={styles.androidWheelColumn}
                          value={draftScheduledAt.toISOString().slice(0, 10)}
                          visibleItemCount={5}
                          width="56%"
                          onValueChanged={({ item }) => {
                            handleAndroidDateWheelChange(item.value)
                          }}
                        />
                        <View style={styles.androidWheelDivider} />
                        <WheelPicker
                          data={hourWheelItems}
                          enableScrollByTapOnItem
                          itemHeight={40}
                          itemTextStyle={styles.androidWheelItemText}
                          overlayItemStyle={styles.androidWheelOverlay}
                          style={styles.androidWheelColumn}
                          value={getTwelveHourValue(draftScheduledAt)}
                          visibleItemCount={5}
                          width="14%"
                          onValueChanged={({ item }) => {
                            handleAndroidHourWheelChange(item.value)
                          }}
                        />
                        <View style={styles.androidWheelDivider} />
                        <WheelPicker
                          data={minuteWheelItems}
                          enableScrollByTapOnItem
                          itemHeight={40}
                          itemTextStyle={styles.androidWheelItemText}
                          overlayItemStyle={styles.androidWheelOverlay}
                          style={styles.androidWheelColumn}
                          value={draftScheduledAt.getMinutes()}
                          visibleItemCount={5}
                          width="16%"
                          onValueChanged={({ item }) => {
                            handleAndroidMinuteWheelChange(item.value)
                          }}
                        />
                        <View style={styles.androidWheelDivider} />
                        <WheelPicker
                          data={meridiemWheelItems}
                          enableScrollByTapOnItem
                          itemHeight={40}
                          itemTextStyle={styles.androidWheelItemText}
                          overlayItemStyle={styles.androidWheelOverlay}
                          style={styles.androidWheelColumn}
                          value={getMeridiemValue(draftScheduledAt)}
                          visibleItemCount={5}
                          width="14%"
                          onValueChanged={({ item }) => {
                            handleAndroidMeridiemWheelChange(item.value)
                          }}
                        />
                      </View>
                    </View>
                    )}

                <Pressable
                  accessibilityRole="button"
                  onPress={handleSaveSchedule}
                  style={({ pressed }) => [
                    styles.sheetPrimaryButton,
                    { opacity: pressed ? 0.92 : 1 }
                  ]}
                >
                  <Text selectable style={styles.sheetPrimaryButtonText}>Save</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={handleUseFlexibleSchedule}
                  style={({ pressed }) => [
                    styles.sheetSecondaryButton,
                    { opacity: pressed ? 0.92 : 1 }
                  ]}
                >
                  <Text selectable style={styles.sheetSecondaryButtonText}>No fixed start time</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
          )}
    </>
  )
}

import React from 'react'
import { Text, View } from 'react-native'
import { AppSurface } from '@/components/app-surface'
import { LabeledSwitch } from '@/components/labeled-switch'
import { OptionChip } from '@/components/option-chip'
import { PrimaryButton } from '@/components/primary-button'
import { TextField } from '@/components/text-field'
import { palette, type PaletteMode } from '@/constants/palette'
import {
  durationBuckets,
  formatDurationBucket,
  formatGigCategory,
  gigCategories,
  type CreateGigPayload
} from '@/lib/raket-types'
import { useSession } from '@/providers/session-provider'

type GigFormState = {
  title: string
  category: typeof gigCategories[number]
  description: string
  priceAmount: string
  durationBucket: typeof durationBuckets[number]
  city: string
  barangay: string
  latitude: string
  longitude: string
  applicationRadiusKm: string
  scheduleSummary: string
  status: 'draft' | 'published'
  supervisorPresent: boolean
  ppeProvided: boolean
  helperOnlyConfirmation: boolean
  physicalLoad: string
  startsAt: string
  endsAt: string
}

type PostJobComposerProps = {
  introDescription?: string
  introTitle?: string
  mode?: PaletteMode
  onSuccess?: () => void
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
  supervisorPresent: false,
  ppeProvided: false,
  helperOnlyConfirmation: false,
  physicalLoad: '',
  startsAt: '',
  endsAt: ''
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
    return 'Schedule summary must be at least 4 characters.'
  }

  if (form.category === 'construction_helper') {
    if (!form.supervisorPresent || !form.ppeProvided || !form.helperOnlyConfirmation) {
      return 'Construction jobs require supervisor, PPE, and helper-only confirmation.'
    }

    if (normalizeOptionalString(form.physicalLoad) == null) {
      return 'Physical load is required for construction jobs.'
    }

    if (normalizeOptionalString(form.startsAt) == null || normalizeOptionalString(form.endsAt) == null) {
      return 'Start and end times are required for construction jobs.'
    }

    const startsAt = new Date(form.startsAt)
    const endsAt = new Date(form.endsAt)

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      return 'Construction start and end times must be valid ISO date-time values.'
    }

    if (endsAt.getTime() <= startsAt.getTime()) {
      return 'Construction jobs must end after the start time.'
    }
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
    ...(form.category === 'construction_helper'
      ? {
          supervisorPresent: form.supervisorPresent,
          ppeProvided: form.ppeProvided,
          helperOnlyConfirmation: form.helperOnlyConfirmation,
          physicalLoad: normalizeOptionalString(form.physicalLoad),
          startsAt: normalizeOptionalString(form.startsAt),
          endsAt: normalizeOptionalString(form.endsAt)
        }
      : {})
  }
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message
  }

  return 'Unable to post the job right now.'
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

  const isConstructionGig = form.category === 'construction_helper'

  const updateForm = React.useCallback(<Key extends keyof GigFormState>(key: Key, value: GigFormState[Key]) => {
    setForm((current) => ({
      ...current,
      [key]: value
    }))
  }, [])

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
        <Text
          selectable
          style={{
            color: colors.text,
            fontSize: 24,
            fontWeight: '800',
            lineHeight: 30
          }}
        >
          {introTitle}
        </Text>
        <Text
          selectable
          style={{
            color: colors.textMuted,
            fontSize: 15,
            lineHeight: 22
          }}
        >
          {introDescription}
        </Text>
      </AppSurface>

      {localError == null
        ? null
        : (
          <AppSurface mode={mode}>
            <Text
              selectable
              style={{
                color: colors.danger,
                fontSize: 15,
                fontWeight: '700'
              }}
            >
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
        <TextField
          keyboardType="number-pad"
          label="Budget in PHP"
          mode={mode}
          onChangeText={(value) => { updateForm('priceAmount', value.replace(/[^0-9]/g, '')) }}
          placeholder="1500"
          value={form.priceAmount}
        />
        <TextField
          autoCapitalize="sentences"
          label="Schedule summary"
          mode={mode}
          onChangeText={(value) => { updateForm('scheduleSummary', value) }}
          placeholder="Saturday, 9 AM to 1 PM"
          value={form.scheduleSummary}
        />
      </AppSurface>

      <AppSurface mode={mode}>
        <Text
          selectable
          style={{
            color: colors.text,
            fontSize: 15,
            fontWeight: '700'
          }}
        >
          Category
        </Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10
          }}
        >
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
        <Text
          selectable
          style={{
            color: colors.text,
            fontSize: 15,
            fontWeight: '700'
          }}
        >
          Duration
        </Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10
          }}
        >
          {durationBuckets.map((durationBucket) => (
            <OptionChip
              key={durationBucket}
              label={formatDurationBucket(durationBucket)}
              mode={mode}
              onPress={() => { updateForm('durationBucket', durationBucket) }}
              selected={form.durationBucket === durationBucket}
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
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <TextField
              keyboardType="decimal-pad"
              label="Latitude"
              mode={mode}
              onChangeText={(value) => { updateForm('latitude', value) }}
              placeholder="14.6488"
              value={form.latitude}
            />
          </View>
          <View style={{ flex: 1 }}>
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

      {isConstructionGig
        ? (
          <AppSurface mode={mode}>
            <Text
              selectable
              style={{
                color: colors.text,
                fontSize: 15,
                fontWeight: '700'
              }}
            >
              Construction details
            </Text>
            <LabeledSwitch
              description="A qualified supervisor is available on site."
              label="Supervisor present"
              mode={mode}
              onValueChange={(value) => { updateForm('supervisorPresent', value) }}
              value={form.supervisorPresent}
            />
            <LabeledSwitch
              description="Protective gear is ready for the worker."
              label="PPE provided"
              mode={mode}
              onValueChange={(value) => { updateForm('ppeProvided', value) }}
              value={form.ppeProvided}
            />
            <LabeledSwitch
              description="The role stays within helper-level tasks."
              label="Helper-only confirmation"
              mode={mode}
              onValueChange={(value) => { updateForm('helperOnlyConfirmation', value) }}
              value={form.helperOnlyConfirmation}
            />
            <TextField
              autoCapitalize="sentences"
              label="Physical load"
              mode={mode}
              onChangeText={(value) => { updateForm('physicalLoad', value) }}
              placeholder="Carrying 20 kg bags up one flight"
              value={form.physicalLoad}
            />
            <TextField
              autoCapitalize="none"
              label="Starts at"
              mode={mode}
              onChangeText={(value) => { updateForm('startsAt', value) }}
              placeholder="2026-04-20T09:00:00+08:00"
              value={form.startsAt}
            />
            <TextField
              autoCapitalize="none"
              label="Ends at"
              mode={mode}
              onChangeText={(value) => { updateForm('endsAt', value) }}
              placeholder="2026-04-20T17:00:00+08:00"
              value={form.endsAt}
            />
          </AppSurface>
          )
        : null}

      <AppSurface mode={mode}>
        <Text
          selectable
          style={{
            color: colors.text,
            fontSize: 15,
            fontWeight: '700'
          }}
        >
          Save state
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
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
    </>
  )
}

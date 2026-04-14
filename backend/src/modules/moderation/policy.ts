const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
const URL_PATTERN = /\b(?:https?:\/\/|www\.)\S+\b/i
const PHONE_PATTERN = /(?:\+?\d[\s().-]*){8,}/

export type ContactDetailViolation = 'email address' | 'external link' | 'phone number'

export interface ModerationField {
  label: string
  value: string | null | undefined
}

export interface ModerationViolation {
  field: string
  reason: ContactDetailViolation
}

export function normalizeUserText (value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function findContactDetailViolation (value: string): ContactDetailViolation | null {
  if (EMAIL_PATTERN.test(value)) {
    return 'email address'
  }

  if (URL_PATTERN.test(value)) {
    return 'external link'
  }

  if (PHONE_PATTERN.test(value)) {
    return 'phone number'
  }

  return null
}

export function findContactDetailViolationInFields (
  fields: ModerationField[]
): ModerationViolation | null {
  for (const field of fields) {
    if (field.value == null) {
      continue
    }

    const reason = findContactDetailViolation(field.value)

    if (reason != null) {
      return {
        field: field.label,
        reason
      }
    }
  }

  return null
}

export function formatModerationViolation (violation: ModerationViolation): string {
  return `${violation.field} cannot include a ${violation.reason}`
}

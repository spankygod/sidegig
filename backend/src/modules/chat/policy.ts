const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
const URL_PATTERN = /\b(?:https?:\/\/|www\.)\S+\b/i
const PHONE_PATTERN = /(?:\+?\d[\s().-]*){8,}/

export function findContactDetailViolation (value: string): string | null {
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

export function normalizeChatBody (value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

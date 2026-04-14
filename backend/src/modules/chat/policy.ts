import { findContactDetailViolation, normalizeUserText } from '../moderation/policy'

export { findContactDetailViolation }

export function normalizeChatBody (value: string): string {
  return normalizeUserText(value)
}

import type { User } from '@supabase/supabase-js'

export interface AuthenticatedUser {
  id: string
  email: string | null
  phone: string | null
  isAnonymous: boolean
  appMetadata: Record<string, unknown>
  userMetadata: Record<string, unknown>
}

export function toAuthenticatedUser (user: User): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
    isAnonymous: user.is_anonymous ?? false,
    appMetadata: user.app_metadata ?? {},
    userMetadata: user.user_metadata ?? {}
  }
}

export function toAuthenticatedUserFromClaims (claims: Record<string, unknown>): AuthenticatedUser | null {
  const id = typeof claims.sub === 'string' && claims.sub.trim() !== '' ? claims.sub : null

  if (id == null) {
    return null
  }

  return {
    id,
    email: typeof claims.email === 'string' ? claims.email : null,
    phone: typeof claims.phone === 'string' ? claims.phone : null,
    isAnonymous: claims.is_anonymous === true,
    appMetadata: isRecord(claims.app_metadata) ? claims.app_metadata : {},
    userMetadata: isRecord(claims.user_metadata) ? claims.user_metadata : {}
  }
}

function isRecord (value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null && !Array.isArray(value)
}

export function deriveDisplayName (user: Pick<AuthenticatedUser, 'email' | 'phone' | 'userMetadata'>): string {
  const metadataDisplayName = user.userMetadata.display_name
  const metadataFullName = user.userMetadata.full_name

  if (typeof metadataDisplayName === 'string' && metadataDisplayName.trim() !== '') {
    return metadataDisplayName.trim()
  }

  if (typeof metadataFullName === 'string' && metadataFullName.trim() !== '') {
    return metadataFullName.trim()
  }

  if (user.email != null && user.email.includes('@')) {
    return user.email.split('@')[0]
  }

  if (user.phone != null && user.phone.trim() !== '') {
    const lastDigits = user.phone.slice(-4)
    return `Raket User ${lastDigits}`
  }

  return 'Raket User'
}

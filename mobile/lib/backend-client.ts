import type { BackendAuthUser, CreateGigPayload, OwnedGig, UserProfile } from '@/lib/raket-types'
import { mobileEnv } from '@/lib/mobile-env'

export class BackendError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'BackendError'
    this.status = status
  }
}

type BackendRequestOptions = {
  accessToken: string
  method?: 'GET' | 'POST' | 'PATCH'
  body?: unknown
}

type BackendErrorBody = {
  message?: string
}

function buildUrl(pathname: string): string {
  const normalizedBaseUrl = mobileEnv.apiUrl.endsWith('/')
    ? mobileEnv.apiUrl
    : `${mobileEnv.apiUrl}/`

  return new URL(pathname.replace(/^\//, ''), normalizedBaseUrl).toString()
}

async function backendRequest<T> (
  pathname: string,
  options: BackendRequestOptions
): Promise<T> {
  const response = await fetch(buildUrl(pathname), {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${options.accessToken}`,
      ...(options.body == null ? {} : { 'Content-Type': 'application/json' })
    },
    body: options.body == null ? undefined : JSON.stringify(options.body)
  })

  const text = await response.text()
  let parsed: T | BackendErrorBody | string | null = null

  if (text !== '') {
    try {
      parsed = JSON.parse(text) as T | BackendErrorBody
    } catch {
      parsed = text
    }
  }

  if (!response.ok) {
    const message = typeof parsed === 'object' && parsed != null && 'message' in parsed && typeof parsed.message === 'string'
      ? parsed.message
      : typeof parsed === 'string' && parsed.trim() !== ''
        ? parsed
      : `Request failed with status ${response.status}`

    throw new BackendError(message, response.status)
  }

  if (parsed == null || typeof parsed === 'string') {
    throw new BackendError('Unexpected response from server.', response.status)
  }

  return parsed as T
}

export async function fetchAuthUser(accessToken: string): Promise<BackendAuthUser> {
  const response = await backendRequest<{ user: BackendAuthUser }>('/v1/auth/me', {
    accessToken
  })

  return response.user
}

export async function fetchMyProfile(accessToken: string): Promise<UserProfile> {
  const response = await backendRequest<{ profile: UserProfile }>('/v1/users/me', {
    accessToken
  })

  return response.profile
}

export async function fetchMyGigs(accessToken: string): Promise<OwnedGig[]> {
  const response = await backendRequest<{ gigs: OwnedGig[] }>('/v1/gigs/mine', {
    accessToken
  })

  return response.gigs
}

export async function createGig(accessToken: string, payload: CreateGigPayload): Promise<OwnedGig> {
  const response = await backendRequest<{ gig: OwnedGig }>('/v1/gigs', {
    accessToken,
    method: 'POST',
    body: payload
  })

  return response.gig
}

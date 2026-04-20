import type {
  BackendAuthUser,
  CreateGigApplicationPayload,
  CreateGigPayload,
  GigApplicationSummary,
  OwnedGig,
  PublicGig,
  PublicGigFeedResult,
  UserProfile
} from '@/lib/raket-types'
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
  accessToken?: string
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

function buildUrlWithQuery(pathname: string, query?: Record<string, string | number | undefined>): string {
  const url = new URL(buildUrl(pathname))

  if (query == null) {
    return url.toString()
  }

  for (const [key, value] of Object.entries(query)) {
    if (value == null) {
      continue
    }

    const normalizedValue = typeof value === 'number' ? String(value) : value.trim()

    if (normalizedValue !== '') {
      url.searchParams.set(key, normalizedValue)
    }
  }

  return url.toString()
}

async function backendRequest<T> (
  pathname: string,
  options: BackendRequestOptions
): Promise<T> {
  const response = await fetch(buildUrl(pathname), {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(options.accessToken == null ? {} : { Authorization: `Bearer ${options.accessToken}` }),
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

export async function fetchPublicGigs(
  accessToken?: string,
  filters?: {
    category?: PublicGig['category']
    city?: string
    q?: string
    latitude?: number
    longitude?: number
    radiusKm?: number
    offset?: number
    limit?: number
  }
): Promise<PublicGigFeedResult> {
  const response = await backendRequest<PublicGigFeedResult>(
    buildUrlWithQuery('/v1/gigs', {
      category: filters?.category,
      city: filters?.city,
      q: filters?.q,
      latitude: filters?.latitude,
      longitude: filters?.longitude,
      radiusKm: filters?.radiusKm,
      offset: filters?.offset,
      limit: filters?.limit
    }),
    {
      accessToken
    }
  )

  return response
}

export async function fetchPublicGigById(accessToken: string | undefined, gigId: string): Promise<PublicGig> {
  const response = await backendRequest<{ gig: PublicGig }>(`/v1/gigs/${gigId}`, {
    accessToken
  })

  return response.gig
}

export async function createGigApplication(
  accessToken: string,
  payload: CreateGigApplicationPayload
): Promise<GigApplicationSummary> {
  const response = await backendRequest<{ application: GigApplicationSummary }>('/v1/applications', {
    accessToken,
    method: 'POST',
    body: payload
  })

  return response.application
}

export async function fetchMyApplications(accessToken: string): Promise<GigApplicationSummary[]> {
  const response = await backendRequest<{ applications: GigApplicationSummary[] }>('/v1/applications', {
    accessToken
  })

  return response.applications
}

export async function createGig(accessToken: string, payload: CreateGigPayload): Promise<OwnedGig> {
  const response = await backendRequest<{ gig: OwnedGig }>('/v1/gigs', {
    accessToken,
    method: 'POST',
    body: payload
  })

  return response.gig
}

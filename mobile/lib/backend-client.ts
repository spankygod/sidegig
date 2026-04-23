import type {
  BackendAuthUser,
  CreateGigApplicationPayload,
  CreateGigPayload,
  GigApplicationSummary,
  OwnedGig,
  PublicGig,
  PublicGigFeedResult,
  UpdateProfilePayload,
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
  timeoutMs?: number
}

type BackendErrorBody = {
  message?: string
}

type PendingRequestEntry<T> = {
  promise: Promise<T>
}

type CachedResponseEntry<T> = {
  expiresAt: number
  value: T
}

const publicGigsRequestDedupWindowMs = 1500
const pendingPublicGigsRequests = new Map<string, PendingRequestEntry<PublicGigFeedResult>>()
const cachedPublicGigsResponses = new Map<string, CachedResponseEntry<PublicGigFeedResult>>()

function normalizeQueryValue(value: string | number): string {
  if (typeof value === 'number') {
    return String(value)
  }

  return value.trim()
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

    const normalizedValue = normalizeQueryValue(value)

    if (normalizedValue !== '') {
      url.searchParams.set(key, normalizedValue)
    }
  }

  return url.toString()
}

function buildRequestHeaders(options: BackendRequestOptions): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/json'
  }

  if (options.accessToken != null) {
    headers.Authorization = `Bearer ${options.accessToken}`
  }

  if (options.body != null) {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}

function buildRequestBody(body: unknown): string | undefined {
  if (body == null) {
    return undefined
  }

  return JSON.stringify(body)
}

function getBackendErrorMessage(
  parsed: unknown,
  status: number
): string {
  if (typeof parsed === 'object' && parsed != null && 'message' in parsed && typeof parsed.message === 'string') {
    return parsed.message
  }

  if (typeof parsed === 'string' && parsed.trim() !== '') {
    return parsed
  }

  return `Request failed with status ${status}`
}

async function backendRequest<T> (
  pathname: string,
  options: BackendRequestOptions
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, options.timeoutMs ?? 10000)

  let response: Response

  try {
    response = await fetch(buildUrl(pathname), {
      method: options.method ?? 'GET',
      headers: buildRequestHeaders(options),
      body: buildRequestBody(options.body),
      signal: controller.signal
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new BackendError('Request timed out. Check that the API is reachable from this device.', 408)
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }

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
    const message = getBackendErrorMessage(parsed, response.status)

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

export async function provisionMyProfile(accessToken: string): Promise<UserProfile> {
  const response = await backendRequest<{ profile: UserProfile }>('/v1/users/me/provision', {
    accessToken,
    method: 'POST'
  })

  return response.profile
}

export async function updateMyProfile(accessToken: string, payload: UpdateProfilePayload): Promise<UserProfile> {
  const response = await backendRequest<{ profile: UserProfile }>('/v1/users/me', {
    accessToken,
    method: 'PATCH',
    body: payload
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
  },
  options?: {
    bypassCache?: boolean
  }
): Promise<PublicGigFeedResult> {
  const requestPath = buildUrlWithQuery('/v1/gigs', {
    category: filters?.category,
    city: filters?.city,
    q: filters?.q,
    latitude: filters?.latitude,
    longitude: filters?.longitude,
    radiusKm: filters?.radiusKm,
    offset: filters?.offset,
    limit: filters?.limit
  })
  const requestKey = `${accessToken ?? 'anonymous'}::${requestPath}`
  const shouldBypassCache = options?.bypassCache === true
  let cachedResponse: CachedResponseEntry<PublicGigFeedResult> | undefined

  if (!shouldBypassCache) {
    cachedResponse = cachedPublicGigsResponses.get(requestKey)
  }

  if (cachedResponse != null && cachedResponse.expiresAt > Date.now()) {
    return cachedResponse.value
  }

  let pendingRequest: PendingRequestEntry<PublicGigFeedResult> | undefined

  if (!shouldBypassCache) {
    pendingRequest = pendingPublicGigsRequests.get(requestKey)
  }

  if (pendingRequest != null) {
    return pendingRequest.promise
  }

  const requestPromise = backendRequest<PublicGigFeedResult>(requestPath, {
    accessToken
  }).then((response) => {
    cachedPublicGigsResponses.set(requestKey, {
      expiresAt: Date.now() + publicGigsRequestDedupWindowMs,
      value: response
    })

    return response
  }).finally(() => {
    pendingPublicGigsRequests.delete(requestKey)
  })

  pendingPublicGigsRequests.set(requestKey, {
    promise: requestPromise
  })

  return requestPromise
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

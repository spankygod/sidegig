export type GigCategory =
  | 'errands_personal_assistance'
  | 'cleaning_home_help'
  | 'moving_help'
  | 'construction_helper'
  | 'tutoring_academic_support'
  | 'graphic_design_creative'
  | 'photo_video_support'
  | 'virtual_assistance_admin'
  | 'event_staffing';

export type DurationBucket =
  | 'same_day'
  | 'two_to_seven_days'
  | 'eight_to_fourteen_days'
  | 'fifteen_to_thirty_days';

export type GigStatus =
  | 'draft'
  | 'published'
  | 'funded'
  | 'in_progress'
  | 'completed'
  | 'disputed'
  | 'cancelled'
  | 'closed';

export type ApplicationStatus =
  | 'submitted'
  | 'rejected'
  | 'withdrawn'
  | 'hired'
  | 'closed';

export type HireStatus =
  | 'pending_funding'
  | 'funded'
  | 'accepted'
  | 'in_progress'
  | 'worker_marked_done'
  | 'poster_accepted'
  | 'disputed'
  | 'refunded'
  | 'payout_ready'
  | 'paid_out';

export interface PublicGig {
  id: string;
  title: string;
  category: GigCategory;
  description: string;
  priceAmount: number;
  currency: 'PHP';
  durationBucket: DurationBucket;
  status: GigStatus;
  applicationRadiusKm: number;
  distanceKm: number | null;
  scheduleSummary: string;
  startsAt: string | null;
  endsAt: string | null;
  location: {
    city: string;
    barangay: string;
    exactPinVisible: boolean;
  };
  poster: {
    id: string;
    displayName: string;
    rating: number;
    reviewCount: number;
    jobsCompleted: number;
    responseRate: number;
  };
  construction: {
    supervisorPresent: boolean;
    ppeProvided: boolean;
    helperOnlyConfirmation: boolean;
    physicalLoad: string | null;
  } | null;
  createdAt: string;
}

export interface OwnedGig {
  id: string;
  title: string;
  category: GigCategory;
  description: string;
  priceAmount: number;
  currency: 'PHP';
  durationBucket: DurationBucket;
  status: GigStatus;
  applicationRadiusKm: number;
  distanceKm: null;
  scheduleSummary: string;
  startsAt: string | null;
  endsAt: string | null;
  location: {
    city: string;
    barangay: string;
    latitude: number;
    longitude: number;
    exactPinVisible: true;
  };
  construction: {
    supervisorPresent: boolean;
    ppeProvided: boolean;
    helperOnlyConfirmation: boolean;
    physicalLoad: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  applicationCount: number;
}

export interface PosterGigApplicationSummary {
  id: string;
  status: ApplicationStatus;
  intro: string;
  availability: string;
  createdAt: string;
  updatedAt: string;
  worker: {
    id: string;
    displayName: string;
    city: string | null;
    barangay: string | null;
    bio: string | null;
    skills: string[];
    stats: {
      rating: number;
      reviewCount: number;
      jobsCompleted: number;
      responseRate: number;
    };
  };
}

export interface HireSummary {
  id: string;
  gigId: string;
  applicationId: string;
  posterId: string;
  workerId: string;
  status: HireStatus;
  fundedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HealthResponse {
  service: string;
  environment: string;
  status: 'ok' | 'degraded';
  timestamp: string;
  dependencies: {
    postgres: {
      status: 'up' | 'down';
      latencyMs: number;
      details?: string;
    };
  };
}

export interface AuthUserResponse {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    isAnonymous: boolean;
    appMetadata: Record<string, unknown>;
    userMetadata: Record<string, unknown>;
  } | null;
}

export interface ProfileResponse {
  profile: {
    id: string;
    displayName: string;
    city: string | null;
    barangay: string | null;
    latitude: number | null;
    longitude: number | null;
    serviceRadiusKm: number;
    bio: string | null;
    skills: string[];
    stats: {
      rating: number;
      reviewCount: number;
      jobsCompleted: number;
      responseRate: number;
    };
  };
}

export const gigCategoryLabels: Record<GigCategory, string> = {
  errands_personal_assistance: 'Errands',
  cleaning_home_help: 'Cleaning',
  moving_help: 'Moving',
  construction_helper: 'Construction',
  tutoring_academic_support: 'Tutoring',
  graphic_design_creative: 'Creative',
  photo_video_support: 'Photo & Video',
  virtual_assistance_admin: 'Virtual Assist',
  event_staffing: 'Events',
};

export const durationBucketLabels: Record<DurationBucket, string> = {
  same_day: 'Same day',
  two_to_seven_days: '2 to 7 days',
  eight_to_fourteen_days: '8 to 14 days',
  fifteen_to_thirty_days: '15 to 30 days',
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function buildUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, string | number | undefined>
): string {
  const normalizedBaseUrl = baseUrl.trim().replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const queryEntries = Object.entries(query ?? {}).filter(([, value]) => value != null && value !== '');

  if (queryEntries.length === 0) {
    return `${normalizedBaseUrl}${normalizedPath}`;
  }

  const queryString = queryEntries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return `${normalizedBaseUrl}${normalizedPath}?${queryString}`;
}

async function request<T>(
  baseUrl: string,
  path: string,
  options?: {
    body?: unknown;
    method?: string;
    token?: string;
    query?: Record<string, string | number | undefined>;
  }
): Promise<T> {
  const hasBody = options?.body != null;

  const response = await fetch(buildUrl(baseUrl, path, options?.query), {
    method: options?.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(options?.token != null && options.token !== ''
        ? { Authorization: `Bearer ${options.token}` }
        : {}),
    },
    ...(hasBody ? { body: JSON.stringify(options?.body) } : {}),
  });

  const payloadText = await response.text();
  const payload = payloadText === '' ? null : JSON.parse(payloadText);

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload != null &&
      'message' in payload &&
      typeof payload.message === 'string'
        ? payload.message
        : `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export async function fetchHealth(baseUrl: string): Promise<HealthResponse> {
  return await request<HealthResponse>(baseUrl, '/health');
}

export async function fetchPublicGigs(
  baseUrl: string,
  filters?: {
    category?: GigCategory;
    city?: string;
    limit?: number;
  }
): Promise<PublicGig[]> {
  const response = await request<{ gigs: PublicGig[] }>(baseUrl, '/v1/gigs', {
    query: {
      category: filters?.category,
      city: filters?.city?.trim(),
      limit: filters?.limit,
    },
  });

  return response.gigs;
}

export async function fetchMyGigs(
  baseUrl: string,
  token: string,
  filters?: {
    limit?: number;
    status?: GigStatus;
  }
): Promise<OwnedGig[]> {
  const response = await request<{ gigs: OwnedGig[] }>(baseUrl, '/v1/gigs/mine', {
    token,
    query: {
      limit: filters?.limit,
      status: filters?.status,
    },
  });

  return response.gigs;
}

export async function fetchGigApplicationsForPoster(
  baseUrl: string,
  token: string,
  gigId: string
): Promise<{ gig: OwnedGig; applications: PosterGigApplicationSummary[] }> {
  return await request<{ gig: OwnedGig; applications: PosterGigApplicationSummary[] }>(
    baseUrl,
    `/v1/gigs/mine/${gigId}/applications`,
    {
      token,
    }
  );
}

export async function reviewGigApplication(
  baseUrl: string,
  token: string,
  gigId: string,
  applicationId: string,
  status: Extract<ApplicationStatus, 'submitted' | 'rejected'>
): Promise<PosterGigApplicationSummary> {
  const response = await request<{ application: PosterGigApplicationSummary }>(
    baseUrl,
    `/v1/gigs/mine/${gigId}/applications/${applicationId}`,
    {
      method: 'PATCH',
      token,
      body: { status },
    }
  );

  return response.application;
}

export async function fundGigHire(
  baseUrl: string,
  token: string,
  gigId: string,
  applicationId: string
): Promise<{ hire: HireSummary; gig: OwnedGig | null; applications: PosterGigApplicationSummary[] }> {
  return await request<{ hire: HireSummary; gig: OwnedGig | null; applications: PosterGigApplicationSummary[] }>(
    baseUrl,
    `/v1/gigs/mine/${gigId}/fund`,
    {
      method: 'POST',
      token,
      body: { applicationId },
    }
  );
}

export async function fetchAuthUser(baseUrl: string, token: string): Promise<AuthUserResponse['user']> {
  const response = await request<AuthUserResponse>(baseUrl, '/v1/auth/me', {
    token,
  });

  return response.user;
}

export async function fetchMyProfile(baseUrl: string, token: string): Promise<ProfileResponse['profile']> {
  const response = await request<ProfileResponse>(baseUrl, '/v1/users/me', {
    token,
  });

  return response.profile;
}

export function formatCurrency(amount: number, currency: string = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

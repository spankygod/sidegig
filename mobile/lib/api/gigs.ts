import { request } from './client';
import type {
  ApplicationStatus,
  GigCategory,
  GigStatus,
  HireSummary,
  MockPaymongoCheckout,
  OwnedGig,
  PaymentSummary,
  PosterGigApplicationSummary,
  PublicGig,
} from './types';

export async function fetchPublicGigs(
  baseUrl: string,
  filters?: {
    category?: GigCategory;
    city?: string;
    latitude?: number;
    limit?: number;
    longitude?: number;
    radiusKm?: number;
  }
): Promise<PublicGig[]> {
  const response = await request<{ gigs: PublicGig[] }>(baseUrl, '/v1/gigs', {
    query: {
      category: filters?.category,
      city: filters?.city?.trim(),
      latitude: filters?.latitude,
      limit: filters?.limit,
      longitude: filters?.longitude,
      radiusKm: filters?.radiusKm,
    },
  });

  return response.gigs;
}

export async function fetchPublicGig(
  baseUrl: string,
  gigId: string,
  filters?: {
    latitude?: number;
    longitude?: number;
  }
): Promise<PublicGig> {
  const response = await request<{ gig: PublicGig }>(baseUrl, `/v1/gigs/${gigId}`, {
    query: {
      latitude: filters?.latitude,
      longitude: filters?.longitude,
    },
  });

  return response.gig;
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
): Promise<{
  applications: PosterGigApplicationSummary[];
  checkout: MockPaymongoCheckout;
  gig: OwnedGig | null;
  hire: HireSummary;
  payment: PaymentSummary;
}> {
  return await request<{
    applications: PosterGigApplicationSummary[];
    checkout: MockPaymongoCheckout;
    gig: OwnedGig | null;
    hire: HireSummary;
    payment: PaymentSummary;
  }>(baseUrl, `/v1/gigs/mine/${gigId}/fund`, {
    method: 'POST',
    token,
    body: { applicationId },
  });
}

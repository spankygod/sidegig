import { request } from './client';
import type { ProfileResponse, PublicUserProfile, ReviewSummary, UpdateUserProfileInput } from './types';

export async function fetchMyProfile(baseUrl: string, token: string): Promise<ProfileResponse['profile']> {
  const response = await request<ProfileResponse>(baseUrl, '/v1/users/me', {
    token,
  });

  return response.profile;
}

export async function updateMyProfile(
  baseUrl: string,
  token: string,
  input: UpdateUserProfileInput
): Promise<ProfileResponse['profile']> {
  const response = await request<ProfileResponse>(baseUrl, '/v1/users/me', {
    method: 'PATCH',
    token,
    body: input,
  });

  return response.profile;
}

export async function fetchPublicUserProfile(
  baseUrl: string,
  token: string,
  userId: string
): Promise<PublicUserProfile> {
  const response = await request<{ profile: PublicUserProfile }>(baseUrl, `/v1/users/${userId}`, {
    token,
  });

  return response.profile;
}

export async function fetchUserReviews(
  baseUrl: string,
  token: string,
  userId: string,
  filters?: {
    limit?: number;
  }
): Promise<ReviewSummary[]> {
  const response = await request<{ reviews: ReviewSummary[] }>(baseUrl, `/v1/users/${userId}/reviews`, {
    token,
    query: {
      limit: filters?.limit,
    },
  });

  return response.reviews;
}

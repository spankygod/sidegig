import { request } from './client';
import type { GigApplicationSummary } from './types';

export async function fetchMyApplications(
  baseUrl: string,
  token: string
): Promise<GigApplicationSummary[]> {
  const response = await request<{ applications: GigApplicationSummary[] }>(baseUrl, '/v1/applications', {
    token,
  });

  return response.applications;
}

export async function fetchMyApplication(
  baseUrl: string,
  token: string,
  applicationId: string
): Promise<GigApplicationSummary> {
  const response = await request<{ application: GigApplicationSummary }>(
    baseUrl,
    `/v1/applications/${applicationId}`,
    {
      token,
    }
  );

  return response.application;
}

export async function createGigApplication(
  baseUrl: string,
  token: string,
  input: {
    availability: string;
    gigId: string;
    intro: string;
  }
): Promise<GigApplicationSummary> {
  const response = await request<{ application: GigApplicationSummary }>(baseUrl, '/v1/applications', {
    method: 'POST',
    token,
    body: input,
  });

  return response.application;
}

export async function withdrawGigApplication(
  baseUrl: string,
  token: string,
  applicationId: string
): Promise<GigApplicationSummary> {
  const response = await request<{ application: GigApplicationSummary }>(
    baseUrl,
    `/v1/applications/${applicationId}/withdraw`,
    {
      method: 'POST',
      token,
    }
  );

  return response.application;
}

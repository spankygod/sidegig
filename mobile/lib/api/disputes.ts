import { request } from './client';
import type { DisputeStatus, DisputeSummary } from './types';

export async function fetchDisputes(
  baseUrl: string,
  token: string,
  filters?: {
    status?: DisputeStatus;
  }
): Promise<DisputeSummary[]> {
  const response = await request<{ disputes: DisputeSummary[] }>(baseUrl, '/v1/disputes', {
    token,
    query: {
      status: filters?.status,
    },
  });

  return response.disputes;
}

export async function fetchDispute(
  baseUrl: string,
  token: string,
  disputeId: string
): Promise<DisputeSummary> {
  const response = await request<{ dispute: DisputeSummary }>(baseUrl, `/v1/disputes/${disputeId}`, {
    token,
  });

  return response.dispute;
}

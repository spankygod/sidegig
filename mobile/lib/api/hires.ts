import { request } from './client';
import type {
  DisputeSummary,
  HireMilestoneStatus,
  HireMilestoneSummary,
  HireStatus,
  HireSummary,
  HireWorkDetail,
  ReviewSummary,
} from './types';

export async function fetchHires(
  baseUrl: string,
  token: string,
  filters?: {
    status?: HireStatus;
  }
): Promise<HireSummary[]> {
  const response = await request<{ hires: HireSummary[] }>(baseUrl, '/v1/hires', {
    token,
    query: {
      status: filters?.status,
    },
  });

  return response.hires;
}

export async function fetchHire(
  baseUrl: string,
  token: string,
  hireId: string
): Promise<HireSummary> {
  const response = await request<{ hire: HireSummary }>(baseUrl, `/v1/hires/${hireId}`, {
    token,
  });

  return response.hire;
}

export async function fetchHireWorkDetail(
  baseUrl: string,
  token: string,
  hireId: string
): Promise<HireWorkDetail> {
  const response = await request<{ workDetail: HireWorkDetail }>(baseUrl, `/v1/hires/${hireId}/work-detail`, {
    token,
  });

  return response.workDetail;
}

async function postHireAction(
  baseUrl: string,
  token: string,
  hireId: string,
  action: 'accept' | 'start' | 'mark-done' | 'accept-completion'
): Promise<HireSummary> {
  const response = await request<{ hire: HireSummary }>(baseUrl, `/v1/hires/${hireId}/${action}`, {
    method: 'POST',
    token,
  });

  return response.hire;
}

export async function acceptHire(baseUrl: string, token: string, hireId: string): Promise<HireSummary> {
  return await postHireAction(baseUrl, token, hireId, 'accept');
}

export async function startHire(baseUrl: string, token: string, hireId: string): Promise<HireSummary> {
  return await postHireAction(baseUrl, token, hireId, 'start');
}

export async function markHireDone(baseUrl: string, token: string, hireId: string): Promise<HireSummary> {
  return await postHireAction(baseUrl, token, hireId, 'mark-done');
}

export async function acceptHireCompletion(baseUrl: string, token: string, hireId: string): Promise<HireSummary> {
  return await postHireAction(baseUrl, token, hireId, 'accept-completion');
}

export async function disputeHire(
  baseUrl: string,
  token: string,
  hireId: string,
  input: {
    details?: string | null;
    reason: string;
  }
): Promise<{ dispute: DisputeSummary; hire: HireSummary }> {
  return await request<{ dispute: DisputeSummary; hire: HireSummary }>(baseUrl, `/v1/hires/${hireId}/dispute`, {
    method: 'POST',
    token,
    body: input,
  });
}

export async function createHireReview(
  baseUrl: string,
  token: string,
  hireId: string,
  input: {
    comment?: string | null;
    rating: number;
  }
): Promise<ReviewSummary> {
  const response = await request<{ review: ReviewSummary }>(baseUrl, `/v1/hires/${hireId}/review`, {
    method: 'POST',
    token,
    body: input,
  });

  return response.review;
}

export async function fetchHireMilestones(
  baseUrl: string,
  token: string,
  hireId: string
): Promise<HireMilestoneSummary[]> {
  const response = await request<{ milestones: HireMilestoneSummary[] }>(
    baseUrl,
    `/v1/hires/${hireId}/milestones`,
    {
      token,
    }
  );

  return response.milestones;
}

export async function createHireMilestone(
  baseUrl: string,
  token: string,
  hireId: string,
  input: {
    description?: string | null;
    dueAt?: string | null;
    title: string;
  }
): Promise<HireMilestoneSummary> {
  const response = await request<{ milestone: HireMilestoneSummary }>(baseUrl, `/v1/hires/${hireId}/milestones`, {
    method: 'POST',
    token,
    body: input,
  });

  return response.milestone;
}

export async function updateHireMilestoneStatus(
  baseUrl: string,
  token: string,
  hireId: string,
  milestoneId: string,
  status: HireMilestoneStatus
): Promise<HireMilestoneSummary> {
  const response = await request<{ milestone: HireMilestoneSummary }>(
    baseUrl,
    `/v1/hires/${hireId}/milestones/${milestoneId}/status`,
    {
      method: 'POST',
      token,
      body: { status },
    }
  );

  return response.milestone;
}

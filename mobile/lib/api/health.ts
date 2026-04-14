import { request } from './client';
import type { HealthResponse } from './types';

export async function fetchHealth(baseUrl: string): Promise<HealthResponse> {
  return await request<HealthResponse>(baseUrl, '/health');
}

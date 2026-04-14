import { request } from './client';
import type { AuthUserResponse } from './types';

export async function fetchAuthUser(baseUrl: string, token: string): Promise<AuthUserResponse['user']> {
  const response = await request<AuthUserResponse>(baseUrl, '/v1/auth/me', {
    token,
  });

  return response.user;
}

import { request } from './client';
import type { ChatMessageSummary, ChatThreadSummary } from './types';

export async function fetchChatThreads(baseUrl: string, token: string): Promise<ChatThreadSummary[]> {
  const response = await request<{ threads: ChatThreadSummary[] }>(baseUrl, '/v1/chat/threads', {
    token,
  });

  return response.threads;
}

export async function ensureApplicationChatThread(
  baseUrl: string,
  token: string,
  applicationId: string
): Promise<ChatThreadSummary> {
  const response = await request<{ thread: ChatThreadSummary }>(
    baseUrl,
    `/v1/chat/applications/${applicationId}/thread`,
    {
      method: 'POST',
      token,
    }
  );

  return response.thread;
}

export async function ensureHireChatThread(
  baseUrl: string,
  token: string,
  hireId: string
): Promise<ChatThreadSummary> {
  const response = await request<{ thread: ChatThreadSummary }>(baseUrl, `/v1/chat/hires/${hireId}/thread`, {
    method: 'POST',
    token,
  });

  return response.thread;
}

export async function fetchChatMessages(
  baseUrl: string,
  token: string,
  threadId: string,
  filters?: {
    limit?: number;
  }
): Promise<ChatMessageSummary[]> {
  const response = await request<{ messages: ChatMessageSummary[] }>(
    baseUrl,
    `/v1/chat/threads/${threadId}/messages`,
    {
      token,
      query: {
        limit: filters?.limit,
      },
    }
  );

  return response.messages;
}

export async function sendChatMessage(
  baseUrl: string,
  token: string,
  threadId: string,
  body: string
): Promise<ChatMessageSummary> {
  const response = await request<{ message: ChatMessageSummary }>(
    baseUrl,
    `/v1/chat/threads/${threadId}/messages`,
    {
      method: 'POST',
      token,
      body: { body },
    }
  );

  return response.message;
}

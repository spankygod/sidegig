export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type QueryParams = Record<string, string | number | boolean | undefined>;

type RequestOptions = {
  body?: unknown;
  method?: string;
  token?: string;
  query?: QueryParams;
};

function buildUrl(baseUrl: string, path: string, query?: QueryParams): string {
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

export async function request<T>(baseUrl: string, path: string, options?: RequestOptions): Promise<T> {
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

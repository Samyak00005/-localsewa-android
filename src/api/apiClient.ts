export const API_ORIGIN = 'https://localsewa.com';

const DEFAULT_TIMEOUT_MS = 30000;
const RETRYABLE_STATUS = new Set([502, 503, 504]);

export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;

  constructor(
    message: string,
    status = 0,
    data: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  token?: string | null;
  timeoutMs?: number;
  retryGet?: boolean;
};

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function buildBackendUrl(path: string): string {
  if (
    !path.startsWith('/api/') ||
    /[\\#]/.test(path)
  ) {
    throw new Error('Expected a relative /api/ path.');
  }

  const separator = path.indexOf('?');
  const route =
    separator < 0 ? path : path.slice(0, separator);
  const query =
    separator < 0 ? '' : path.slice(separator + 1);

  if (
    query
      .split('&')
      .filter(Boolean)
      .some(part => {
        const key = part.split('=')[0] ?? '';

        try {
          return decodeURIComponent(key) === 'route';
        } catch {
          return false;
        }
      })
  ) {
    throw new Error('The route parameter is reserved.');
  }

  const encodedRoute =
    encodeURIComponent(route.slice(5));

  return `${API_ORIGIN}/api/index.php?route=${encodedRoute}${
    query ? `&${query}` : ''
  }`;
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const {
    body,
    token,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retryGet = true,
    signal: callerSignal,
    headers: suppliedHeaders,
    method = 'GET',
    ...requestOptions
  } = options;

  const url = buildBackendUrl(path);
  const headers =
    new Headers(suppliedHeaders);

  headers.set('Accept', 'application/json');
  headers.delete('Authorization');

  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`,
    );
  }

  const isForm =
    typeof FormData !== 'undefined' &&
    body instanceof FormData;

  if (
    body !== undefined &&
    !isForm
  ) {
    headers.set(
      'Content-Type',
      'application/json',
    );
  }

  if (isForm) {
    headers.delete('Content-Type');
  }

  const requestBody =
    body === undefined
      ? undefined
      : isForm
        ? (body as FormData)
        : JSON.stringify(body);

  const isGet =
    method.toUpperCase() === 'GET';
  const attempts =
    isGet && retryGet ? 2 : 1;

  for (
    let attempt = 0;
    attempt < attempts;
    attempt += 1
  ) {
    const controller =
      new AbortController();

    let timedOut = false;

    const abortFromCaller = () =>
      controller.abort();

    callerSignal?.addEventListener(
      'abort',
      abortFromCaller,
    );

    if (callerSignal?.aborted) {
      controller.abort();
    }

    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(url, {
        ...requestOptions,
        method,
        headers,
        body: requestBody,
        signal: controller.signal,
        credentials: 'omit',
      });

      const raw =
        await response.text();

      let data: unknown = null;

      try {
        data = raw
          ? JSON.parse(raw)
          : null;
      } catch {
        data = null;
      }

      if (
        RETRYABLE_STATUS.has(
          response.status,
        ) &&
        attempt + 1 < attempts
      ) {
        continue;
      }

      if (
        !response.ok ||
        !isObject(data) ||
        data.success !== true
      ) {
        const message =
          isObject(data) &&
          typeof data.message ===
            'string'
            ? data.message
            : response.ok
              ? 'Server returned an unexpected response. Please try again.'
              : `Request failed (${response.status}). Please try again.`;

        throw new ApiError(
          message,
          response.status,
          isObject(data) &&
          isObject(data.details)
            ? data.details
            : {},
        );
      }

      return data as T;
    } catch (error) {
      if (callerSignal?.aborted) {
        throw new ApiError(
          'Request cancelled.',
          0,
          {code: 'CANCELLED'},
        );
      }

      if (error instanceof ApiError) {
        throw error;
      }

      if (
        attempt + 1 <
        attempts
      ) {
        continue;
      }

      throw new ApiError(
        timedOut
          ? 'Request timed out. Check your connection and try again.'
          : 'Unable to reach Localsewa. Check your internet connection.',
      );
    } finally {
      clearTimeout(timer);

      callerSignal?.removeEventListener(
        'abort',
        abortFromCaller,
      );
    }
  }

  throw new ApiError(
    'Unable to complete the request.',
  );
}

export function errorMessage(
  error: unknown,
): string {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.';
}

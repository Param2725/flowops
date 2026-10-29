export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN_ERROR', details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const buildUrl = (baseUrl, path, query) => {
  const url = new URL(path, baseUrl);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
};

const parseBody = async (response) => {
  if (response.status === 204) return null;
  const type = response.headers.get('content-type') ?? '';
  if (!type.includes('application/json')) return null;
  return response.json().catch(() => null);
};

export const createApiClient = ({
  baseUrl,
  getAccessToken = () => null,
  onUnauthorized,
  fetchImpl = (...args) => fetch(...args),
  timeoutMs = 30000,
}) => {
  const send = async (path, { method, body, query, signal }) => {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const timeout = AbortSignal.timeout(timeoutMs);
    try {
      return await fetchImpl(buildUrl(baseUrl, path, query), {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      });
    } catch (err) {
      if (err.name === 'TimeoutError') {
        throw new ApiError('The request timed out', { code: 'TIMEOUT' });
      }
      if (err.name === 'AbortError') throw err;
      throw new ApiError('Could not reach the server', { code: 'NETWORK_ERROR' });
    }
  };

  const request = async (path, options = {}) => {
    const { method = 'GET', skipAuthRetry = false } = options;
    let response = await send(path, { ...options, method });

    if (response.status === 401 && !skipAuthRetry && onUnauthorized && (await onUnauthorized())) {
      response = await send(path, { ...options, method });
    }

    const data = await parseBody(response);
    if (!response.ok) {
      const error = data?.error ?? {};
      throw new ApiError(error.message ?? (response.statusText || 'Request failed'), {
        status: response.status,
        code: error.code ?? 'HTTP_ERROR',
        details: error.details,
      });
    }
    return data;
  };

  return {
    request,
    get: (path, options) => request(path, { ...options, method: 'GET' }),
    post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
    put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
    patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
    delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  };
};
